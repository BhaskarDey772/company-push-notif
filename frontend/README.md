# @bhaskardey772/push-notif-frontend

[![npm](https://img.shields.io/npm/v/@bhaskardey772/push-notif-frontend)](https://www.npmjs.com/package/@bhaskardey772/push-notif-frontend)
[![GitHub](https://img.shields.io/badge/GitHub-source-181717?logo=github)](https://github.com/BhaskarDey772/company-push-notif)

Frontend helper for **Firebase Cloud Messaging (FCM)**. Handle browser notification permission, get FCM device tokens, and listen for push messages — without writing any Firebase boilerplate.

Framework-agnostic (works with React, Vue, Svelte, vanilla JS/TS, or any bundler). Ships with TypeScript declarations.

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Setup](#setup)
  - [1. Install the package](#1-install-the-package)
  - [2. Add the service worker](#2-add-the-service-worker)
  - [3. Configure your bundler](#3-configure-your-bundler)
- [Usage](#usage)
  - [Initialize](#initialize)
  - [Request Permission & Get Token](#request-permission--get-token)
  - [Listen for Foreground Messages](#listen-for-foreground-messages)
  - [Get Token Without Prompting](#get-token-without-prompting)
  - [Delete Token (Logout / Opt-out)](#delete-token-logout--opt-out)
  - [Check Permission State](#check-permission-state)
- [Framework Examples](#framework-examples)
  - [React](#react)
  - [Vue 3](#vue-3)
  - [Vanilla TypeScript](#vanilla-typescript)
- [API Reference](#api-reference)
- [TypeScript](#typescript)
- [How Notifications Work](#how-notifications-work)
- [Troubleshooting](#troubleshooting)

---

## Requirements

- A browser that supports [Web Push](https://caniuse.com/push-api) (Chrome 50+, Firefox 44+, Edge 17+, Safari 16+)
- A bundler — Vite, webpack, Rollup, Parcel, etc. (this package uses ES module imports from `firebase`)
- A Firebase project with Cloud Messaging enabled

---

## Installation

### 1. Install the package

```bash
npm install @bhaskardey772/push-notif-frontend firebase
```

`firebase` is a peer dependency — install it once in your project.

### 2. Add the service worker

Copy the service worker template into your project's `public/` directory:

```bash
cp node_modules/@bhaskardey772/push-notif-frontend/firebase-messaging-sw.js public/
```

**No config needed inside the file.** The package automatically sends your `firebaseConfig` to the service worker when you call `init()`, so you only configure it in one place — your app code.

The service worker must be at the root path — `/firebase-messaging-sw.js`. Vite and Create React App both copy everything from `public/` to the build root automatically.

### 3. Configure your bundler

Because `firebase` is a peer dependency inside a locally-linked package, some bundlers need a hint to resolve it from your project's `node_modules`. Add this to your Vite config:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: { firebase: path.resolve(__dirname, 'node_modules/firebase') },
    dedupe: ['firebase'],
  },
});
```

For **webpack**, add to `resolve.alias`:
```js
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      firebase: path.resolve(__dirname, 'node_modules/firebase'),
    },
  },
};
```

---

## Usage

### Initialize

Call `init()` once when your app starts — before using any other function.

```ts
import * as notif from '@bhaskardey772/push-notif-frontend';

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
  // serviceWorkerPath: '/firebase-messaging-sw.js', // default, change if needed
});
```

**Where to find your credentials:**

| Credential | Location |
|---|---|
| `firebaseConfig` | Firebase Console → Project Settings → Your apps → Web app |
| `vapidKey` | Firebase Console → Project Settings → Cloud Messaging → **Web Push certificates** |

---

### Request Permission & Get Token

```ts
const token = await notif.requestPermission();

if (token) {
  // Send the token to your backend so it can target this device
  await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
} else {
  // User denied — do not re-prompt immediately
  console.warn('Notification permission denied');
}
```

- Shows the browser's native permission dialog if not yet decided
- Returns the FCM token string on `'granted'`, or `null` on `'denied'` / `'default'`
- Safe to call multiple times — only prompts once per browser session

---

### Listen for Foreground Messages

FCM suppresses native popups when the browser tab is open. Use `onForegroundMessage` to handle these yourself:

```ts
const unsubscribe = notif.onForegroundMessage(({ title, body, imageUrl, data }) => {
  // Show a native OS notification (appears from the top, same as background)
  new Notification(title, { body, icon: imageUrl });

  // Or show an in-app alert/toast
  showAlert(title, body);
});

// Stop listening when component/page unmounts
unsubscribe();
```

The handler receives a normalized `IncomingNotification` object — no need to dig through the raw FCM payload.

---

### Get Token Without Prompting

If the user already granted permission (e.g. on a previous session), retrieve the token silently:

```ts
const token = await notif.getDeviceToken();
// Returns the token string, or null if permission was not yet granted
```

Use this on app load to check whether you already have a valid token without annoying the user with a prompt.

---

### Delete Token (Logout / Opt-out)

When a user logs out or explicitly turns off notifications, delete their token:

```ts
await notif.deleteToken();
// Also unregister on your backend:
await fetch('/api/unsubscribe', { method: 'POST', body: JSON.stringify({ token }) });
```

The next call to `requestPermission()` will generate a fresh token.

---

### Check Permission State

```ts
const state = notif.getPermissionState();
// 'granted' | 'denied' | 'default'

if (state === 'denied') {
  // User blocked notifications — show a guide to re-enable in browser settings
}
if (state === 'default') {
  // Not yet decided — safe to show a prompt
}
```

---

## Framework Examples

### React

```tsx
// hooks/useNotifications.ts
import { useEffect } from 'react';
import * as notif from '@bhaskardey772/push-notif-frontend';

const FIREBASE_CONFIG = { /* ... */ };
const VAPID_KEY = 'BPsx...';

export function useNotifications() {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function setup() {
      await notif.init({ firebaseConfig: FIREBASE_CONFIG, vapidKey: VAPID_KEY });

      unsubscribe = notif.onForegroundMessage(({ title, body }) => {
        new Notification(title, { body });
      });
    }

    setup();
    return () => unsubscribe?.();
  }, []);
}

async function subscribe() {
  const token = await notif.requestPermission();
  if (token) {
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  }
  return token;
}

// App.tsx
import { useNotifications } from './hooks/useNotifications';

export default function App() {
  useNotifications();
  return <button onClick={subscribe}>Enable Notifications</button>;
}
```

---

### Vue 3

```ts
// composables/useNotifications.ts
import { onMounted, onUnmounted } from 'vue';
import * as notif from '@bhaskardey772/push-notif-frontend';

const FIREBASE_CONFIG = { /* ... */ };
const VAPID_KEY = 'BPsx...';

export function useNotifications() {
  let unsubscribe: (() => void) | undefined;

  onMounted(async () => {
    await notif.init({ firebaseConfig: FIREBASE_CONFIG, vapidKey: VAPID_KEY });

    unsubscribe = notif.onForegroundMessage(({ title, body }) => {
      new Notification(title, { body });
    });
  });

  onUnmounted(() => unsubscribe?.());

  async function subscribe() {
    const token = await notif.requestPermission();
    if (token) {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
    }
    return token;
  }

  return { subscribe };
}
```

---

### Vanilla TypeScript

```ts
// main.ts
import * as notif from '@bhaskardey772/push-notif-frontend';

const FIREBASE_CONFIG = { /* ... */ };
const VAPID_KEY = 'BPsx...';

await notif.init({ firebaseConfig: FIREBASE_CONFIG, vapidKey: VAPID_KEY });

// Listen for foreground messages
const unsubscribe = notif.onForegroundMessage(({ title, body }) => {
  new Notification(title, { body });
});

// Wire up your UI
document.getElementById('enableBtn')!.addEventListener('click', async () => {
  const token = await notif.requestPermission();
  if (token) {
    await fetch('/api/subscribe', {
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

Initialize the helper. Must be called before any other function.

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

---

### `requestPermission(): Promise<string | null>`

Shows the browser permission dialog (if not already answered). Returns the FCM token, or `null` if denied.

---

### `getDeviceToken(): Promise<string | null>`

Returns the current FCM token without prompting. Returns `null` if permission has not been granted.

---

### `getPermissionState(): 'granted' | 'denied' | 'default'`

Returns the current notification permission state synchronously.

---

### `onForegroundMessage(handler): () => void`

Listens for push messages while the browser tab is open. Returns an unsubscribe function.

```ts
interface IncomingNotification {
  title: string;
  body: string;
  imageUrl: string;
  data: Record<string, string>; // Custom key-value pairs from the sender
  raw: unknown;                 // Full raw FCM payload (advanced use)
}
```

---

### `deleteToken(): Promise<boolean>`

Deletes the FCM token from the browser and FCM server. Returns `true` on success.

After calling this, also tell your backend to remove the token from its store:

```ts
const token = await notif.getDeviceToken(); // save before deleting

await notif.deleteToken();

await fetch('/api/unsubscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token }),
});
```

---

## TypeScript

Import types directly from the package — no `@types/` needed:

```ts
import type { IncomingNotification, InitOptions } from '@bhaskardey772/push-notif-frontend';
```

---

## How Notifications Work

Understanding when each handler fires helps you build the right UX:

| App state | What happens |
|---|---|
| **Tab is open** | FCM calls `onForegroundMessage` — native popup is suppressed. Call `new Notification()` yourself. |
| **Tab is closed, browser running** | Service worker's `onBackgroundMessage` fires → shows native OS popup from the top |
| **Browser completely closed** | Push is queued by the browser's push service. Delivered when browser next starts. |

The service worker (`firebase-messaging-sw.js`) handles the background case automatically — you only need to wire up `onForegroundMessage` in your app code.

---

## Troubleshooting

**"Service worker registration failed"**
- The file must be at exactly `/firebase-messaging-sw.js` (root path). Check that your `public/` folder contains the file and your build tool copies it.
- On local dev with Vite, make sure you're accessing via `http://localhost` (not an IP). Service workers require a secure origin (`https` or `localhost`).

**Token is `null` after `requestPermission()`**
- Check `getPermissionState()` — if it returns `'denied'`, the user must re-enable in browser settings manually. You cannot re-prompt programmatically after a denial.

**Foreground messages not appearing**
- Call `new Notification(title, { body })` inside your `onForegroundMessage` handler. FCM suppresses the native popup when the tab is open.

**Background messages not appearing**
- Verify the Firebase config in `firebase-messaging-sw.js` is correct (copy-paste from Firebase Console).
- Open DevTools → Application → Service Workers and check the worker is registered and activated.
- On Chrome, check `chrome://serviceworker-internals` for errors.

**Bundler can't resolve `firebase`**
- Add the alias config described in [Configure your bundler](#3-configure-your-bundler).
