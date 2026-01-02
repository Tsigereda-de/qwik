/**
 * Service Worker for Qwik + Payload CMS Store PWA
 * Provides offline support and caching strategies
 */

const CACHE_NAME = 'qwik-store-v1';
const ASSET_CACHE_NAME = 'qwik-store-assets-v1';
const API_CACHE_NAME = 'qwik-store-api-v1';

// Files to cache on install
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
];

/**
 * Install event - cache essential assets
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching essential assets');
      return cache.addAll(urlsToCache).catch((error) => {
        console.warn('[Service Worker] Cache addAll error:', error);
        // Don't fail installation if some assets are missing
        return Promise.resolve();
      });
    })
  );

  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName !== CACHE_NAME &&
              cacheName !== ASSET_CACHE_NAME &&
              cacheName !== API_CACHE_NAME
            );
          })
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );

  // Take control of all pages immediately
  self.clients.claim();
});

/**
 * Fetch event - implement caching strategy
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url } = request;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!url.startsWith(self.location.origin)) {
    return;
  }

  // API requests (GraphQL, etc.)
  if (url.includes('/api/') || url.includes('/graphql')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response
          const clonedResponse = response.clone();

          // Cache successful API responses
          if (response.status === 200) {
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }

          return response;
        })
        .catch(() => {
          // Return cached API response if offline
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets (CSS, JS, fonts, images)
  if (
    url.includes('.css') ||
    url.includes('.js') ||
    url.includes('.woff') ||
    url.includes('.woff2') ||
    url.includes('.png') ||
    url.includes('.jpg') ||
    url.includes('.jpeg') ||
    url.includes('.gif') ||
    url.includes('.svg')
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        // Return cached asset if available
        if (response) {
          return response;
        }

        // Otherwise, fetch and cache it
        return fetch(request)
          .then((response) => {
            // Clone the response
            const clonedResponse = response.clone();

            // Cache successful static asset responses
            if (response.status === 200) {
              caches.open(ASSET_CACHE_NAME).then((cache) => {
                cache.put(request, clonedResponse);
              });
            }

            return response;
          })
          .catch(() => {
            // Return offline fallback if available
            return caches.match('/');
          });
      })
    );
    return;
  }

  // HTML pages - network first
  if (request.mode === 'navigate' || url.endsWith('/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();

          if (response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }

          return response;
        })
        .catch(() => {
          // Return cached page if offline
          return caches.match(request);
        })
    );
    return;
  }

  // Default strategy - network first, then cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clonedResponse = response.clone();

        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });
        }

        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

/**
 * Message event - handle skip waiting
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[Service Worker] Loaded');
