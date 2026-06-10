import nodemailer from "nodemailer";

import { env } from "../config/env.js";

let transporter;

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

export const isSmtpConfigured = () =>
  Boolean(
    env.smtp.host &&
      env.smtp.user &&
      env.smtp.pass &&
      env.smtp.fromName &&
      env.smtp.fromEmail,
  );

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  if (!isSmtpConfigured()) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
    connectionTimeout: env.smtp.connectionTimeout,
    greetingTimeout: env.smtp.greetingTimeout,
    socketTimeout: env.smtp.socketTimeout,
  });

  return transporter;
};

export const verifyEmailTransport = async () => {
  const activeTransporter = getTransporter();

  if (!activeTransporter) {
    if (env.nodeEnv === "production") {
      throw new Error("SMTP is not configured.");
    }

    console.warn("SMTP is not configured. Email sending is disabled in this environment.");
    return false;
  }

  const startedAt = Date.now();

  try {
    await activeTransporter.verify();
    logEmailEvent("email_transport_verified", {
      smtpHost: env.smtp.host,
      smtpPort: env.smtp.port,
      durationMs: Date.now() - startedAt,
    });
    return true;
  } catch (error) {
    logEmailEvent("email_transport_verify_failed", {
      smtpHost: env.smtp.host,
      smtpPort: env.smtp.port,
      durationMs: Date.now() - startedAt,
      errorCode: error?.code || null,
      errorCommand: error?.command || null,
      responseCode: error?.responseCode || null,
      errorMessage: error?.message || "Unknown SMTP verification error",
    });
    throw error;
  }
};

export const sendMail = async ({ to, subject, text, html }) => {
  const activeTransporter = getTransporter();

  if (!activeTransporter) {
    throw new Error("SMTP is not configured.");
  }

  const startedAt = Date.now();

  logEmailEvent("email_send_started", {
    to: maskEmail(to),
    subject,
    smtpHost: env.smtp.host,
    smtpPort: env.smtp.port,
  });

  try {
    const result = await activeTransporter.sendMail({
      from: `"${env.smtp.fromName}" <${env.smtp.fromEmail}>`,
      to,
      subject,
      text,
      html,
    });

    logEmailEvent("email_send_succeeded", {
      to: maskEmail(to),
      subject,
      durationMs: Date.now() - startedAt,
      messageId: result?.messageId || null,
      accepted: result?.accepted || [],
      rejected: result?.rejected || [],
      response: result?.response || null,
    });

    return result;
  } catch (error) {
    logEmailEvent("email_send_failed", {
      to: maskEmail(to),
      subject,
      durationMs: Date.now() - startedAt,
      errorCode: error?.code || null,
      errorCommand: error?.command || null,
      responseCode: error?.responseCode || null,
      errorMessage: error?.message || "Unknown SMTP error",
    });
    throw error;
  }
};
