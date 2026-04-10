/**
 * firebase-messaging-sw.js
 *
 * Service worker for Firebase Cloud Messaging.
 * Copy this file to your project's `public/` directory (or wherever your
 * static assets are served from), so it is accessible at /firebase-messaging-sw.js.
 *
 * This file handles BACKGROUND notifications — messages received when the
 * browser tab is closed or in the background.
 *
 * HOW TO CUSTOMIZE:
 *  1. Change `notificationDefaults` below to match your brand.
 *  2. The `notificationclick` handler controls what happens when the user
 *     taps the notification (e.g. which URL to open).
 *  3. You do NOT need to change the Firebase config or messaging setup here —
 *     the config is injected at runtime by the FCM SDK.
 */

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ─── STEP 1: Paste your Firebase web config here ─────────────────────────────
// (Same object you pass to notif.init() in your frontend code)
const firebaseConfig = {
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME',
  projectId: 'REPLACE_ME',
  storageBucket: 'REPLACE_ME',
  messagingSenderId: 'REPLACE_ME',
  appId: 'REPLACE_ME',
};
// ─────────────────────────────────────────────────────────────────────────────

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ─── Default notification appearance ─────────────────────────────────────────
const notificationDefaults = {
  icon: '/icons/notification-icon.png', // Your app icon
  badge: '/icons/badge-icon.png',       // Small monochrome badge (Android)
  requireInteraction: false,            // Keep notification until user dismisses (true) or auto-dismiss (false)
  renotify: false,
  silent: false,
};

// ─── Background message handler ───────────────────────────────────────────────
// Triggered when a DATA-only message arrives while the app is in the background.
// For notification messages with a `notification` field, FCM shows them automatically.
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw] Background message received:', payload);

  const notification = payload.notification || {};
  const data = payload.data || {};

  const title = notification.title || data.title || 'New Notification';
  const body = notification.body || data.body || '';

  self.registration.showNotification(title, {
    body,
    icon: notification.icon || notificationDefaults.icon,
    badge: notificationDefaults.badge,
    image: notification.image || data.imageUrl || undefined,
    data: { url: data.clickUrl || data.url || '/', ...data },
    requireInteraction: notificationDefaults.requireInteraction,
    silent: notificationDefaults.silent,
  });
});

// ─── Notification click handler ───────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // If a tab with the target URL is already open, focus it
        for (const client of windowClients) {
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new tab
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
