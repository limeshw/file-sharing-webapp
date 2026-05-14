import nodemailer from "nodemailer";

import { env } from "../config/env.js";

let transporter;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) {
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
  });

  return transporter;
};

export const sendMail = async ({ to, subject, text, html }) => {
  const activeTransporter = getTransporter();

  if (!activeTransporter) {
    throw new Error("SMTP is not configured.");
  }

  return activeTransporter.sendMail({
    from: `"${env.smtp.fromName}" <${env.smtp.fromEmail}>`,
    to,
    subject,
    text,
    html,
  });
};
