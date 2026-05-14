# Linkify API Documentation

Base URL:

```text
http://localhost:3000
```

## Response Format

Success:

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Invalid file type"
}
```

## 1. Health Check

- Method: `GET`
- URL: `/health`

## 2. Upload File

- Method: `POST`
- URL: `/api/files/upload`
- Compatibility URL: `/api/files`
- Content-Type: `multipart/form-data`

Form fields:

- `myfile` required file
- `expiry` required value: `1h`, `24h`, or `7d`
- `password` optional, minimum 6 characters

Allowed types:

- PDF
- Images
- DOC
- DOCX
- ZIP

Blocked examples:

- `.exe`
- `.js`
- `.apk`
- `.bat`
- shell scripts
- unknown MIME types

Sample response:

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "uuid": "8b42a770-a522-4c82-a953-a23b5cb87a9f",
    "shareUrl": "http://localhost:3000/files/8b42a770-a522-4c82-a953-a23b5cb87a9f",
    "downloadPageUrl": "http://localhost:3000/files/8b42a770-a522-4c82-a953-a23b5cb87a9f",
    "downloadUrl": "http://localhost:3000/files/download/8b42a770-a522-4c82-a953-a23b5cb87a9f",
    "qrCode": "data:image/png;base64,...",
    "expiresAt": "2026-05-14T04:00:00.000Z",
    "hasPassword": false,
    "originalName": "resume.pdf",
    "size": 58213,
    "mimeType": "application/pdf"
  }
}
```

## 3. Verify Password

- Method: `POST`
- URL: `/api/files/verify-password`
- Content-Type: `application/json`

Request body:

```json
{
  "uuid": "8b42a770-a522-4c82-a953-a23b5cb87a9f",
  "password": "secret123"
}
```

Response:

```json
{
  "success": true,
  "message": "Password verified successfully",
  "data": {
    "uuid": "8b42a770-a522-4c82-a953-a23b5cb87a9f",
    "downloadUrl": "http://localhost:3000/files/download/8b42a770-a522-4c82-a953-a23b5cb87a9f?accessKey=...",
    "accessKey": "..."
  }
}
```

## 4. Share File by Email

- Method: `POST`
- URL: `/api/files/send`
- Content-Type: `application/json`

Request body:

```json
{
  "uuid": "8b42a770-a522-4c82-a953-a23b5cb87a9f",
  "emailTo": "receiver@example.com",
  "emailFrom": "sender@example.com"
}
```

## 5. Public File Page

- Method: `GET`
- URL: `/files/:uuid`

Behavior:

- Shows file metadata page
- Shows link-expired state when expired
- Indicates whether password verification is required

## 6. Download File

- Method: `GET`
- URL: `/files/download/:uuid`

Behavior:

- Redirects to Cloudinary asset URL
- Increments `downloadCount`
- Requires `accessKey` query string for password-protected files

## 7. File Metadata API

- Method: `GET`
- URL: `/files/meta/:uuid`

Response fields:

- `uuid`
- `fileName`
- `fileSize`
- `downloadLink`
- `expiresAt`
- `expiryLabel`
- `hasPassword`
- `downloadCount`

## Rate Limits

- Upload routes: 20 requests per hour per IP by default
- Share routes: 60 requests per hour per IP by default

## Postman Usage

Import:

- [postman/Linkify.postman_collection.json](C:/Users/Limesh%20Warude/OneDrive/Desktop/WebDeveloppment/Projects/File-Sharing-WebApp/server/postman/Linkify.postman_collection.json)

Set collection variable:

- `baseUrl = http://localhost:3000`
