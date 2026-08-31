import { PubSub, Message } from "@google-cloud/pubsub";

/**
 * ============================================================================
 * 📬 PUBSUB SERVICE: GOOGLE CLOUD PUB/SUB PUBLISHER & BACKGROUND SUBSCRIBER
 * ============================================================================
 */

export interface CliffPingPayload {
  recipientEmail: string;
  conceptTitle: string;
  currentRetentionPct: number;
  urgency: string;
  subject: string;
  teaserQuestion: string;
  zineMessage: string;
  triggeredBy: string;
}

export interface PubSubNotificationLog {
  id: string;
  recipientEmail: string;
  conceptTitle: string;
  editorialSubject: string;
  teaserQuestion: string;
  zineMessage: string;
  dispatchedAt: string;
  status: "delivered" | "queued" | "failed";
  gcpPubSubMessageId: string;
}

export const inMemoryPubSubAuditLogs: PubSubNotificationLog[] = [];

let pubsubClient: PubSub | null = null;
const projectId = process.env.GOOGLE_CLOUD_PROJECT || "kintsugi-memory-service";
const topicName = process.env.GOOGLE_CLOUD_PUBSUB_TOPIC?.split("/topics/")[1] || "kintsugi-cliff-pings";
const subscriptionName = process.env.GOOGLE_CLOUD_PUBSUB_SUBSCRIPTION || "kintsugi-cliff-pings-sub";

try {
  pubsubClient = new PubSub({ projectId });
  console.log(`[PubSub] Initialized Google Cloud PubSub client for project "${projectId}" (Topic: "${topicName}", Subscription: "${subscriptionName}")`);
} catch (err: any) {
  console.warn("[PubSub] PubSub client initialization notice:", err?.message || err);
}

import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

// In-Memory runtime SMTP storage (allows configuring directly from UI or .env)
let runtimeSmtpUser = process.env.SMTP_USER || process.env.MAIL_USER || process.env.GMAIL_USER || "";
let runtimeSmtpPass = process.env.SMTP_PASS || process.env.MAIL_PASS || process.env.GMAIL_APP_PASSWORD || "";

export function updateRuntimeSmtp(user: string, pass: string): void {
  runtimeSmtpUser = (user || "").trim();
  runtimeSmtpPass = (pass || "").trim().replace(/\s+/g, "");
  process.env.SMTP_USER = runtimeSmtpUser;
  process.env.SMTP_PASS = runtimeSmtpPass;
}

// Configure SMTP email transport with auto-sanitization for Gmail App Passwords
function createEmailTransporter() {
  dotenv.config();
  const smtpHost = process.env.SMTP_HOST || process.env.MAIL_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 465);
  const rawUser = runtimeSmtpUser || process.env.SMTP_USER || process.env.MAIL_USER || process.env.GMAIL_USER;
  const rawPass = runtimeSmtpPass || process.env.SMTP_PASS || process.env.MAIL_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!rawUser || !rawPass) {
    return null;
  }

  const smtpUser = rawUser.trim();
  // Strip any spaces from Google App Password (e.g. "izrv aolv hmgg wxyz" -> "izrvaolvhmggwxyz")
  const smtpPass = rawPass.trim().replace(/\s+/g, "");

  if (smtpHost) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // Default to Direct Gmail SSL/TLS transport (Port 465)
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export async function verifySmtpConnection(): Promise<{ success: boolean; error?: string }> {
  const transporter = createEmailTransporter();
  if (!transporter) {
    return { success: false, error: "SMTP credentials not provided in .env or settings." };
  }
  try {
    await transporter.verify();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function sendDirectTestEmail(toEmail: string): Promise<{ success: boolean; messageId?: string; error?: string; htmlPreview: string }> {
  const payload: CliffPingPayload = {
    recipientEmail: toEmail,
    conceptTitle: "The Markov Property & State Space",
    currentRetentionPct: 48,
    urgency: "urgent_cliff",
    subject: "✨ [Live Test] The Golden Joinery of Markovian Paths",
    teaserQuestion: "If a state transition depends only on the present coordinate, what prior memories can we safely let go of?",
    zineMessage: "Your memory of stochastic systems is undergoing its own elegant wabi-sabi decay. This is a verified test delivery from Kintsugi Memory Autonomous Agent.",
    triggeredBy: "Manual In-App SMTP Verification",
  };

  const dummyMsgId = `test-pubsub-${Date.now()}`;
  const html = buildCliffEditorialEmailHtml(payload, dummyMsgId);
  const transporter = createEmailTransporter();

  if (!transporter) {
    return {
      success: false,
      error: "SMTP credentials (SMTP_USER and SMTP_PASS) not configured.",
      htmlPreview: html,
    };
  }

  try {
    const sender = process.env.SMTP_FROM || `"Kintsugi Memory Agent" <${runtimeSmtpUser || process.env.SMTP_USER || toEmail}>`;
    const info = await transporter.sendMail({
      from: sender,
      to: toEmail,
      subject: payload.subject,
      text: `${payload.conceptTitle}\n\n${payload.teaserQuestion}\n\n${payload.zineMessage}`,
      html,
    });

    return {
      success: true,
      messageId: info.messageId,
      htmlPreview: html,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || String(err),
      htmlPreview: html,
    };
  }
}

/**
 * Builds a styled HTML Zen Kintsugi editorial email
 */
export function buildCliffEditorialEmailHtml(payload: CliffPingPayload, messageId: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F2; color: #2B2827; margin: 0; padding: 24px; }
    .card { max-width: 580px; margin: 0 auto; background: #FFFFFF; border: 1px solid #DDD7C8; border-radius: 20px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { border-bottom: 1px solid #DDD7C8; padding-bottom: 16px; margin-bottom: 20px; }
    .tag { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #8F6A00; background: #FAF3E0; border: 1px solid #E8D4A2; padding: 4px 10px; border-radius: 8px; letter-spacing: 0.5px; }
    .title { font-size: 22px; font-family: Georgia, serif; font-weight: bold; color: #2B2827; margin: 12px 0 6px 0; }
    .retention-box { background: #FDF2F0; border: 1px solid #F2C0B8; border-radius: 12px; padding: 14px 18px; margin: 20px 0; }
    .retention-val { font-size: 14px; font-weight: bold; color: #993B2B; }
    .teaser { font-size: 15px; font-style: italic; color: #5A5553; line-height: 1.6; margin: 20px 0; padding-left: 16px; border-left: 3px solid #BF9A2A; }
    .zine { font-size: 14px; color: #5A5553; line-height: 1.6; margin-bottom: 24px; }
    .btn { display: inline-block; background: #152659; color: #FFFFFF !important; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 14px; letter-spacing: 0.3px; }
    .footer { font-size: 11px; color: #736D6B; margin-top: 32px; border-top: 1px solid #DDD7C8; padding-top: 16px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="tag">Kintsugi Memory • Autonomous Pub/Sub Ping</span>
      <h1 class="title">${payload.conceptTitle}</h1>
    </div>
    
    <div class="retention-box">
      <div class="retention-val">⚠️ Synaptic Recall at ${payload.currentRetentionPct}% (Forgetting Cliff Threshold)</div>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #736D6B;">
        Biological memory decay models predict this memory trace will wilt within 24 hours without active spaced retrieval.
      </p>
    </div>

    <div class="teaser">
      "${payload.teaserQuestion}"
    </div>

    <div class="zine">
      ${payload.zineMessage}
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <a href="https://kintsugi-memory-service-676289354133.us-west1.run.app/" class="btn">✨ Mend Vessel in Socratic Garden</a>
    </div>

    <div class="footer">
      <div>GCP Cloud Pub/Sub Message ID: <code>${messageId}</code></div>
      <div>Topic: <code>projects/${projectId}/topics/${topicName}</code></div>
      <div>Dispatched to: ${payload.recipientEmail} via Kintsugi Autonomous Governor</div>
    </div>
  </div>
</body>
</html>
  `;
}

export function getSmtpStatus(): { configured: boolean; user: string | null; rawUser: string | null; host: string | null } {
  dotenv.config();
  const user = runtimeSmtpUser || process.env.SMTP_USER || process.env.MAIL_USER || process.env.GMAIL_USER || null;
  const pass = runtimeSmtpPass || process.env.SMTP_PASS || process.env.MAIL_PASS || process.env.GMAIL_APP_PASSWORD || null;
  const host = process.env.SMTP_HOST || process.env.MAIL_HOST || (user ? "smtp.gmail.com" : null);

  return {
    configured: Boolean(user && pass),
    user: user ? user.replace(/(.{3})(.*)(@.*)/, "$1***$3") : null,
    rawUser: user ? user.trim() : null,
    host,
  };
}

/**
 * Publishes a forgetting-cliff event to Google Cloud Pub/Sub & Dispatches Email
 */
export async function publishCliffEvent(payload: CliffPingPayload): Promise<{
  messageId: string;
  emailSent: boolean;
  smtpConfigured: boolean;
  htmlPreview: string;
  mailError?: string;
}> {
  const messageId = `gcp-pubsub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const eventEnvelope = {
    specversion: "1.0",
    type: "google.cloud.pubsub.topic.publish",
    source: `//cloudrun.googleapis.com/projects/${projectId}/services/kintsugi-memory-service`,
    id: messageId,
    time: new Date().toISOString(),
    datacontenttype: "application/json",
    data: payload,
  };

  const dataBuffer = Buffer.from(JSON.stringify(eventEnvelope), "utf-8");
  let publishedMessageId = messageId;

  if (pubsubClient) {
    try {
      const topic = pubsubClient.topic(topicName);
      const [topicExists] = await topic.exists().catch(() => [false]);
      if (!topicExists) {
        await topic.create().catch(() => {});
      }
      const gcpMessageId = await topic.publishMessage({
        data: dataBuffer,
        attributes: {
          timestamp: new Date().toISOString(),
          eventType: "ForgettingCliffAlert",
          source: "KintsugiMemoryAutonomousAgent",
        },
      });

      if (gcpMessageId) {
        publishedMessageId = gcpMessageId;
        console.log(`[Google Cloud Pub/Sub] Published message "${publishedMessageId}" to topic "${topicName}"`);
      }
    } catch (err: any) {
      console.warn(`[Google Cloud Pub/Sub] Warning during live topic publish:`, err?.message || err);
    }
  }

  const emailHtml = buildCliffEditorialEmailHtml(payload, publishedMessageId);
  const activeTransporter = createEmailTransporter();
  let emailDelivered = false;
  let mailErrorMessage: string | undefined;

  // Dispatch actual email if SMTP transporter is configured
  if (activeTransporter) {
    try {
      const sender = process.env.SMTP_FROM || process.env.MAIL_FROM || `"Kintsugi Memory Agent" <${process.env.SMTP_USER || process.env.GMAIL_USER || "notifications@kintsugi-memory.ai"}>`;
      const info = await activeTransporter.sendMail({
        from: sender,
        to: payload.recipientEmail,
        subject: payload.subject,
        text: `${payload.conceptTitle} is at ${payload.currentRetentionPct}% retention.\n\n${payload.teaserQuestion}\n\n${payload.zineMessage}\n\nGCP Pub/Sub Message ID: ${publishedMessageId}`,
        html: emailHtml,
      });
      emailDelivered = true;
      console.log(`[Nodemailer] Successfully sent editorial email to ${payload.recipientEmail}: messageId=${info.messageId}`);
    } catch (mailErr: any) {
      mailErrorMessage = mailErr?.message || String(mailErr);
      console.warn(`[Nodemailer] Warning sending email:`, mailErrorMessage);
    }
  } else {
    console.log(`[PubSub Dispatcher] Live SMTP not configured in .env (generated in-app preview for ${payload.recipientEmail}).`);
  }

  // Record audit log entry
  const logEntry: PubSubNotificationLog = {
    id: `notif_${Date.now()}`,
    recipientEmail: payload.recipientEmail,
    conceptTitle: payload.conceptTitle,
    editorialSubject: payload.subject,
    teaserQuestion: payload.teaserQuestion,
    zineMessage: payload.zineMessage,
    dispatchedAt: new Date().toISOString(),
    status: emailDelivered ? "delivered" : "queued",
    gcpPubSubMessageId: publishedMessageId,
  };

  inMemoryPubSubAuditLogs.unshift(logEntry);
  if (inMemoryPubSubAuditLogs.length > 100) {
    inMemoryPubSubAuditLogs.pop();
  }

  return {
    messageId: publishedMessageId,
    emailSent: emailDelivered,
    smtpConfigured: Boolean(activeTransporter),
    htmlPreview: emailHtml,
    mailError: mailErrorMessage,
  };
}

/**
 * Starts background subscriber listener with explicit message ack()/nack()
 */
export async function startPubSubSubscriber(): Promise<void> {
  if (!pubsubClient) {
    console.log("[PubSub Subscriber] Google Cloud PubSub client not initialized; listener deferred.");
    return;
  }

  try {
    const topic = pubsubClient.topic(topicName);
    const [topicExists] = await topic.exists().catch(() => [false]);
    if (!topicExists) {
      await topic.create().catch(() => {});
    }

    const subscription = pubsubClient.subscription(subscriptionName);
    const [subExists] = await subscription.exists().catch(() => [false]);
    if (!subExists) {
      console.log(`[PubSub Subscriber] Subscription "${subscriptionName}" not found on GCP, attempting creation under topic "${topicName}"...`);
      await topic.createSubscription(subscriptionName, { ackDeadlineSeconds: 60 }).catch((err) => {
        console.warn(`[PubSub Subscriber] Auto-create notice for subscription "${subscriptionName}":`, err?.message || err);
      });
    }

    subscription.on("message", (message: Message) => {
      try {
        const rawString = message.data.toString("utf-8");
        const parsed = JSON.parse(rawString);
        console.log(`[PubSub Subscriber] Received event message "${message.id}":`, parsed?.data?.conceptTitle || "Event");

        // Explicitly acknowledge receipt of the message
        message.ack();
      } catch (error) {
        console.error("[PubSub Subscriber] Error processing incoming message:", error);
        message.nack();
      }
    });

    subscription.on("error", (error: any) => {
      console.warn(`[PubSub Subscriber] Subscription notice for "${subscriptionName}":`, error?.message || error);
    });

    console.log(`[PubSub Subscriber] Listening for forgetting-cliff events on subscription "${subscriptionName}" (Topic: "${topicName}")...`);
  } catch (err: any) {
    console.warn("[PubSub Subscriber] Failed to attach subscriber listener:", err?.message || err);
  }
}
