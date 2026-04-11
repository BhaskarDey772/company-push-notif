// firebase-messaging-sw.js
// Copy this file to your project's public/ directory as-is.
// No Firebase config needed here — the package sends it automatically.

importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js');

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

let messaging = null;

// Receive Firebase config from the app (posted by @bhaskardey772/fcm-frontend init())
// This means users only configure firebaseConfig in ONE place — their app code.
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'FIREBASE_CONFIG') return;
  if (messaging) return; // already initialized

  firebase.initializeApp(event.data.firebaseConfig);
  messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const n    = payload.notification ?? {};
    const data = payload.data ?? {};
    const title = n.title || data.title;
    const body  = n.body  || data.body || '';

    if (!title) return;

    self.registration.showNotification(title, {
      body,
      icon: n.icon || '/favicon.svg',
      badge: '/favicon.svg',
      tag: `fcm:${title}:${body}`,
      data: { url: data.clickUrl || '/', ...data },
      requireInteraction: true,
    });
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
