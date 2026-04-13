self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

self.addEventListener('push', (event) => {
  event.waitUntil(handlePush(event));
});

async function handlePush(event) {
  // Suppress only when the user has the app tab actively focused — same as OneSignal.
  // visibilityState === 'visible' is too aggressive: it suppresses even when the user
  // is on a different tab or window. client.focused is the correct check.
  const windowClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  if (windowClients.some((c) => c.focused)) return;

  let title   = '';
  let options = {};

  try {
    const payload = event.data ? event.data.json() : {};
    const n    = payload.notification ?? {};
    const data = payload.data ?? {};

    title = n.title || data.title || 'Notification';

    // Action buttons — sender can pass: data.actions = '[{"action":"open","title":"View"}]'
    let actions = [];
    try { actions = JSON.parse(data.actions || '[]'); } catch (_) {}

    options = {
      body:               n.body  || data.body  || '',
      icon:               n.icon  || data.icon  || '/favicon.svg',
      badge:              n.badge || data.badge || '/favicon.svg',
      image:              n.image || data.image  || undefined,
      tag:                data.tag || undefined,
      renotify:           !!data.tag,   // re-alert only when sender sets an explicit tag
      timestamp:          Date.now(),
      vibrate:            [200, 100, 200],
      actions,
      data:               { url: data.url || data.clickUrl || '/', ...data },
      requireInteraction: data.requireInteraction !== 'false',
    };
  } catch (_) {
    title   = 'Notification';
    options = {
      icon:               '/favicon.svg',
      badge:              '/favicon.svg',
      timestamp:          Date.now(),
      vibrate:            [200, 100, 200],
      data:               { url: '/' },
      requireInteraction: true,
    };
  }

  await self.registration.showNotification(title, options);
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      // Find any open window from the same origin — navigate it rather than opening a new tab.
      const existing = list.find((c) => new URL(c.url).origin === self.location.origin);
      if (existing) return existing.focus().then((w) => w.navigate(url));
      return clients.openWindow(url);
    })
  );
});
