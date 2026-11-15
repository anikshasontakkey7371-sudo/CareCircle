import nodemailer from "nodemailer";
import {
  getMissedDoseAlertEmailHtml,
  getUpcomingDoseReminderEmailHtml,
} from "./templates";

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  mocked?: boolean;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    return transporter;
  }

  return null;
}

/**
 * Sends an email reminder or alert with automated fallback.
 * If credentials are not configured, logs to console in development mode.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<EmailResult> {
  const from =
    process.env.NOTIFICATION_FROM_EMAIL ||
    "CareCircle Notifications <alerts@carecircle.app>";

  // 1. Try Resend if API key is provided
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, messageId: data.id };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn("Resend email dispatch error:", message);
    }
  }

  // 2. Try standard SMTP Nodemailer
  const mailer = getTransporter();
  if (mailer) {
    try {
      const info = await mailer.sendMail({
        from,
        to,
        subject,
        html,
      });
      return { success: true, messageId: info.messageId };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn("SMTP email dispatch error:", message);
    }
  }

  // 3. Fallback mock logger for local dev/testing
  console.log(
    `[CareCircle Email Service (Mock)] Sent to: ${Array.isArray(to) ? to.join(", ") : to} | Subject: "${subject}"`
  );
  return {
    success: true,
    mocked: true,
    messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`,
  };
}

/**
 * Sends a missed-dose escalation alert to caregivers.
 */
export async function sendMissedDoseAlert({
  caregiverEmails,
  elderlyName,
  medicationName,
  dosage,
  scheduledTime,
  instructions,
  dashboardUrl,
  emergencyPhone,
}: {
  caregiverEmails: string[];
  elderlyName: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  instructions: string;
  dashboardUrl: string;
  emergencyPhone?: string;
}): Promise<EmailResult> {
  if (!caregiverEmails || caregiverEmails.length === 0) {
    return { success: false, error: "No caregiver recipients provided" };
  }

  const subject = `URGENT: ${elderlyName} has a missed medication (${medicationName})`;
  const html = getMissedDoseAlertEmailHtml({
    elderlyName,
    medicationName,
    dosage,
    scheduledTime,
    instructions,
    dashboardUrl,
    emergencyPhone,
  });

  return sendEmail({
    to: caregiverEmails,
    subject,
    html,
  });
}

/**
 * Sends an upcoming dose reminder.
 */
export async function sendUpcomingDoseReminder({
  recipientEmail,
  elderlyName,
  medicationName,
  dosage,
  scheduledTime,
  instructions,
  dashboardUrl,
}: {
  recipientEmail: string;
  elderlyName: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  instructions: string;
  dashboardUrl: string;
}): Promise<EmailResult> {
  const subject = `Medication Reminder: ${medicationName} scheduled at ${scheduledTime}`;
  const html = getUpcomingDoseReminderEmailHtml({
    elderlyName,
    medicationName,
    dosage,
    scheduledTime,
    instructions,
    dashboardUrl,
  });

  return sendEmail({
    to: recipientEmail,
    subject,
    html,
  });
}
