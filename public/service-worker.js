/* Chop Gee Service Worker — handles background push notifications */

const ICON_URL = '/choplife-logo.svg';
const BADGE_URL = '/favicon.ico';

/* ── Push event: show native notification + relay to open app tabs ── */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const title = data.title || 'Chop Gee Update 🍽️';
  const body  = data.body  || "Something delicious is happening on Chop Gee!";

  const options = {
    body,
    icon:    ICON_URL,
    badge:   BADGE_URL,
    vibrate: [200, 100, 200],
    tag:     data.tag  || 'chop-gee',
    renotify: true,
    data:    data,
    actions: [
      { action: 'open',    title: 'View update' },
      { action: 'dismiss', title: 'Dismiss'     },
    ],
  };

  event.waitUntil(
    Promise.all([
      /* 1. Show native lock-screen / banner notification */
      self.registration.showNotification(title, options),

      /* 2. Forward the payload to every open app window so the in-app
            Activity drawer can display it without a round-trip to the server. */
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) =>
          client.postMessage({
            type:  'CHOP_GEE_PUSH',
            title,
            body,
            tag:   data.tag   || 'chop-gee',
            extra: data.extra || null,
          })
        );
      }),
    ])
  );
});

/* ── Notification click: focus/open the app ── */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        /* Focus an already-open tab if one exists */
        for (const client of clients) {
          if ('focus' in client) return client.focus();
        }
        /* Otherwise open a new tab */
        return self.clients.openWindow('/');
      })
  );
});

/* ── Install & activate: skip waiting so the SW activates immediately ── */
self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', (event) =>
  event.waitUntil(self.clients.claim())
);
