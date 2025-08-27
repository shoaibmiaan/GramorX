/* eslint-disable no-undef */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// Precache Next.js assets and additional static files used in drills
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);
workbox.precaching.precacheAndRoute([
  { url: '/brand/logo.png', revision: null },
  { url: '/locales/en/common.json', revision: null },
  { url: '/locales/ur/common.json', revision: null },
  { url: '/premium.css', revision: null },
]);

// Cache practice, vocabulary, and drafts pages
workbox.routing.registerRoute(
  ({ url }) =>
    url.pathname.startsWith('/practice') ||
    url.pathname.startsWith('/vocab') ||
    url.pathname.startsWith('/drafts'),
  new workbox.strategies.NetworkFirst({ cacheName: 'pages-cache' })
);

// Background sync to flush queued requests when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'offline-queue') {
    event.waitUntil(flushQueue());
  }
});

async function flushQueue() {
  const db = await openDB();
  const tx = db.transaction('requests', 'readwrite');
  const store = tx.objectStore('requests');
  const all = store.getAll();
  return new Promise((resolve, reject) => {
    all.onsuccess = async () => {
      const items = all.result;
      for (const entry of items) {
        try {
          await fetch(entry.url, {
            method: entry.method || 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry.body),
          });
        } catch (err) {
          console.error('Sync failed', err);
          reject(err);
          return;
        }
      }
      store.clear();
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    };
    all.onerror = () => reject(all.error);
  });
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('offline-sync', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('requests', { autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
