self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

self.addEventListener('push', (event) => {
  event.waitUntil(handlePush(event));
});

async function handlePush(event) {
  // Skip if the app is already open and visible in any window.
  const windowClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  if (windowClients.some((c) => c.visibilityState === 'visible')) return;

  let title = '';
  let options = {};

  try {
    const payload = event.data ? event.data.json() : {};
    const n    = payload.notification ?? {};
    const data = payload.data ?? {};

    title = n.title || data.title || 'Notification';

    options = {
      body:               n.body  || data.body  || '',
      icon:               n.icon  || data.icon  || '/favicon.svg',
      badge:              '/favicon.svg',
      image:              n.image || data.image,
      tag:                data.tag || `fcm-${Date.now()}`,
      data:               data,
      requireInteraction: true,
    };
  } catch (_) {
    title   = 'Notification';
    options = { icon: '/favicon.svg', tag: `fcm-${Date.now()}` };
  }

  await self.registration.showNotification(title, options);
}

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
