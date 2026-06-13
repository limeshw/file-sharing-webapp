const sanitizeHtml = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
};

export const buildShareEmailTemplate = ({
  emailFrom,
  downloadLink,
  size,
  expires,
  fileName,
}) => `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Linkify File Share</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8fafc;
          color: #334155;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          width: 100%;
          table-layout: fixed;
          background-color: #f8fafc;
          padding: 40px 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }
        .header {
          background: linear-gradient(135deg, #4f46e5, #06b6d4);
          padding: 40px 32px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          font-size: 28px;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.03em;
        }
        .content {
          padding: 32px;
        }
        .intro {
          font-size: 16px;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 24px;
        }
        .file-card {
          background-color: #f8fafc;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 28px;
          border: 1px solid #e2e8f0;
        }
        .file-info {
          margin-bottom: 16px;
        }
        .file-info:last-child {
          margin-bottom: 0;
        }
        .label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .value {
          font-size: 15px;
          color: #0f172a;
          font-weight: 600;
          word-break: break-all;
        }
        .btn-container {
          text-align: center;
          margin: 32px 0;
        }
        .btn {
          display: inline-block;
          background-color: #4f46e5;
          color: #ffffff !important;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          padding: 14px 32px;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -2px rgba(79, 70, 229, 0.2);
        }
        .footer {
          background-color: #f8fafc;
          padding: 24px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          border-top: 1px solid #f1f5f9;
        }
        .footer a {
          color: #64748b;
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>Linkify</h1>
          </div>
          <div class="content">
            <p class="intro">
              <strong>${sanitizeHtml(emailFrom)}</strong> shared a file with you via Linkify.
            </p>
            
            <div class="file-card">
              <div class="file-info">
                <div class="label">File Name</div>
                <div class="value">${sanitizeHtml(fileName)}</div>
              </div>
              <div class="file-info">
                <div class="label">File Size</div>
                <div class="value">${size}</div>
              </div>
              <div class="file-info">
                <div class="label">Expires In</div>
                <div class="value">${expires}</div>
              </div>
            </div>

            <div class="btn-container">
              <a href="${downloadLink}" class="btn">Download Shared File</a>
            </div>

            <p class="intro" style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 24px;">
              If the button above does not work, copy and paste this URL into your browser:<br>
              <a href="${downloadLink}" style="color: #4f46e5; word-break: break-all;">${downloadLink}</a>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated message from Linkify. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    </body>
  </html>
`;
