import axios from "axios";
import { env } from "../config/env.js";
import { buildShareEmailTemplate } from "./emailTemplate.service.js";

const maskEmail = (value = "") => {
  const [localPart = "", domain = ""] = String(value).split("@");

  if (!localPart || !domain) {
    return "invalid-email";
  }

  const visiblePart = localPart.slice(0, 2);
  return `${visiblePart}${"*".repeat(Math.max(localPart.length - 2, 0))}@${domain}`;
};

const logEmailEvent = (eventName, details = {}) => {
  console.log(
    JSON.stringify({
      event: eventName,
      timestamp: new Date().toISOString(),
      ...details,
    }),
  );
};

export const verifyEmailTransport = async () => {
  if (!env.email.apiKey || !env.email.senderEmail) {
    if (env.nodeEnv === "production") {
      throw new Error("Brevo email provider is not fully configured (missing BREVO_API_KEY or BREVO_SENDER_EMAIL).");
    }
    console.warn("Brevo email provider is not configured. Email sending is disabled in this environment.");
    return false;
  }

  try {
    const response = await axios.get("https://api.brevo.com/v3/account", {
      headers: {
        "api-key": env.email.apiKey,
        "accept": "application/json",
      },
      timeout: 5000, // 5 seconds timeout
    });

    if (response.status === 200) {
      logEmailEvent("email_provider_ready", {
        provider: "brevo",
        senderEmail: env.email.senderEmail,
      });
      return true;
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    console.error(`Brevo API key validation failed: ${errorMsg}`);
    
    if (env.nodeEnv === "production") {
      throw new Error(`Brevo email provider verification failed: ${errorMsg}`);
    }
    return false;
  }
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!to || !EMAIL_REGEX.test(to)) {
    throw new Error("Invalid recipient email address.");
  }
  if (!subject) {
    throw new Error("Email subject is required.");
  }
  if (!html) {
    throw new Error("Email HTML body is required.");
  }
  if (!env.email.apiKey) {
    throw new Error("Brevo API key is not configured.");
  }
  if (!env.email.senderEmail) {
    throw new Error("Brevo sender email is not configured.");
  }

  const startedAt = Date.now();
  logEmailEvent("email_send_started", {
    to: maskEmail(to),
    subject,
    provider: "brevo",
  });

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: env.email.senderName,
          email: env.email.senderEmail,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text || undefined,
      },
      {
        headers: {
          "api-key": env.email.apiKey,
          "content-type": "application/json",
          "accept": "application/json",
        },
        timeout: 10000, // 10 seconds timeout
      }
    );

    logEmailEvent("email_send_succeeded", {
      to: maskEmail(to),
      subject,
      provider: "brevo",
      durationMs: Date.now() - startedAt,
      messageId: response.data?.messageId || null,
    });

    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    const errorCode = error.response?.data?.code || error.code || null;
    const responseCode = error.response?.status || null;

    logEmailEvent("email_send_failed", {
      to: maskEmail(to),
      subject,
      provider: "brevo",
      durationMs: Date.now() - startedAt,
      errorCode,
      responseCode,
      errorMessage: errorMsg,
    });

    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      throw new Error(`Email sending timed out: ${errorMsg}`);
    }
    throw new Error(`Brevo API failure: ${errorMsg}`);
  }
};

export const sendFileShareEmail = async ({
  to,
  emailFrom,
  fileName,
  fileSize,
  downloadLink,
  expires,
}) => {
  if (!downloadLink) {
    throw new Error("Missing file download link.");
  }
  if (!fileName) {
    throw new Error("File name is required.");
  }
  if (!fileSize) {
    throw new Error("File size is required.");
  }
  if (!emailFrom || !EMAIL_REGEX.test(emailFrom)) {
    throw new Error("Invalid sender email address.");
  }

  const html = buildShareEmailTemplate({
    emailFrom,
    downloadLink,
    size: fileSize,
    expires,
    fileName,
  });

  const text = `${emailFrom} shared a file with you: ${fileName} (${fileSize}). Download link: ${downloadLink}`;

  return sendEmail({
    to,
    subject: "File Shared With You",
    html,
    text,
  });
};
