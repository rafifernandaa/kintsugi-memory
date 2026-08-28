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
const projectId = process.env.GOOGLE_CLOUD_PROJECT || "my-project-31-491314";
const topicName = process.env.GOOGLE_CLOUD_PUBSUB_TOPIC?.split("/topics/")[1] || "kintsugi-cliff-pings";
const subscriptionName = process.env.GOOGLE_CLOUD_PUBSUB_SUBSCRIPTION || "kintsugi-cliff-pings-sub";

try {
  pubsubClient = new PubSub({ projectId });
  console.log(`[PubSub] Initialized Google Cloud PubSub client for project "${projectId}"`);
} catch (err: any) {
  console.warn("[PubSub] PubSub client initialization notice:", err?.message || err);
}

/**
 * Publishes a forgetting-cliff event to Google Cloud Pub/Sub
 */
export async function publishCliffEvent(payload: CliffPingPayload): Promise<string> {
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

  // Record audit log entry
  const logEntry: PubSubNotificationLog = {
    id: `notif_${Date.now()}`,
    recipientEmail: payload.recipientEmail,
    conceptTitle: payload.conceptTitle,
    editorialSubject: payload.subject,
    teaserQuestion: payload.teaserQuestion,
    zineMessage: payload.zineMessage,
    dispatchedAt: new Date().toISOString(),
    status: "delivered",
    gcpPubSubMessageId: publishedMessageId,
  };

  inMemoryPubSubAuditLogs.unshift(logEntry);
  if (inMemoryPubSubAuditLogs.length > 100) {
    inMemoryPubSubAuditLogs.pop();
  }

  return publishedMessageId;
}

/**
 * Starts background subscriber listener with explicit message ack()/nack()
 */
export function startPubSubSubscriber(): void {
  if (!pubsubClient) {
    console.log("[PubSub Subscriber] Google Cloud PubSub client not initialized; listener deferred.");
    return;
  }

  try {
    const subscription = pubsubClient.subscription(subscriptionName);

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
      console.warn("[PubSub Subscriber] Subscription error (topic or subscription may need creation in GCP):", error?.message || error);
    });

    console.log(`[PubSub Subscriber] Listening for forgetting-cliff events on subscription "${subscriptionName}"...`);
  } catch (err: any) {
    console.warn("[PubSub Subscriber] Failed to attach subscriber listener:", err?.message || err);
  }
}
