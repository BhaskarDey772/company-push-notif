# @bhaskardey772/fcm-frontend

[![npm](https://img.shields.io/npm/v/@bhaskardey772/fcm-frontend)](https://www.npmjs.com/package/@bhaskardey772/fcm-frontend)
[![GitHub](https://img.shields.io/badge/GitHub-source-181717?logo=github)](https://github.com/BhaskarDey772/company-push-notif)

Frontend helper for **Firebase Cloud Messaging (FCM)**. Handle browser notification permission, get FCM device tokens, and listen for push messages — without writing any Firebase boilerplate.

Framework-agnostic (works with React, Vue, Svelte, vanilla JS/TS, or any bundler). Ships with TypeScript declarations.

---

## Table of Contents

- [Installation](#installation)
  - [Default (bundled)](#default-bundled)
  - [Slim (already have firebase)](#slim-already-have-firebase)
- [Setup](#setup)
  - [Add the service worker](#add-the-service-worker)
- [Usage](#usage)
  - [Initialize](#initialize)
  - [Request Permission & Get Token](#request-permission--get-token)
  - [Listen for Foreground Messages](#listen-for-foreground-messages)
  - [Get Token Without Prompting](#get-token-without-prompting)
  - [Unsubscribe / Delete Token](#unsubscribe--delete-token)
  - [Check Permission State](#check-permission-state)
- [Framework Examples](#framework-examples)
  - [React](#react)
  - [Vue 3](#vue-3)
  - [Vanilla TypeScript](#vanilla-typescript)
- [API Reference](#api-reference)
- [How Notifications Work](#how-notifications-work)
- [TypeScript](#typescript)
- [Troubleshooting](#troubleshooting)

---

## Installation

### Default (bundled)

`firebase` is bundled inside — **nothing else to install**.

```bash
npm install @bhaskardey772/fcm-frontend
```

```ts
import * as notif from '@bhaskardey772/fcm-frontend';
```

Use this if your project does **not** already use `firebase`.

---

### Slim (already have firebase)

If your project already uses `firebase` (e.g. for Firestore, Auth, Realtime Database), use the `/slim` entry to avoid bundling a second copy of firebase into your app.

```bash
npm install @bhaskardey772/fcm-frontend firebase
```

```ts
import * as notif from '@bhaskardey772/fcm-frontend/slim';
```

The `/slim` entry uses your project's existing `firebase` — no duplication, no extra bundle weight.

| | Default | Slim |
|---|---|---|
| Extra install | None | `firebase` |
| Import path | `@bhaskardey772/fcm-frontend` | `@bhaskardey772/fcm-frontend/slim` |
| `firebase` in bundle | Yes (bundled in) | No (uses yours) |
| Use when | Fresh project | Already using `firebase` |

---

## Setup

### Add the service worker

Copy the service worker that ships with this package into your `public/` folder:

```bash
cp node_modules/@bhaskardey772/fcm-frontend/firebase-messaging-sw.js public/
```

The file must be served at the root path `/firebase-messaging-sw.js`. Vite and Create React App copy everything from `public/` to the build root automatically.

> **No Firebase config needed inside the file.** The service worker handles push events using the native Web Push API — it does not depend on the Firebase SDK. Your `firebaseConfig` is only needed in your app code for token generation.

---

## Usage

### Initialize

Call `init()` **once** when your app starts. It registers the service worker and sets up Firebase Messaging for token generation and foreground message handling.

```ts
import * as notif from '@bhaskardey772/fcm-frontend';
// or: import * as notif from '@bhaskardey772/fcm-frontend/slim';

await notif.init({
  firebaseConfig: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT.firebasestorage.app',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID',
  },
  vapidKey: 'YOUR_VAPID_KEY',
});
```

All other functions work exactly the same regardless of which entry you use.

**Where to find your credentials:**

| Credential | Location |
|---|---|
| `firebaseConfig` | Firebase Console → Project Settings → Your apps → Web app |
| `vapidKey` | Firebase Console → Project Settings → Cloud Messaging → Web Push certificates |

---

### Request Permission & Get Token

```ts
const token = await notif.requestPermission();

if (token) {
  // Send token to your backend to register this device
  await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
} else {
  // User denied — do not re-prompt immediately
}
```

- Shows the browser's native permission dialog if not yet answered
- Returns the FCM token string on `'granted'`, or `null` on `'denied'`

---

### Listen for Foreground Messages

The service worker suppresses the native popup when the app is already visible — the same behaviour as WhatsApp. Use `onForegroundMessage` if you want to react to an incoming push while the user is in the app (e.g. show an in-app toast, update a badge):

```ts
const unsubscribe = notif.onForegroundMessage(({ title, body, data }) => {
  // e.g. show a custom in-app banner instead of a system notification
  console.log('New message while app is open:', title, body, data);
});

// Stop listening when component unmounts
unsubscribe();
```

---

### Get Token Without Prompting

On app load, silently check if a token already exists from a previous session:

```ts
const token = await notif.getDeviceToken();
// Returns token string, or null if permission not yet granted
```

---

### Unsubscribe / Delete Token

On logout or when the user opts out:

```ts
// Save token before deleting
const token = await notif.getDeviceToken();

// 1. Remove from FCM
await notif.deleteToken();

// 2. Remove from your backend
await fetch('/api/unsubscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token }),
});
```

---

### Check Permission State

```ts
const state = notif.getPermissionState();
// 'granted' | 'denied' | 'default'

if (state === 'denied') {
  // Show guide to re-enable in browser settings
}
if (state === 'default') {
  // Not yet decided — safe to call requestPermission()
}
```

---

## Framework Examples

### React

Create a hook (`src/hooks/usePushNotifications.ts`):

```ts
import { useEffect, useRef, useState } from 'react';
import * as notif from '@bhaskardey772/fcm-frontend';
// or: import * as notif from '@bhaskardey772/fcm-frontend/slim';

const FIREBASE_CONFIG = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.firebasestorage.app',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
const VAPID_KEY = 'YOUR_VAPID_KEY';

export function usePushNotifications() {
  const [token, setToken]           = useState<string | null>(null);
  const [permission, setPermission] = useState(notif.getPermissionState());
  const initialized                 = useRef(false);

  useEffect(() => {
    // useRef guard prevents double-init in React StrictMode
    if (initialized.current) return;
    initialized.current = true;

    notif.init({ firebaseConfig: FIREBASE_CONFIG, vapidKey: VAPID_KEY });

    const unsubscribe = notif.onForegroundMessage(({ title, body }) => {
      // App is visible — SW won't show a popup. Handle in-app here if needed.
      console.log('Foreground message:', title, body);
    });

    return () => unsubscribe();
  }, []);

  async function subscribe() {
    const fcmToken = await notif.requestPermission();
    if (!fcmToken) { setPermission(notif.getPermissionState()); return null; }

    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: fcmToken }),
    });

    setToken(fcmToken);
    setPermission('granted');
    return fcmToken;
  }

  async function unsubscribe() {
    if (!token) return;
    await notif.deleteToken();
    await fetch('/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    setToken(null);
    setPermission('default');
  }

  return { token, permission, subscribe, unsubscribe };
}
```

Use in any component (`src/App.tsx`):

```tsx
import { usePushNotifications } from './hooks/usePushNotifications';

export default function App() {
  const { token, permission, subscribe, unsubscribe } = usePushNotifications();

  return (
    <div>
      {permission === 'granted' ? (
        <button onClick={unsubscribe}>Unsubscribe</button>
      ) : (
        <button onClick={subscribe}>Enable Notifications</button>
      )}
      {token && <p>Token: {token.slice(0, 20)}…</p>}
    </div>
  );
}
```

---

### Vue 3

```ts
// composables/usePushNotifications.ts
import { onMounted, onUnmounted, ref } from 'vue';
import * as notif from '@bhaskardey772/fcm-frontend';
// or: import * as notif from '@bhaskardey772/fcm-frontend/slim';

const FIREBASE_CONFIG = { /* ... */ };
const VAPID_KEY = 'YOUR_VAPID_KEY';

export function usePushNotifications() {
  const token      = ref<string | null>(null);
  const permission = ref(notif.getPermissionState());
  let unsubscribe: (() => void) | undefined;

  onMounted(async () => {
    await notif.init({ firebaseConfig: FIREBASE_CONFIG, vapidKey: VAPID_KEY });

    unsubscribe = notif.onForegroundMessage(({ title, body }) => {
      // App is visible — SW won't show a popup. Handle in-app here if needed.
      console.log('Foreground message:', title, body);
    });
  });

  onUnmounted(() => unsubscribe?.());

  async function subscribe() {
    const fcmToken = await notif.requestPermission();
    if (!fcmToken) { permission.value = notif.getPermissionState(); return; }

    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: fcmToken }),
    });

    token.value = fcmToken;
    permission.value = 'granted';
  }

  async function unsubscribeDevice() {
    if (!token.value) return;
    await notif.deleteToken();
    await fetch('/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.value }),
    });
    token.value = null;
    permission.value = 'default';
  }

  return { token, permission, subscribe, unsubscribeDevice };
}
```

---

### Vanilla TypeScript

```ts
// main.ts
import * as notif from '@bhaskardey772/fcm-frontend';
// or: import * as notif from '@bhaskardey772/fcm-frontend/slim';

const FIREBASE_CONFIG = { /* ... */ };
const VAPID_KEY = 'YOUR_VAPID_KEY';

await notif.init({ firebaseConfig: FIREBASE_CONFIG, vapidKey: VAPID_KEY });

notif.onForegroundMessage(({ title, body }) => {
  // App is visible — SW won't show a popup. Handle in-app here if needed.
  console.log('Foreground message:', title, body);
});

document.getElementById('subscribeBtn')!.addEventListener('click', async () => {
  const token = await notif.requestPermission();
  if (token) {
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  }
});

document.getElementById('unsubscribeBtn')!.addEventListener('click', async () => {
  const token = await notif.getDeviceToken();
  await notif.deleteToken();
  if (token) {
    await fetch('/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  }
});
```

---

## API Reference

### `init(options): Promise<void>`

Registers the service worker and initialises Firebase Messaging for token generation and foreground message handling. Must be called before any other function.

```ts
interface InitOptions {
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  vapidKey: string;
  serviceWorkerPath?: string; // default: '/firebase-messaging-sw.js'
}
```

### `requestPermission(): Promise<string | null>`

Shows the browser permission dialog. Returns the FCM token, or `null` if denied.

### `getDeviceToken(): Promise<string | null>`

Returns the current FCM token without prompting. Returns `null` if permission not granted.

### `getPermissionState(): 'granted' | 'denied' | 'default'`

Returns the current permission state synchronously.

### `onForegroundMessage(handler): () => void`

Fires when a push message arrives while the app tab is open and visible. The service worker suppresses the native popup in this state, so use this to show a custom in-app notification or update UI. Returns an unsubscribe function.

```ts
interface IncomingNotification {
  title: string;
  body: string;
  imageUrl: string;
  data: Record<string, string>;
  raw: unknown;
}
```

### `deleteToken(): Promise<boolean>`

Deletes the FCM token from the browser. Call this on logout or opt-out, then also notify your backend.

---

## How Notifications Work

| App state | What happens |
|---|---|
| **App visible (tab open & focused)** | SW suppresses the popup — `onForegroundMessage` fires for in-app handling |
| **App in background (tab hidden / minimised)** | SW shows native OS popup automatically |
| **Browser running, tab closed** | SW shows native OS popup automatically |
| **Browser fully closed** | Push is queued by the OS push service and delivered when the browser next starts |

The service worker handles push events using the native Web Push API — no Firebase SDK is loaded inside it. Your `firebaseConfig` is only used in your app code (for token generation and foreground messages). You never need to edit `firebase-messaging-sw.js`.

---

## TypeScript

No `@types/` package needed. Import types directly:

```ts
import type { IncomingNotification, InitOptions } from '@bhaskardey772/fcm-frontend';
```

---

## Service Worker — Supported `data` Fields

The service worker reads these fields from the `data` object of your FCM message. All are optional.

| Field | Type | Description |
|---|---|---|
| `title` | `string` | Notification title (fallback if `notification.title` is absent) |
| `body` | `string` | Notification body (fallback if `notification.body` is absent) |
| `icon` | `string` | URL of the notification icon |
| `badge` | `string` | URL of the small monochrome badge icon (status bar) |
| `image` | `string` | URL of a large inline image |
| `url` | `string` | URL to open when the notification is clicked (default: `/`) |
| `clickUrl` | `string` | Alias for `url` |
| `tag` | `string` | Groups notifications — a new notification with the same tag replaces the old one |
| `actions` | `string` | JSON array of action buttons: `[{"action":"view","title":"View"}]` |
| `requireInteraction` | `string` | Set to `"false"` to let the OS auto-dismiss the notification |

**Example — sending with action buttons from your backend:**

```ts
await notif.sendToDevice(token, {
  title: 'New message',
  body: 'You have a new message.',
  data: {
    url: '/messages',
    tag: 'chat',
    actions: JSON.stringify([
      { action: 'reply',    title: 'Reply' },
      { action: 'dismiss',  title: 'Dismiss' },
    ]),
  },
});
```

---

## Troubleshooting

**"Service worker registration failed"**
- The file must be served at exactly `/firebase-messaging-sw.js`. Check that `public/firebase-messaging-sw.js` exists and your build tool copies it to the root.
- Service workers require a secure origin. Use `http://localhost` in dev, not an IP address.

**Token is `null` after `requestPermission()`**
- `getPermissionState()` returning `'denied'` means the user blocked notifications. They must re-enable manually in browser settings — you cannot re-prompt programmatically.

**Notification not showing when app is open**
- This is intentional. The service worker suppresses popups only when the app tab is the currently focused window (WhatsApp behaviour). If the tab is open but the user switched to another window or tab, the notification will still appear. Use `onForegroundMessage` for in-app handling.

**Notification not showing when tab is closed or browser is in background**
- Open DevTools → Application → Service Workers and confirm the worker is activated with no errors.
- Try unregistering the SW and reloading — the updated SW activates immediately via `skipWaiting`.

**Notification not showing when browser is fully closed**
- This requires the browser's background process to be running.
- Chrome: Settings → System → enable **"Continue running background apps when Google Chrome is closed"**.
- Firefox: `about:config` → `dom.push.enabled` → `true`.

**Using `/slim` but getting "Cannot find module firebase"**
- Make sure `firebase` is installed in your project: `npm install firebase`
