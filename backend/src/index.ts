import fs from 'fs';
import path from 'path';
import * as admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import type { Messaging, BaseMessage } from 'firebase-admin/messaging';

export interface ServiceAccount {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
  [key: string]: unknown;
}

export interface TopicManagementResponse {
  failureCount: number;
  successCount: number;
  errors: Array<{ index: number; error: { code: string; message: string } }>;
}

export interface NotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  icon?: string;
  /** Values are auto-converted to strings */
  data?: Record<string, unknown>;
  /** Raw Firebase Android config override */
  android?: Record<string, unknown>;
  /** Raw Firebase APNs (iOS) config override */
  apns?: Record<string, unknown>;
  /** Raw Firebase Web Push config override */
  webpush?: Record<string, unknown>;
}

export interface SendResult {
  messageId: string;
}

export interface BatchResult {
  successCount: number;
  failureCount: number;
  errors: Array<{ token: string; error: string }>;
}

let _messaging: Messaging | null = null;

/**
 * Initialize with your Firebase service account credentials.
 * Call once at app startup before using any other functions.
 *
 * @param serviceAccount - Parsed service account object or absolute path to the JSON file
 * @param appName        - Optional: name the app (useful for multi-project setups)
 */
export function init(
  serviceAccount: ServiceAccount | string,
  appName?: string,
): void {
  const name = appName ?? '[DEFAULT]';
  const existing = admin.apps.find((a) => a?.name === name) ?? undefined;

  const credential = admin.credential.cert(loadServiceAccount(serviceAccount) as admin.ServiceAccount);

  const app = existing ?? admin.initializeApp({ credential }, appName);
  _messaging = getMessaging(app);
}

export async function sendToDevice(
  token: string,
  payload: NotificationPayload,
): Promise<SendResult> {
  assertInit();
  assertToken(token, 'token');

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
  const validatedTokens = normalizeTokens(tokens, 'tokens');

  const base = buildBase(payload);
  const chunks = chunkArray(validatedTokens, 500);
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

export async function sendToTopic(
  topic: string,
  payload: NotificationPayload,
): Promise<SendResult> {
  assertInit();
  assertTopic(topic);

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
  if (!condition.trim()) throw new Error('condition must be a non-empty string');

  const base = buildBase(payload);
  const messageId = await _messaging!.send({ ...base, condition });
  return { messageId };
}

export async function subscribeToTopic(
  tokens: string | string[],
  topic: string,
): Promise<TopicManagementResponse> {
  assertInit();
  assertTopic(topic);
  return _messaging!.subscribeToTopic(normalizeTokens(tokens, 'tokens'), topic);
}

export async function unsubscribeFromTopic(
  tokens: string | string[],
  topic: string,
): Promise<TopicManagementResponse> {
  assertInit();
  assertTopic(topic);
  return _messaging!.unsubscribeFromTopic(normalizeTokens(tokens, 'tokens'), topic);
}

function assertInit(): void {
  if (!_messaging) {
    throw new Error(
      '[@bhaskardey772/fcm-backend] Call init(serviceAccount) before using other methods.',
    );
  }
}

function loadServiceAccount(serviceAccount: ServiceAccount | string): ServiceAccount {
  if (typeof serviceAccount !== 'string') {
    return assertServiceAccountShape(serviceAccount);
  }

  const resolvedPath = path.resolve(serviceAccount);
  if (path.extname(resolvedPath).toLowerCase() !== '.json') {
    throw new Error('serviceAccount path must point to a JSON file');
  }

  let raw: string;
  try {
    raw = fs.readFileSync(resolvedPath, 'utf8');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to read service account file: ${message}`);
  }

  try {
    return assertServiceAccountShape(JSON.parse(raw) as ServiceAccount);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid service account JSON: ${message}`);
  }
}

function assertServiceAccountShape(serviceAccount: ServiceAccount): ServiceAccount {
  if (!serviceAccount || typeof serviceAccount !== 'object') {
    throw new Error('serviceAccount must be an object');
  }

  const obj = serviceAccount as Record<string, unknown>;
  const hasRequired =
    (obj.projectId  || obj.project_id)  &&
    (obj.clientEmail || obj.client_email) &&
    (obj.privateKey  || obj.private_key);

  if (!hasRequired) {
    throw new Error('serviceAccount must include projectId, clientEmail, and privateKey');
  }

  return serviceAccount;
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
      ...(webpush as admin.messaging.WebpushConfig),
    },
    ...(android && { android: android as admin.messaging.AndroidConfig }),
    ...(apns && { apns: apns as admin.messaging.ApnsConfig }),
  };
}

function normalizeTokens(tokens: string | string[], fieldName: string): string[] {
  const normalized = [tokens].flat().map((token) => {
    assertToken(token, fieldName);
    return token.trim();
  });

  if (!normalized.length) {
    throw new Error(`${fieldName} must be a non-empty string or array of strings`);
  }

  return [...new Set(normalized)];
}

function assertToken(token: string, fieldName: string): void {
  if (typeof token !== 'string' || !token.trim()) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
}

function assertTopic(topic: string): void {
  if (typeof topic !== 'string' || !topic.trim()) {
    throw new Error('topic must be a non-empty string');
  }
}

function stringifyData(data: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]));
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}
