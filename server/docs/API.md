# Linkify API Documentation

> **Linkify** is a no-login, anonymous file-sharing service. Upload a file, get a sharable link, and optionally protect it with a password or send it via email — no accounts needed.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Standard Response Format](#standard-response-format)
5. [Error Codes Reference](#error-codes-reference)
6. [Rate Limits](#rate-limits)
7. [Allowed File Types](#allowed-file-types)
8. [API Endpoints](#api-endpoints)
   - [Health Check](#1-health-check)
   - [Upload File](#2-upload-file)
   - [Verify Password](#3-verify-password)
   - [Share File by Email](#4-share-file-by-email)
   - [Public File Page](#5-public-file-page)
   - [Download File](#6-download-file)
   - [File Metadata](#7-file-metadata)
9. [End-to-End Flow](#end-to-end-flow)
10. [Postman Collection](#postman-collection)
11. [Environment Variables](#environment-variables)

---

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | v18+ |
| MongoDB | Atlas or local |
| Cloudinary account | Free tier works |
| SMTP service | e.g. Brevo / Gmail |

### Installation

```bash
# 1. Clone the repo and navigate to server
cd server

# 2. Install dependencies
npm install

# 3. Copy the sample environment file
cp .env.sample .env

# 4. Fill in .env values (see Environment Variables section)

# 5. Start in development mode
npm run dev
```

The server will start at `http://localhost:3000`.

---

## Base URL

```
http://localhost:3000
```

> For production deployments, replace with your deployed domain (e.g., `https://api.linkify.app`).

---

## Authentication

**Linkify has no user authentication.** All endpoints are public. Access to password-protected files requires an `accessKey` token, which is obtained by calling the [Verify Password](#3-verify-password) endpoint.

---

## Standard Response Format

All API endpoints return JSON in one of these two shapes:

### ✅ Success

```json
{
  "success": true,
  "message": "Human-readable success message",
  "data": { }
}
```

### ❌ Error

```json
{
  "success": false,
  "message": "Human-readable error message",
  "details": ["optional", "array", "of", "field-level", "errors"]
}
```

> `details` is only present on validation errors (HTTP 422).

---

## Error Codes Reference

| HTTP Status | Meaning | When It Occurs |
|-------------|---------|----------------|
| `400` Bad Request | Invalid input | Missing fields, wrong expiry value, bad UUID |
| `401` Unauthorized | Wrong password / missing access key | Password mismatch or missing `accessKey` for protected file |
| `403` Forbidden | CORS blocked | Request origin not in `ALLOWED_CLIENTS` |
| `404` Not Found | Resource missing | File UUID not found |
| `410` Gone | Link expired | File TTL has passed |
| `413` Payload Too Large | File too big | Upload exceeds 100 MB |
| `415` Unsupported Media Type | Invalid file type | Blocked MIME type or extension |
| `422` Unprocessable Entity | Validation error | Mongoose model constraint failed or email already sent |
| `429` Too Many Requests | Rate limited | Too many requests from the same IP |
| `500` Internal Server Error | Server fault | Cloudinary failure, DB error |

---

## Rate Limits

All limits reset every **1 hour per IP address**. When exceeded, the server returns:

```json
{
  "success": false,
  "message": "Too many requests. Please try again later."
}
```

| Endpoint Group | Default Limit | Environment Variable |
|----------------|--------------|----------------------|
| Upload (`/api/files/upload`, `/api/files`) | 20 req / hour | `UPLOAD_RATE_LIMIT_MAX` |
| Share & Verify (`/api/files/send`, `/api/files/verify-password`) | 60 req / hour | `SHARE_RATE_LIMIT_MAX` |
| View & Download (`/files/*`) | 300 req / hour | `VIEW_RATE_LIMIT_MAX` |

---

## Allowed File Types

| MIME Type | Extensions |
|-----------|-----------|
| `application/pdf` | `.pdf` |
| `image/jpeg` | `.jpg`, `.jpeg` |
| `image/png` | `.png` |
| `image/webp` | `.webp` |
| `image/gif` | `.gif` |
| `application/msword` | `.doc` |
| `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `.docx` |
| `application/zip` | `.zip` |

**Blocked extensions (always rejected regardless of MIME):**
`.exe`, `.js`, `.apk`, `.bat`, `.cmd`, `.com`, `.msi`, `.sh`, `.bash`, `.zsh`, `.ps1`, `.scr`

**Maximum file size:** `100 MB`

---

## API Endpoints

---

### 1. Health Check

Verify that the server is running and reachable.

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/health` |
| **Auth** | None |
| **Rate Limit** | None |

#### Request

No body or headers required.

```bash
curl http://localhost:3000/health
```

#### Response — `200 OK`

```json
{
  "success": true,
  "message": "Linkify backend is healthy"
}
```

---

### 2. Upload File

Upload a file and receive a shareable link, QR code, and optional download URL.

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `/api/files/upload` |
| **Alias URL** | `/api/files` *(legacy compatibility)* |
| **Content-Type** | `multipart/form-data` |
| **Auth** | None |
| **Rate Limit** | 20 uploads / hour per IP |

#### Request Form Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `myfile` | `file` | ✅ Yes | Max 100 MB; see allowed types above |
| `expiry` | `string` | ✅ Yes | One of: `1h`, `24h`, `7d` |
| `password` | `string` | ❌ No | Min 6 characters if provided |

#### cURL Example

```bash
curl -X POST http://localhost:3000/api/files/upload \
  -F "myfile=@/path/to/document.pdf" \
  -F "expiry=24h" \
  -F "password=secret123"
```

#### cURL Example — No Password

```bash
curl -X POST http://localhost:3000/api/files/upload \
  -F "myfile=@/path/to/photo.png" \
  -F "expiry=7d"
```

#### Response — `201 Created`

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "uuid": "8b42a770-a522-4c82-a953-a23b5cb87a9f",
    "shareUrl": "http://localhost:3000/files/8b42a770-a522-4c82-a953-a23b5cb87a9f",
    "downloadPageUrl": "http://localhost:3000/files/8b42a770-a522-4c82-a953-a23b5cb87a9f",
    "downloadUrl": "http://localhost:3000/files/download/8b42a770-a522-4c82-a953-a23b5cb87a9f",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "expiresAt": "2026-05-15T10:00:00.000Z",
    "hasPassword": true,
    "originalName": "document.pdf",
    "size": 102400,
    "mimeType": "application/pdf"
  }
}
```

#### Response Fields Explained

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | `string` | Unique identifier for this file; used in all subsequent requests |
| `shareUrl` | `string` | Link to the public download page |
| `downloadPageUrl` | `string` | Same as `shareUrl` — the page shown to recipients |
| `downloadUrl` | `string` | Direct download link (bypasses page) |
| `qrCode` | `string` | Base64-encoded PNG QR code pointing to the share URL |
| `expiresAt` | `ISO 8601 date` | When the file link will expire and be deleted |
| `hasPassword` | `boolean` | `true` if a password was set |
| `originalName` | `string` | Original filename as uploaded |
| `size` | `number` | File size in bytes |
| `mimeType` | `string` | Detected MIME type |

#### Common Error Responses

| Status | Message |
|--------|---------|
| `400` | `"Invalid expiry selection. Allowed values are 1h, 24h, or 7d."` |
| `400` | `"Password must be at least 6 characters long."` |
| `400` | `"No file uploaded."` |
| `413` | `"File size exceeds 100MB limit."` |
| `415` | `"Unsupported file type."` |
| `429` | `"Too many requests. Please try again later."` |

---

### 3. Verify Password

Unlock a password-protected file to obtain a temporary `accessKey` for downloading.

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `/api/files/verify-password` |
| **Content-Type** | `application/json` |
| **Auth** | None |
| **Rate Limit** | 60 requests / hour per IP |

#### Request Body

```json
{
  "uuid": "8b42a770-a522-4c82-a953-a23b5cb87a9f",
  "password": "secret123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uuid` | `string` | ✅ Yes | The file's UUID from upload response |
| `password` | `string` | ✅ Yes | The password set during upload |

#### cURL Example

```bash
curl -X POST http://localhost:3000/api/files/verify-password \
  -H "Content-Type: application/json" \
  -d '{"uuid": "8b42a770-a522-4c82-a953-a23b5cb87a9f", "password": "secret123"}'
```

#### Response — `200 OK`

```json
{
  "success": true,
  "message": "Password verified successfully",
  "data": {
    "uuid": "8b42a770-a522-4c82-a953-a23b5cb87a9f",
    "downloadUrl": "http://localhost:3000/files/download/8b42a770-a522-4c82-a953-a23b5cb87a9f?accessKey=eyJhbGciOiJIUzI1NiJ9...",
    "accessKey": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | `string` | The file UUID |
| `downloadUrl` | `string` | Direct download URL with `accessKey` embedded as query parameter |
| `accessKey` | `string` | Signed token; append as `?accessKey=<value>` to download URLs |

> ⚠️ **The `accessKey` is short-lived.** Use it immediately to initiate the download. Treat it as a one-time-use secret — do not log or share it.

#### Common Error Responses

| Status | Message |
|--------|---------|
| `400` | `"Invalid file identifier."` — UUID format is wrong |
| `400` | `"Password is required."` — Password field missing |
| `400` | `"This file does not require password verification."` — File has no password |
| `401` | `"Invalid password."` — Wrong password |
| `404` | `"File not found."` |
| `410` | `"Link Expired"` — File TTL has passed |

---

### 4. Share File by Email

Send the file's shareable link to a recipient's email address.

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `/api/files/send` |
| **Content-Type** | `application/json` |
| **Auth** | None |
| **Rate Limit** | 60 requests / hour per IP |

> ⚠️ **One email per file.** Once an email has been sent for a file, subsequent requests to `/api/files/send` for the same `uuid` will be rejected with `422`.

#### Request Body

```json
{
  "uuid": "8b42a770-a522-4c82-a953-a23b5cb87a9f",
  "emailTo": "recipient@example.com",
  "emailFrom": "sender@example.com"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uuid` | `string` | ✅ Yes | The file's UUID from upload response |
| `emailTo` | `string` | ✅ Yes | Recipient's email address |
| `emailFrom` | `string` | ✅ Yes | Sender's email address (shown in the email body) |

#### cURL Example

```bash
curl -X POST http://localhost:3000/api/files/send \
  -H "Content-Type: application/json" \
  -d '{
    "uuid": "8b42a770-a522-4c82-a953-a23b5cb87a9f",
    "emailTo": "recipient@example.com",
    "emailFrom": "sender@example.com"
  }'
```

#### Response — `200 OK`

```json
{
  "success": true,
  "message": "Share email sent successfully"
}
```

> No `data` object is returned. A `200` with `success: true` means the email was dispatched.

#### Common Error Responses

| Status | Message |
|--------|---------|
| `400` | `"Invalid file identifier."` |
| `400` | `"uuid, emailTo, and emailFrom are required."` |
| `404` | `"File not found."` |
| `410` | `"Link Expired"` |
| `422` | `"Email already sent for this file."` |

---

### 5. Public File Page

Returns an HTML page (rendered with EJS) showing the file's details — name, size, expiry, and a download button. This is the page recipients see when they open a share link.

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/files/:uuid` |
| **Response Type** | `text/html` |
| **Auth** | None |
| **Rate Limit** | 300 requests / hour per IP |

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | `string` | ✅ Yes | The file's UUID |

#### cURL Example

```bash
curl http://localhost:3000/files/8b42a770-a522-4c82-a953-a23b5cb87a9f
```

#### Behavior

- If the file is **active**: renders the download page with file details.
- If the file is **expired**: renders the same page with an expiry notice (`410 Gone`).
- If the UUID is **not found**: renders an error page (`404 Not Found`).
- If the file is **password-protected**: the page prompts for a password before showing the download button.

> This endpoint renders HTML, not JSON. For programmatic access to file metadata, use [File Metadata](#7-file-metadata) instead.

---

### 6. Download File

Streams the actual file content to the client. Automatically increments the download counter.

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/files/download/:uuid` |
| **Auth** | None (or `accessKey` query param for password-protected files) |
| **Rate Limit** | 300 requests / hour per IP |

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | `string` | ✅ Yes | The file's UUID |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `accessKey` | `string` | Conditional | Required only if `hasPassword` is `true`. Obtain via [Verify Password](#3-verify-password). |

#### Response Headers

```http
Content-Type: <file-mime-type>
Content-Disposition: attachment; filename="original-filename.pdf"; filename*=UTF-8''original-filename.pdf
Content-Length: <size-in-bytes>
Cache-Control: no-store
```

#### cURL Examples

**Download a public (no password) file:**

```bash
curl -OJ http://localhost:3000/files/download/8b42a770-a522-4c82-a953-a23b5cb87a9f
```

**Download a password-protected file (after verifying password):**

```bash
# Step 1 — verify password and get accessKey
ACCESS_KEY=$(curl -s -X POST http://localhost:3000/api/files/verify-password \
  -H "Content-Type: application/json" \
  -d '{"uuid": "8b42a770-a522-4c82-a953-a23b5cb87a9f", "password": "secret123"}' \
  | jq -r '.data.accessKey')

# Step 2 — download using accessKey
curl -OJ "http://localhost:3000/files/download/8b42a770-a522-4c82-a953-a23b5cb87a9f?accessKey=$ACCESS_KEY"
```

#### Common Error Responses

| Status | Message |
|--------|---------|
| `400` | `"Invalid file identifier."` |
| `401` | `"Password verification required before download."` — `accessKey` missing or invalid |
| `404` | `"File not found."` |
| `410` | `"Link Expired"` |
| `500` | `"Unable to download file from storage."` — Cloudinary unreachable |

---

### 7. File Metadata

Returns JSON metadata about a file without triggering a download or incrementing the download counter.

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `/files/meta/:uuid` |
| **Response Type** | `application/json` |
| **Auth** | None |
| **Rate Limit** | 300 requests / hour per IP |

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uuid` | `string` | ✅ Yes | The file's UUID |

#### cURL Example

```bash
curl http://localhost:3000/files/meta/8b42a770-a522-4c82-a953-a23b5cb87a9f
```

#### Response — `200 OK`

```json
{
  "success": true,
  "message": "File fetched successfully",
  "data": {
    "uuid": "8b42a770-a522-4c82-a953-a23b5cb87a9f",
    "fileName": "document.pdf",
    "fileSize": "100 KB",
    "downloadLink": "http://localhost:3000/files/download/8b42a770-a522-4c82-a953-a23b5cb87a9f",
    "expiresAt": "2026-05-15T10:00:00.000Z",
    "expiryLabel": "24 hours",
    "hasPassword": false,
    "downloadCount": 3
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | `string` | Unique file identifier |
| `fileName` | `string` | Original filename |
| `fileSize` | `string` | Human-readable size (e.g., `"1.5 MB"`) |
| `downloadLink` | `string` | Direct download endpoint URL |
| `expiresAt` | `ISO 8601 date` | Expiry timestamp |
| `expiryLabel` | `string` | Human-readable label: `"1 hour"`, `"24 hours"`, or `"7 days"` |
| `hasPassword` | `boolean` | Whether a password is required to download |
| `downloadCount` | `number` | How many times the file has been downloaded |

#### Common Error Responses

| Status | Message |
|--------|---------|
| `400` | `"Invalid file identifier."` |
| `404` | `"File not found."` |
| `410` | `"Link Expired"` |

---

## End-to-End Flow

Here's the complete journey from upload to download, to help you understand how the endpoints connect.

```
┌──────────────────────────────────────────────────────────┐
│                     UPLOAD FLOW                          │
│                                                          │
│  POST /api/files/upload                                  │
│  ────────────────────────────────────────────────────    │
│  Form: myfile, expiry, password (optional)               │
│                                                          │
│  ← Returns: uuid, shareUrl, qrCode, expiresAt, ...       │
│                                                          │
└───────────────────────────┬──────────────────────────────┘
                            │ Save uuid
                            ▼
┌──────────────────────────────────────────────────────────┐
│                  SHARE OPTIONS                           │
│                                                          │
│  Option A: Share the shareUrl directly                   │
│  Option B: POST /api/files/send  ← send email            │
│  Option C: Display qrCode image for scanning             │
│                                                          │
└───────────────────────────┬──────────────────────────────┘
                            │ Recipient opens link
                            ▼
┌──────────────────────────────────────────────────────────┐
│               RECIPIENT'S DOWNLOAD FLOW                  │
│                                                          │
│  GET /files/:uuid  ← HTML download page                  │
│   or                                                     │
│  GET /files/meta/:uuid  ← JSON metadata check            │
│                                                          │
│  If hasPassword = true:                                  │
│    POST /api/files/verify-password  ← get accessKey      │
│    GET /files/download/:uuid?accessKey=<key>             │
│                                                          │
│  If hasPassword = false:                                 │
│    GET /files/download/:uuid  ← direct download          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Quick Test Sequence (no password)

```bash
# 1. Upload
RESPONSE=$(curl -s -X POST http://localhost:3000/api/files/upload \
  -F "myfile=@test.pdf" -F "expiry=1h")
UUID=$(echo $RESPONSE | jq -r '.data.uuid')
echo "UUID: $UUID"

# 2. Check metadata
curl http://localhost:3000/files/meta/$UUID | jq

# 3. Download
curl -OJ http://localhost:3000/files/download/$UUID
```

### Quick Test Sequence (with password)

```bash
# 1. Upload with password
RESPONSE=$(curl -s -X POST http://localhost:3000/api/files/upload \
  -F "myfile=@test.pdf" -F "expiry=24h" -F "password=mypassword")
UUID=$(echo $RESPONSE | jq -r '.data.uuid')

# 2. Verify password to get access key
VR=$(curl -s -X POST http://localhost:3000/api/files/verify-password \
  -H "Content-Type: application/json" \
  -d "{\"uuid\": \"$UUID\", \"password\": \"mypassword\"}")
ACCESS_KEY=$(echo $VR | jq -r '.data.accessKey')

# 3. Download with access key
curl -OJ "http://localhost:3000/files/download/$UUID?accessKey=$ACCESS_KEY"
```

---

## Postman Collection

A ready-to-import Postman collection is included at:

```
postman/Linkify.postman_collection.json
```

### How to Import

1. Open **Postman**
2. Click **Import** (top-left)
3. Drag and drop `Linkify.postman_collection.json` or browse to it
4. The collection **"Linkify Backend"** will appear in your sidebar

### Collection Variables

After importing, set these collection-level variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `baseUrl` | `http://localhost:3000` | Change to your deployed URL for production testing |
| `uuid` | *(empty)* | Paste the `uuid` from an Upload response here |
| `accessKey` | *(empty)* | Paste the `accessKey` from a Verify Password response here |

### Recommended Test Order

1. **Health Check** — confirm the server is up
2. **Upload File** — select a test file, set `expiry=24h`; copy the `uuid` from the response
3. **File Metadata API** — paste `uuid`; verify file info is returned
4. **Verify Password** *(if uploaded with password)* — paste `uuid` + password; copy `accessKey`
5. **Download File** — use `uuid` (and `accessKey` if needed); file should save locally
6. **Share File by Email** *(optional)* — paste `uuid` + real email addresses; check inbox
7. **Public File Page** — open `{{baseUrl}}/files/{{uuid}}` in browser to see the HTML page

---

## Environment Variables

Copy `.env.sample` to `.env` and fill in every value before starting the server.

```env
# ─── Server ───────────────────────────────────────────────
NODE_ENV=development          # "development" or "production"
HOST=localhost
PORT=3000
APP_BASE_URL=http://localhost:3000   # Used to build share URLs and QR codes
APP_SECRET=change-this-to-a-long-random-secret   # Signs accessKey tokens — keep secret!
JSON_LIMIT=1mb                # Max size of JSON request bodies

# ─── Database ─────────────────────────────────────────────
MONGO_CONNECTION_URL=mongodb+srv://username:password@cluster.mongodb.net/linkify

# ─── Cloudinary (file storage) ────────────────────────────
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=linkify/files     # Folder inside Cloudinary to store files

# ─── CORS ─────────────────────────────────────────────────
# Comma-separated list of allowed frontend origins
ALLOWED_CLIENTS=http://localhost:3000,http://localhost:5173

# ─── Rate Limits ──────────────────────────────────────────
UPLOAD_RATE_LIMIT_MAX=20      # Max uploads per IP per hour
SHARE_RATE_LIMIT_MAX=60       # Max share/verify requests per IP per hour
VIEW_RATE_LIMIT_MAX=300       # Max view/download requests per IP per hour

# ─── Email (SMTP) ─────────────────────────────────────────
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
MAIL_USER=your-smtp-user
MAIL_PASSWORD=your-smtp-password
MAIL_FROM_NAME=Linkify
MAIL_FROM_EMAIL=no-reply@example.com
```

> ⚠️ **Never commit your real `.env` file.** The `.gitignore` already excludes it. Only `.env.sample` should be committed.

---

## Notes for Developers

- **File storage** is handled entirely by Cloudinary. MongoDB only stores metadata (UUID, URL, expiry, password hash, etc.).
- **Expired files** are cleaned up automatically by a `node-cron` job that runs on a schedule — both the Cloudinary asset and the MongoDB record are deleted.
- **Password hashing** uses `bcrypt` with 10 salt rounds. Plaintext passwords are never stored.
- **`accessKey` tokens** are signed JWTs (using `APP_SECRET`) that bind a specific `uuid`. They expire shortly after issuance.
- **`POST /api/files`** is an alias for `POST /api/files/upload`, kept for legacy frontend compatibility.
- The `/files/:uuid` endpoint renders an **HTML page** (EJS template), not JSON. Use `/files/meta/:uuid` for programmatic metadata access.
