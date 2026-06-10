# Linkify Backend

Linkify is a no-login file-sharing backend built with Node.js, Express, MongoDB, Multer, and Cloudinary.

## Entry Point

There is only one backend startup file now:

- [src/app.js](C:/Users/Limesh%20Warude/OneDrive/Desktop/WebDeveloppment/Projects/File-Sharing-WebApp/server/src/app.js)

Run it with:

```bash
npm run dev
```

## Cleaned Up

- Removed duplicate startup files and legacy helper script files.
- Removed old empty top-level architecture folders.
- Removed the old mixed upload setup using `multer-storage-cloudinary`.
- Kept one clear upload flow:
  1. Multer parses the incoming file in memory.
  2. Cloudinary upload happens inside a service.
  3. MongoDB stores only metadata.

## Final Structure

```text
src/
├── app.js
├── config/
├── constants/
├── controllers/
├── cron/
├── middlewares/
├── models/
├── routes/
├── services/
├── utils/
├── validators/
└── views/
public/
docs/
postman/
```

## Features

- Single file upload up to 10MB
- Allowed file types: PDF, images, DOC, DOCX, ZIP
- Dangerous file blocking by MIME type and extension
- Cloudinary-backed storage
- UUID share links
- QR code generation
- Optional password protection with `bcrypt`
- Expiry options: `1h`, `24h`, `7d`
- Expired-link cleanup with `node-cron`
- Download count tracking
- Centralized error handling
- Rate limiting, logging, compression, CORS, and Helmet

## Installation

```bash
npm install
```

Create `.env` from [.env.sample](C:/Users/Limesh%20Warude/OneDrive/Desktop/WebDeveloppment/Projects/File-Sharing-WebApp/server/.env.sample).

## Scripts

```bash
npm run dev
npm start
```

## Environment Variables

```env
NODE_ENV=development
HOST=localhost
PORT=3000
APP_BASE_URL=http://localhost:3000
FRONTEND_BASE_URL=http://localhost:5173
APP_SECRET=change-this-to-a-long-random-secret
JSON_LIMIT=1mb

MONGO_CONNECTION_URL=mongodb+srv://username:password@cluster.mongodb.net/linkify

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=linkify/files

ALLOWED_CLIENTS=http://localhost:3000,http://localhost:5173,http://localhost:5000
UPLOAD_RATE_LIMIT_MAX=20
SHARE_RATE_LIMIT_MAX=60

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_CONNECTION_TIMEOUT_MS=10000
SMTP_GREETING_TIMEOUT_MS=10000
SMTP_SOCKET_TIMEOUT_MS=15000
MAIL_USER=your-smtp-user
MAIL_PASSWORD=your-smtp-password
MAIL_FROM_NAME=Linkify
MAIL_FROM_EMAIL=no-reply@example.com
```

## API Docs

Detailed API documentation:

- [docs/API.md](C:/Users/Limesh%20Warude/OneDrive/Desktop/WebDeveloppment/Projects/File-Sharing-WebApp/server/docs/API.md)

Postman collection:

- [postman/Linkify.postman_collection.json](C:/Users/Limesh%20Warude/OneDrive/Desktop/WebDeveloppment/Projects/File-Sharing-WebApp/server/postman/Linkify.postman_collection.json)

## Main Routes

- `POST /api/files/upload`
- `POST /api/files`
- `POST /api/files/verify-password`
- `POST /api/files/send`
- `GET /files/:uuid`
- `GET /files/download/:uuid`
- `GET /files/meta/:uuid`
- `GET /health`

## Notes

- `POST /api/files` is kept for compatibility with the older frontend flow.
- Set a real `APP_SECRET` before production deployment.
- Set `FRONTEND_BASE_URL` to your public frontend domain so shared links and emails open the SPA flow.
- Expired files are removed from both MongoDB and Cloudinary.
