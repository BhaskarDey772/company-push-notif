# @bhaskardey772/push-notif-backend

Backend helper for **Firebase Cloud Messaging (FCM)**. Send push notifications to devices, topics, and conditions — without writing any Firebase Admin boilerplate.

Written in TypeScript. Ships with full type declarations.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Initialization](#initialization)
- [Sending Notifications](#sending-notifications)
  - [Send to a Single Device](#send-to-a-single-device)
  - [Send to Multiple Devices](#send-to-multiple-devices)
  - [Send to a Topic](#send-to-a-topic)
  - [Send to a Condition](#send-to-a-condition)
- [Topic Management](#topic-management)
- [Payload Reference](#payload-reference)
- [Return Types](#return-types)
- [Error Handling](#error-handling)
- [Multi-Project Setup](#multi-project-setup)
- [TypeScript](#typescript)

---

## Installation

```bash
npm install @bhaskardey772/push-notif-backend firebase-admin
```

`firebase-admin` is a peer dependency — you install it once in your project and this package uses it.

---

## Quick Start

```ts
import * as notif from '@bhaskardey772/push-notif-backend';

// 1. Initialize once at app startup
notif.init(require('./service-account.json'));

// 2. Send a notification
await notif.sendToDevice(token, {
  title: 'Order shipped!',
  body: 'Your order #1234 is on its way.',
});
```

---

## Initialization

### `init(serviceAccount, appName?)`

Call this **once** at application startup, before using any other function.

```ts
import * as notif from '@bhaskardey772/push-notif-backend';

// Option A — pass the parsed JSON object directly
import serviceAccount from './service-account.json';
notif.init(serviceAccount);

// Option B — pass an absolute path to the JSON file
notif.init('/etc/secrets/firebase-service-account.json');

// Option C — multi-project: name the app
notif.init(serviceAccountA, 'project-a');
notif.init(serviceAccountB, 'project-b');
```

**Where to get the service account file:**
Firebase Console → Project Settings → Service Accounts → **Generate new private key**

> ⚠️ Never commit the service account JSON to version control. Add it to `.gitignore` and load it from environment secrets or a secrets manager.

---

## Sending Notifications

### Send to a Single Device

```ts
const result = await notif.sendToDevice(token, payload);
// result: { messageId: string }
```

| Parameter | Type | Description |
|---|---|---|
| `token` | `string` | FCM registration token from the frontend |
| `payload` | `NotificationPayload` | Notification content (see [Payload Reference](#payload-reference)) |

**Example:**
```ts
await notif.sendToDevice(token, {
  title: 'New message',
  body: 'You have a new message from Alice.',
  imageUrl: 'https://example.com/avatar.png',
  data: {
    chatId: '42',
    clickUrl: '/messages/42',
  },
});
```

---

### Send to Multiple Devices

```ts
const result = await notif.sendToDevices(tokens, payload);
// result: { successCount, failureCount, errors }
```

| Parameter | Type | Description |
|---|---|---|
| `tokens` | `string[]` | Array of FCM registration tokens |
| `payload` | `NotificationPayload` | Notification content |

- Automatically **chunks arrays larger than 500** (FCM limit per request).
- Failed tokens are listed individually in `result.errors` — you can use this to clean up invalid tokens from your database.

**Example:**
```ts
const result = await notif.sendToDevices(allUserTokens, {
  title: 'Flash sale!',
  body: '50% off for the next 2 hours.',
});

console.log(`Delivered: ${result.successCount}`);
console.log(`Failed:    ${result.failureCount}`);

// Remove invalid tokens from your DB
for (const { token, error } of result.errors) {
  console.warn(`Token failed: ${token} — ${error}`);
}
```

---

### Send to a Topic

All devices subscribed to the topic receive the notification.

```ts
const result = await notif.sendToTopic(topic, payload);
// result: { messageId: string }
```

| Parameter | Type | Description |
|---|---|---|
| `topic` | `string` | Topic name (no leading `/topics/` prefix required) |
| `payload` | `NotificationPayload` | Notification content |

**Example:**
```ts
await notif.sendToTopic('breaking-news', {
  title: 'Breaking News',
  body: 'A major event is unfolding. Tap to read more.',
  data: { articleId: '789', clickUrl: '/news/789' },
});
```

---

### Send to a Condition

Send to devices that match a boolean expression of topics.

```ts
const result = await notif.sendToCondition(condition, payload);
// result: { messageId: string }
```

| Parameter | Type | Description |
|---|---|---|
| `condition` | `string` | FCM condition expression |
| `payload` | `NotificationPayload` | Notification content |

**Example:**
```ts
// Devices subscribed to 'sports' OR 'cricket'
await notif.sendToCondition("'sports' in topics || 'cricket' in topics", {
  title: 'Match starts in 30 minutes!',
  body: 'India vs Australia — tap to watch live.',
});
```

---

## Topic Management

Subscribe or unsubscribe one or more device tokens to/from a topic.

```ts
// Subscribe
await notif.subscribeToTopic(tokens, topic);

// Unsubscribe
await notif.unsubscribeFromTopic(tokens, topic);
```

| Parameter | Type | Description |
|---|---|---|
| `tokens` | `string \| string[]` | One token or an array of tokens |
| `topic` | `string` | Topic name |

**Example:**
```ts
// Subscribe a user to the 'sports' topic when they toggle a preference
await notif.subscribeToTopic(userToken, 'sports');

// Bulk subscribe all tokens
await notif.subscribeToTopic(allTokens, 'announcements');

// Unsubscribe on opt-out
await notif.unsubscribeFromTopic(userToken, 'sports');
```

---

## Payload Reference

All send functions accept a `NotificationPayload` object:

```ts
interface NotificationPayload {
  title: string;          // Required — notification title
  body: string;           // Required — notification body text
  imageUrl?: string;      // Large image shown below the body
  icon?: string;          // Small icon URL (web push)
  data?: Record<string, unknown>; // Custom key-value pairs (auto-stringified)
  android?: AndroidConfig;  // Raw Firebase AndroidConfig override
  apns?: ApnsConfig;        // Raw Firebase APNs (iOS) config override
  webpush?: WebpushConfig;  // Raw Firebase WebpushConfig override
}
```

### `data` field

Use `data` to pass custom key-value pairs to the client app. Common uses:

```ts
data: {
  clickUrl: '/orders/123',   // URL to open when notification is tapped
  orderId: '123',
  userId: 42,                // Numbers are auto-converted to strings
  isPromo: true,             // Booleans too
}
```

> All values are automatically converted to strings — FCM requires this.

### Platform-specific overrides

For advanced cases, you can pass raw Firebase config objects:

```ts
await notif.sendToDevice(token, {
  title: 'Hello',
  body: 'World',
  android: {
    priority: 'high',
    notification: { channelId: 'orders' },
  },
  apns: {
    payload: { aps: { badge: 1, sound: 'default' } },
  },
  webpush: {
    headers: { Urgency: 'high' },
  },
});
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
  errors: Array<{
    token: string;   // The token that failed
    error: string;   // Reason (e.g. "registration-token-not-registered")
  }>;
}
```

---

## Error Handling

All functions throw on network or authentication errors. Wrap calls in `try/catch`:

```ts
try {
  await notif.sendToDevice(token, payload);
} catch (err) {
  if (err.errorInfo?.code === 'messaging/registration-token-not-registered') {
    // Token is no longer valid — remove it from your database
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
| `messaging/invalid-argument` | Bad payload (check title/body) |

---

## Multi-Project Setup

If your backend talks to more than one Firebase project, name each app:

```ts
notif.init(serviceAccountA, 'project-a');
notif.init(serviceAccountB, 'project-b');
```

> Note: The current version routes all calls through the last-initialized app. For full multi-project support, initialize the Firebase Admin SDK directly and pass the `Messaging` instance per call — this is on the roadmap.

---

## TypeScript

The package is written in TypeScript and ships with full type declarations. Import types as needed:

```ts
import type {
  NotificationPayload,
  SendResult,
  BatchResult,
} from '@bhaskardey772/push-notif-backend';
```

No `@types/` package is needed.
