import { Resend } from "resend";

import { env } from "../config/env.js";

let resendClient;

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
    env.email.provider === "resend" &&
      env.email.resendApiKey &&
      env.email.fromEmail,
  );

const getEmailClient = () => {
  if (resendClient) {
    return resendClient;
  }

  if (!isSmtpConfigured()) {
    return null;
  }

  resendClient = new Resend(env.email.resendApiKey);

  return resendClient;
};

export const verifyEmailTransport = async () => {
  const activeProvider = env.email.provider;
  const activeClient = getEmailClient();

  if (!activeClient) {
    if (env.nodeEnv === "production") {
      throw new Error("Email provider is not configured.");
    }

    console.warn("Email provider is not configured. Email sending is disabled in this environment.");
    return false;
  }

  logEmailEvent("email_provider_ready", {
    provider: activeProvider,
    fromEmail: env.email.fromEmail,
  });

  return true;
};

export const sendMail = async ({ to, subject, text, html }) => {
  const activeClient = getEmailClient();

  if (!activeClient) {
    throw new Error("Email provider is not configured.");
  }

  const startedAt = Date.now();

  logEmailEvent("email_send_started", {
    to: maskEmail(to),
    subject,
    provider: env.email.provider,
  });

  try {
    const { data, error } = await activeClient.emails.send({
      from: `${env.email.fromName} <${env.email.fromEmail}>`,
      to,
      subject,
      text: text || undefined,
      html,
    });

    if (error) {
      throw error;
    }

    logEmailEvent("email_send_succeeded", {
      to: maskEmail(to),
      subject,
      provider: env.email.provider,
      durationMs: Date.now() - startedAt,
      messageId: data?.id || null,
    });

    return data;
  } catch (error) {
    logEmailEvent("email_send_failed", {
      to: maskEmail(to),
      subject,
      provider: env.email.provider,
      durationMs: Date.now() - startedAt,
      errorCode: error?.code || null,
      responseCode: error?.statusCode || error?.response?.status || null,
      errorMessage: error?.message || "Unknown email provider error",
    });
    throw error;
  }
};
