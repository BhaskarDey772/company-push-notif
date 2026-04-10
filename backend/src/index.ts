import * as admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import type { Messaging, MessagingTopicManagementResponse, BaseMessage } from 'firebase-admin/messaging';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotificationPayload {
  /** Notification title (required) */
  title: string;
  /** Notification body (required) */
  body: string;
  /** Large image URL */
  imageUrl?: string;
  /** Icon URL (web push) */
  icon?: string;
  /** Custom key-value data — values are auto-converted to strings */
  data?: Record<string, unknown>;
  /** Raw Firebase AndroidConfig override */
  android?: admin.messaging.AndroidConfig;
  /** Raw Firebase ApnsConfig override */
  apns?: admin.messaging.ApnsConfig;
  /** Raw Firebase WebpushConfig override */
  webpush?: admin.messaging.WebpushConfig;
}

export interface SendResult {
  messageId: string;
}

export interface BatchResult {
  successCount: number;
  failureCount: number;
  errors: Array<{ token: string; error: string }>;
}

// ─── State ────────────────────────────────────────────────────────────────────

let _messaging: Messaging | null = null;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Initialize with your Firebase service account credentials.
 * Call once at app startup before using any other functions.
 *
 * @param serviceAccount - Parsed service account object or absolute path to the JSON file
 * @param appName        - Optional: name the app (useful for multi-project setups)
 */
export function init(
  serviceAccount: admin.ServiceAccount | string,
  appName?: string,
): void {
  const name = appName ?? '[DEFAULT]';
  const existing = admin.apps.find((a) => a?.name === name) ?? undefined;

  const credential =
    typeof serviceAccount === 'string'
      ? admin.credential.cert(require(serviceAccount) as admin.ServiceAccount)
      : admin.credential.cert(serviceAccount);

  const app = existing ?? admin.initializeApp({ credential }, appName);
  _messaging = getMessaging(app);
}

/**
 * Send a notification to a single device token.
 */
export async function sendToDevice(
  token: string,
  payload: NotificationPayload,
): Promise<SendResult> {
  assertInit();
  if (!token) throw new Error('token must be a non-empty string');

  const base = buildBase(payload);
  const messageId = await _messaging!.send({ ...base, token });
  return { messageId };
}

/**
 * Send a notification to multiple device tokens.
 * Automatically chunks arrays larger than 500 (FCM limit).
 */
export async function sendToDevices(
  tokens: string[],
  payload: NotificationPayload,
): Promise<BatchResult> {
  assertInit();
  if (!tokens.length) throw new Error('tokens must be a non-empty array');

  const base = buildBase(payload);
  const chunks = chunkArray(tokens, 500);
  const result: BatchResult = { successCount: 0, failureCount: 0, errors: [] };

  for (const chunk of chunks) {
    const response = await _messaging!.sendEachForMulticast({ ...base, tokens: chunk });
    result.successCount += response.successCount;
    result.failureCount += response.failureCount;
    response.responses.forEach((r, i) => {
      if (!r.success) {
        result.errors.push({ token: chunk[i], error: r.error?.message ?? 'Unknown error' });
      }
    });
  }

  return result;
}

/**
 * Send a notification to all devices subscribed to a topic.
 */
export async function sendToTopic(
  topic: string,
  payload: NotificationPayload,
): Promise<SendResult> {
  assertInit();
  if (!topic) throw new Error('topic must be a non-empty string');

  const base = buildBase(payload);
  const messageId = await _messaging!.send({ ...base, topic });
  return { messageId };
}

/**
 * Send a notification using an FCM condition expression.
 * Example: "'sports' in topics || 'news' in topics"
 */
export async function sendToCondition(
  condition: string,
  payload: NotificationPayload,
): Promise<SendResult> {
  assertInit();
  if (!condition) throw new Error('condition must be a non-empty string');

  const base = buildBase(payload);
  const messageId = await _messaging!.send({ ...base, condition });
  return { messageId };
}

/**
 * Subscribe one or more device tokens to a topic.
 */
export async function subscribeToTopic(
  tokens: string | string[],
  topic: string,
): Promise<MessagingTopicManagementResponse> {
  assertInit();
  return _messaging!.subscribeToTopic([tokens].flat(), topic);
}

/**
 * Unsubscribe one or more device tokens from a topic.
 */
export async function unsubscribeFromTopic(
  tokens: string | string[],
  topic: string,
): Promise<MessagingTopicManagementResponse> {
  assertInit();
  return _messaging!.unsubscribeFromTopic([tokens].flat(), topic);
}

// ─── Internals ────────────────────────────────────────────────────────────────

function assertInit(): void {
  if (!_messaging) {
    throw new Error(
      '[@bhaskardey772/push-notif-backend] Call init(serviceAccount) before using other methods.',
    );
  }
}

/** Shared message fields excluding the routing target (token / topic / condition). */
type MessageBase = Omit<BaseMessage, 'token' | 'topic' | 'condition'>;

function buildBase(payload: NotificationPayload): MessageBase {
  const { title, body, imageUrl, icon, data, android, apns, webpush } = payload;
  if (!title) throw new Error('payload.title is required');
  if (!body) throw new Error('payload.body is required');

  return {
    notification: { title, body, ...(imageUrl && { imageUrl }) },
    ...(data && { data: stringifyData(data) }),
    webpush: {
      notification: { ...(icon && { icon }) },
      ...webpush,
    },
    ...(android && { android }),
    ...(apns && { apns }),
  };
}

function stringifyData(data: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]));
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}
