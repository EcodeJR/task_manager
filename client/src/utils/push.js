// Utility to register service worker and subscribe to push notifications
export async function registerServiceWorkerAndSubscribe(publicVapidKey) {
  if (!('serviceWorker' in navigator)) throw new Error('Service Workers are not supported');
  if (!('PushManager' in window)) throw new Error('Push notifications are not supported');

  // Register the service worker
  const reg = await navigator.serviceWorker.register('/sw.js');

  // Wait for the service worker to be active
  if (reg.installing) {
    await new Promise((resolve) => {
      reg.installing.addEventListener('statechange', function(e) {
        if (e.target.state === 'activated') resolve();
      });
    });
  } else if (reg.waiting) {
    await new Promise((resolve) => {
      reg.waiting.addEventListener('statechange', function(e) {
        if (e.target.state === 'activated') resolve();
      });
    });
  } // else already active

  // Now subscribe
  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
  });
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
