# @bhaskardey772/push-notif-backend

[![npm](https://img.shields.io/npm/v/@bhaskardey772/push-notif-backend)](https://www.npmjs.com/package/@bhaskardey772/push-notif-backend)
[![GitHub](https://img.shields.io/badge/GitHub-source-181717?logo=github)](https://github.com/BhaskarDey772/company-push-notif)

Backend helper for **Firebase Cloud Messaging (FCM)**. Send push notifications to devices, topics, and conditions — without writing any Firebase Admin boilerplate.

Written in TypeScript. Ships with full type declarations.

---

## Table of Contents

- [Installation](#installation)
  - [Default (bundled)](#default-bundled)
  - [Slim (already have firebase-admin)](#slim-already-have-firebase-admin)
- [Setup](#setup)
- [Complete Express Example](#complete-express-example)
- [API](#api)
  - [init](#initserviceaccount-appname)
  - [sendToDevice](#sendtodevicetoken-payload)
  - [sendToDevices](#sendtodevicestokens-payload)
  - [sendToTopic](#sendtotopictopic-payload)
  - [sendToCondition](#sendtoconditioncondition-payload)
  - [subscribeToTopic](#subscribetotopictokens-topic)
  - [unsubscribeFromTopic](#unsubscribefromtopictokens-topic)
- [Payload Reference](#payload-reference)
- [Return Types](#return-types)
- [Error Handling](#error-handling)
- [TypeScript](#typescript)

---

## Installation

### Default (bundled)

`firebase-admin` is bundled inside — **nothing else to install**.

```bash
npm install @bhaskardey772/push-notif-backend
```

```ts
import * as notif from '@bhaskardey772/push-notif-backend';
```

Use this if your project does **not** already use `firebase-admin`.

---

### Slim (already have firebase-admin)

If your project already uses `firebase-admin` (e.g. for Firestore, Auth, or custom admin operations), use the `/slim` entry to avoid bundling a second copy.

```bash
npm install @bhaskardey772/push-notif-backend firebase-admin
```

```ts
import * as notif from '@bhaskardey772/push-notif-backend/slim';
```

The `/slim` entry uses your project's existing `firebase-admin` — no duplication, no extra weight.

| | Default | Slim |
|---|---|---|
| Extra install | None | `firebase-admin` |
| Import path | `@bhaskardey772/push-notif-backend` | `@bhaskardey772/push-notif-backend/slim` |
| `firebase-admin` in bundle | Yes (bundled in) | No (uses yours) |
| Use when | Fresh project | Already using `firebase-admin` |

---

## Setup

**1. Get your service account file**

Firebase Console → Project Settings → Service Accounts → **Generate new private key**

> ⚠️ Never commit this file. Add it to `.gitignore` and load it via secrets manager or env variable in production.

**2. Initialize once at app startup**

```ts
import * as notif from '@bhaskardey772/push-notif-backend';
// or: import * as notif from '@bhaskardey772/push-notif-backend/slim';

notif.init(require('./service-account.json'));
```

All other functions work exactly the same regardless of which entry you use.

---

## Complete Express Example

```ts
import express, { Request, Response } from 'express';
import * as notif from '@bhaskardey772/push-notif-backend';
// or: import * as notif from '@bhaskardey772/push-notif-backend/slim';

notif.init(require('./service-account.json'));

const app = express();
app.use(express.json());

const tokens = new Set<string>();

app.post('/api/subscribe', (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) { res.status(400).json({ error: 'token required' }); return; }
  tokens.add(token);
  res.json({ success: true });
});

app.post('/api/unsubscribe', (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) { res.status(400).json({ error: 'token required' }); return; }
  tokens.delete(token);
  res.json({ success: true });
});

app.post('/api/notify/device', async (req: Request, res: Response) => {
  const { token, title, body, imageUrl, data } = req.body;
  try {
    const result = await notif.sendToDevice(token, { title, body, imageUrl, data });
    res.json({ success: true, messageId: result.messageId });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/notify/all', async (req: Request, res: Response) => {
  const { title, body, imageUrl, data } = req.body;
  if (tokens.size === 0) { res.status(400).json({ error: 'No registered tokens' }); return; }
  try {
    const result = await notif.sendToDevices([...tokens], { title, body, imageUrl, data });
    res.json({ success: true, successCount: result.successCount, failureCount: result.failureCount });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/notify/topic', async (req: Request, res: Response) => {
  const { topic, title, body, imageUrl, data } = req.body;
  try {
    const result = await notif.sendToTopic(topic, { title, body, imageUrl, data });
    res.json({ success: true, messageId: result.messageId });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/topic/subscribe', async (req: Request, res: Response) => {
  const { tokens: tokenList, topic } = req.body;
  try {
    const result = await notif.subscribeToTopic(tokenList, topic);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/topic/unsubscribe', async (req: Request, res: Response) => {
  const { tokens: tokenList, topic } = req.body;
  try {
    const result = await notif.unsubscribeFromTopic(tokenList, topic);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(3000, () => console.log('Server running on :3000'));
```

---

## API

### `init(serviceAccount, appName?)`

Call **once** at startup before using any other function.

```ts
// Pass parsed JSON object
notif.init(require('./service-account.json'));

// Or pass absolute path to the file
notif.init('/etc/secrets/service-account.json');

// Multi-project: name each app
notif.init(serviceAccountA, 'project-a');
notif.init(serviceAccountB, 'project-b');
```

---

### `sendToDevice(token, payload)`

Send to a single device token.

```ts
const result = await notif.sendToDevice(token, {
  title: 'Order shipped!',
  body: 'Your order #1234 is on its way.',
  imageUrl: 'https://example.com/image.png',
  data: { orderId: '1234', clickUrl: '/orders/1234' },
});
// result: { messageId: string }
```

---

### `sendToDevices(tokens, payload)`

Send to multiple device tokens. Automatically chunks arrays larger than 500 (FCM limit).

```ts
const result = await notif.sendToDevices(allTokens, {
  title: 'Flash sale!',
  body: '50% off for the next 2 hours.',
});
// result: { successCount, failureCount, errors }

for (const { token, error } of result.errors) {
  if (error.includes('not-registered')) await db.tokens.delete(token);
}
```

---

### `sendToTopic(topic, payload)`

Send to all devices subscribed to a topic.

```ts
await notif.sendToTopic('breaking-news', {
  title: 'Breaking News',
  body: 'Tap to read more.',
  data: { clickUrl: '/news/latest' },
});
```

---

### `sendToCondition(condition, payload)`

Send using a boolean topic expression.

```ts
await notif.sendToCondition("'sports' in topics || 'cricket' in topics", {
  title: 'Match starts in 30 minutes!',
  body: 'India vs Australia — tap to watch live.',
});
```

---

### `subscribeToTopic(tokens, topic)`

Subscribe one or more tokens to a topic.

```ts
await notif.subscribeToTopic(userToken, 'sports');
await notif.subscribeToTopic([tokenA, tokenB], 'announcements');
```

---

### `unsubscribeFromTopic(tokens, topic)`

Unsubscribe one or more tokens from a topic.

```ts
await notif.unsubscribeFromTopic(userToken, 'sports');
```

---

## Payload Reference

```ts
interface NotificationPayload {
  title: string;                   // Required
  body: string;                    // Required
  imageUrl?: string;               // Large image shown in the notification
  icon?: string;                   // Small icon (web push)
  data?: Record<string, unknown>;  // Custom key-value pairs (auto-stringified)
  android?: AndroidConfig;         // Raw Firebase Android override
  apns?: ApnsConfig;               // Raw Firebase APNs (iOS) override
  webpush?: WebpushConfig;         // Raw Firebase Web Push override
}
```

**`data` field** — pass custom values to the client:

```ts
data: {
  clickUrl: '/orders/123',
  orderId: '123',
  userId: 42,               // Numbers/booleans are auto-converted to strings
}
```

---

## Return Types

```ts
// sendToDevice, sendToTopic, sendToCondition
interface SendResult {
  messageId: string;
}

// sendToDevices
interface BatchResult {
  successCount: number;
  failureCount: number;
  errors: Array<{ token: string; error: string }>;
}
```

---

## Error Handling

```ts
try {
  await notif.sendToDevice(token, payload);
} catch (err) {
  if (err.errorInfo?.code === 'messaging/registration-token-not-registered') {
    await db.tokens.delete(token);
  } else {
    console.error('FCM error:', err.message);
  }
}
```

**Common error codes:**

| Code | Meaning |
|---|---|
| `messaging/registration-token-not-registered` | Token expired or app uninstalled — delete it |
| `messaging/invalid-registration-token` | Malformed token |
| `messaging/message-rate-exceeded` | Throttled — back off and retry |
| `messaging/invalid-argument` | Bad payload (missing title or body) |

---

## TypeScript

Full type declarations are included. No `@types/` package needed.

```ts
import type {
  NotificationPayload,
  SendResult,
  BatchResult,
} from '@bhaskardey772/push-notif-backend';
```
