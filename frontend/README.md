# @bhaskardey772/push-notif-frontend

[![npm](https://img.shields.io/npm/v/@bhaskardey772/push-notif-frontend)](https://www.npmjs.com/package/@bhaskardey772/push-notif-frontend)
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
npm install @bhaskardey772/push-notif-frontend
```

```ts
import * as notif from '@bhaskardey772/push-notif-frontend';
```

Use this if your project does **not** already use `firebase`.

---

### Slim (already have firebase)

If your project already uses `firebase` (e.g. for Firestore, Auth, Realtime Database), use the `/slim` entry to avoid bundling a second copy of firebase into your app.

```bash
npm install @bhaskardey772/push-notif-frontend firebase
```

```ts
import * as notif from '@bhaskardey772/push-notif-frontend/slim';
```

The `/slim` entry uses your project's existing `firebase` — no duplication, no extra bundle weight.

| | Default | Slim |
|---|---|---|
| Extra install | None | `firebase` |
| Import path | `@bhaskardey772/push-notif-frontend` | `@bhaskardey772/push-notif-frontend/slim` |
| `firebase` in bundle | Yes (bundled in) | No (uses yours) |
| Use when | Fresh project | Already using `firebase` |

---

## Setup

### Add the service worker

Copy the service worker that ships with this package into your `public/` folder:

```bash
cp node_modules/@bhaskardey772/push-notif-frontend/firebase-messaging-sw.js public/
```

> **No config needed inside the file.** When you call `init()`, the package automatically sends your `firebaseConfig` to the service worker. You only configure Firebase in one place — your app code.

The file must be served at the root path `/firebase-messaging-sw.js`. Vite and Create React App copy everything from `public/` to the build root automatically.

---

## Usage

### Initialize

Call `init()` **once** when your app starts. It registers the service worker and posts your Firebase config to it automatically.

```ts
import * as notif from '@bhaskardey772/push-notif-frontend';
// or: import * as notif from '@bhaskardey772/push-notif-frontend/slim';

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

FCM suppresses the native popup when the browser tab is open. Fire `new Notification()` yourself so the user sees it:

```ts
const unsubscribe = notif.onForegroundMessage(({ title, body, imageUrl }) => {
  new Notification(title, { body, icon: imageUrl || '/favicon.svg' });
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
import * as notif from '@bhaskardey772/push-notif-frontend';
// or: import * as notif from '@bhaskardey772/push-notif-frontend/slim';

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

    const unsubscribe = notif.onForegroundMessage(({ title, body, imageUrl }) => {
      new Notification(title, { body, icon: imageUrl || '/favicon.svg' });
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
import * as notif from '@bhaskardey772/push-notif-frontend';
// or: import * as notif from '@bhaskardey772/push-notif-frontend/slim';

const FIREBASE_CONFIG = { /* ... */ };
const VAPID_KEY = 'YOUR_VAPID_KEY';

export function usePushNotifications() {
  const token      = ref<string | null>(null);
  const permission = ref(notif.getPermissionState());
  let unsubscribe: (() => void) | undefined;

  onMounted(async () => {
    await notif.init({ firebaseConfig: FIREBASE_CONFIG, vapidKey: VAPID_KEY });

    unsubscribe = notif.onForegroundMessage(({ title, body, imageUrl }) => {
      new Notification(title, { body, icon: imageUrl || '/favicon.svg' });
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
import * as notif from '@bhaskardey772/push-notif-frontend';
// or: import * as notif from '@bhaskardey772/push-notif-frontend/slim';

const FIREBASE_CONFIG = { /* ... */ };
const VAPID_KEY = 'YOUR_VAPID_KEY';

await notif.init({ firebaseConfig: FIREBASE_CONFIG, vapidKey: VAPID_KEY });

notif.onForegroundMessage(({ title, body, imageUrl }) => {
  new Notification(title, { body, icon: imageUrl || '/favicon.svg' });
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

Registers the service worker and automatically posts `firebaseConfig` to it. Must be called before any other function.

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

Fires when a push message arrives while the tab is open. Returns an unsubscribe function.

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
| **Tab open** | `onForegroundMessage` fires — call `new Notification()` yourself |
| **Tab closed, browser running** | Service worker wakes up → shows native OS popup automatically |
| **Browser fully closed** | Queued by the OS push service, delivered when browser next starts |

The service worker (`firebase-messaging-sw.js`) receives its Firebase config from `init()` via `postMessage` — you never need to edit it.

---

## TypeScript

No `@types/` package needed. Import types directly:

```ts
import type { IncomingNotification, InitOptions } from '@bhaskardey772/push-notif-frontend';
```

---

## Troubleshooting

**"Service worker registration failed"**
- The file must be served at exactly `/firebase-messaging-sw.js`. Check that `public/firebase-messaging-sw.js` exists and your build tool copies it to the root.
- Service workers require a secure origin. Use `http://localhost` in dev, not an IP address.

**Token is `null` after `requestPermission()`**
- `getPermissionState()` returning `'denied'` means the user blocked notifications. They must re-enable manually in browser settings — you cannot re-prompt programmatically.

**Foreground messages not appearing**
- Call `new Notification(title, { body })` inside `onForegroundMessage`. FCM suppresses the native popup when the tab is open.

**Background messages not appearing**
- Open DevTools → Application → Service Workers and confirm the worker is activated.
- Try unregistering the SW and reloading — the updated SW activates immediately via `skipWaiting`.

**Using `/slim` but getting "Cannot find module firebase"**
- Make sure `firebase` is installed in your project: `npm install firebase`
