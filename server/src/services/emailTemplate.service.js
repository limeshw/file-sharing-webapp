export const buildShareEmailTemplate = ({
  emailFrom,
  downloadLink,
  size,
  expires,
}) => `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Linkify File Share</title>
    </head>
    <body style="font-family: Arial, sans-serif; background:#f4f7fb; padding:24px; color:#1f2937;">
      <div style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:16px; padding:32px; box-shadow:0 10px 30px rgba(15,23,42,0.08);">
        <h1 style="margin-top:0; color:#111827;">Linkify File Share</h1>
        <p><strong>${emailFrom}</strong> shared a file with you.</p>
        <p>Size: ${size}</p>
        <p>Expires in: ${expires}</p>
        <p style="margin:24px 0;">
          <a href="${downloadLink}" style="background:#2563eb; color:#ffffff; text-decoration:none; padding:12px 18px; border-radius:10px; display:inline-block;">
            Open shared file
          </a>
        </p>
        <p>If the button does not work, use this link:</p>
        <p><a href="${downloadLink}">${downloadLink}</a></p>
      </div>
    </body>
  </html>
`;
