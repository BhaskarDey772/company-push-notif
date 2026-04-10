# Push Notification Packages

Two packages that let backend and frontend developers send/receive Firebase push
notifications without dealing with Firebase internals.

```
packages/
├── backend/    → @bhaskardey772/push-notif-backend   (Node.js / Firebase Admin)
└── frontend/   → @bhaskardey772/push-notif-frontend  (Browser / Firebase JS SDK)
```

---

## Backend — `@bhaskardey772/push-notif-backend`

### Install

```bash
npm install firebase-admin @bhaskardey772/push-notif-backend
```

### Quick start

```js
const notif = require('@bhaskardey772/push-notif-backend');

// 1. Init once with your service account JSON
notif.init(require('./your-service-account.json'));

// 2. Send to a single device
await notif.sendToDevice(token, {
  title: 'Order shipped!',
  body: 'Your order #1234 is on the way.',
  data: { orderId: '1234', clickUrl: '/orders/1234' },
});

// 3. Send to many devices (auto-chunks at 500)
const { successCount, failureCount, errors } = await notif.sendToDevices(tokens, {
  title: 'Flash sale',
  body: '50% off for the next hour.',
});

// 4. Send to a topic
await notif.sendToTopic('news', { title: 'Breaking', body: '...' });

// 5. Manage topic subscriptions
await notif.subscribeToTopic(tokens, 'news');
await notif.unsubscribeFromTopic(tokens, 'news');
```

### API

| Function | Description |
|---|---|
| `init(serviceAccount, appName?)` | Initialize with Firebase service account. Call once at startup. |
| `sendToDevice(token, payload)` | Send to one FCM token → `{ messageId }` |
| `sendToDevices(tokens[], payload)` | Send to multiple tokens → `{ successCount, failureCount, errors }` |
| `sendToTopic(topic, payload)` | Send to all subscribers of a topic → `{ messageId }` |
| `sendToCondition(condition, payload)` | Send using an FCM condition expression → `{ messageId }` |
| `subscribeToTopic(tokens, topic)` | Subscribe tokens to a topic |
| `unsubscribeFromTopic(tokens, topic)` | Unsubscribe tokens from a topic |

### Payload shape

```js
{
  title: 'Required',
  body: 'Required',
  imageUrl: 'https://...', // optional large image
  icon: 'https://...',     // optional icon (web push)
  data: { key: 'value' }, // optional custom data (values auto-converted to strings)
  android: { ... },       // optional raw Firebase AndroidConfig
  apns: { ... },          // optional raw Firebase ApnsConfig
  webpush: { ... },       // optional raw Firebase WebpushConfig
}
```

---

## Frontend — `@bhaskardey772/push-notif-frontend`

### Install

```bash
npm install firebase @bhaskardey772/push-notif-frontend
```

### Quick start

```js
import * as notif from '@bhaskardey772/push-notif-frontend';

// 1. Init once (e.g. in your app entry point)
await notif.init({
  firebaseConfig: { apiKey: '...', projectId: '...', ... },
  vapidKey: 'BPsx...', // Firebase Console → Project Settings → Cloud Messaging
});

// 2. Ask user for permission → get FCM token → send to your backend
const token = await notif.requestPermission();
if (token) {
  await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
}

// 3. Handle notifications while app is open
const unsubscribe = notif.onForegroundMessage(({ title, body, data }) => {
  showToast(title, body);       // your UI toast/alert
});
// Call unsubscribe() when component unmounts
```

### API

| Function | Description |
|---|---|
| `init({ firebaseConfig, vapidKey, serviceWorkerPath? })` | Initialize. `serviceWorkerPath` defaults to `'/firebase-messaging-sw.js'` |
| `requestPermission()` | Ask for browser permission, return FCM token (or `null` if denied) |
| `getDeviceToken()` | Get current token without prompting (returns `null` if not granted) |
| `getPermissionState()` | Returns `'granted'` / `'denied'` / `'default'` |
| `onForegroundMessage(handler)` | Listen for messages when app is in focus. Returns unsubscribe function. |
| `deleteToken()` | Delete FCM token (call on logout / opt-out) |

### Setting up background notifications

Copy `packages/frontend/firebase-messaging-sw.js` to your project's `public/` folder,
then fill in your `firebaseConfig` inside it.

```
public/
└── firebase-messaging-sw.js   ← paste your firebaseConfig here
```

The service worker handles notifications when the browser tab is closed or hidden.
Customize `notificationDefaults` and the `notificationclick` handler inside the file.

---

## Getting credentials

| What | Where to find it |
|---|---|
| Service account JSON (backend) | Firebase Console → Project Settings → Service Accounts → Generate new private key |
| Firebase web config (frontend) | Firebase Console → Project Settings → Your apps → Web app |
| VAPID key (frontend) | Firebase Console → Project Settings → Cloud Messaging → Web Push certificates |
