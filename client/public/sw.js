// eslint-env serviceworker

self.addEventListener('push', function(event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    // Handle invalid JSON
    data = { title: 'Notification', body: 'You have a new notification.', url: '/' };
  }
  self.registration.showNotification(data.title || 'Notification', {
    body: data.body || '',
    icon: '/icon.png',
    data: { url: data.url || '/' }
  });
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.notification.data && event.notification.data.url && typeof self.clients !== 'undefined') {
    event.waitUntil(self.clients.openWindow(event.notification.data.url));
  }
});
