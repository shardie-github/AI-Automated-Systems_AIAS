/**
 * Secure Service Worker for AIAS Platform PWA
 * Implements security best practices, caching strategies, and offline support
 */

const CACHE_VERSION = 'v2';
const CACHE_NAME = `aias-platform-${CACHE_VERSION}`;
const OFFLINE_PAGE = '/offline';
const API_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Security: Whitelist of allowed origins for fetch requests
const ALLOWED_ORIGINS = [
  self.location.origin,
  'https://*.supabase.co',
  'https://*.supabase.in',
];

// Resources to cache on install
const PRECACHE_RESOURCES = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
];

/**
 * Validate origin for security
 */
function isAllowedOrigin(url) {
  try {
    const urlObj = new URL(url);
    return ALLOWED_ORIGINS.some(origin => {
      if (origin.includes('*')) {
        // Escape literal dots first, then replace * with .* for regex matching
        // Using $ anchor to ensure exact match to end of string
        const pattern = origin.replace(/\./g, '\\.').replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(urlObj.origin);
      }
      return urlObj.origin === origin;
    });
  } catch {
    return false;
  }
}

/**
 * Install event - cache critical resources
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching precache resources');
        return cache.addAll(PRECACHE_RESOURCES.map(url => new Request(url, { credentials: 'same-origin' })));
      })
      .then(() => {
        console.log('[SW] Service worker installed');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[SW] Install failed:', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim(); // Take control of all pages
      })
  );
});

/**
 * Fetch event - implement caching strategy with security
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Security: Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Security: Validate origin
  if (!isAllowedOrigin(request.url)) {
    console.warn('[SW] Blocked request to unauthorized origin:', request.url);
    event.respondWith(new Response('Forbidden', { status: 403 }));
    return;
  }

  // Skip non-GET requests and chrome-extension:// URLs
  if (url.protocol === 'chrome-extension:' || url.protocol === 'chrome:') {
    return;
  }

  // API requests - network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Static assets - cache first with network fallback
  if (isStaticAsset(request.url)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // HTML pages - network first with cache fallback
  event.respondWith(handlePageRequest(request));
});

/**
 * Handle API requests - network first, cache fallback
 */
async function handleApiRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  try {
    // Try network first
    const networkResponse = await fetch(request, {
      credentials: 'same-origin',
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'X-Service-Worker': 'true',
      },
    });

    // Cache successful responses (only GET requests)
    if (networkResponse.ok && networkResponse.status === 200) {
      const responseClone = networkResponse.clone();
      
      // Check if response should be cached (based on headers or path)
      const cacheControl = networkResponse.headers.get('Cache-Control');
      const shouldCache = !cacheControl || !cacheControl.includes('no-cache');
      
      if (shouldCache) {
        cache.put(request, responseClone).catch(() => {
          // Ignore cache errors
        });
      }
      
      return networkResponse;
    }

    // If network fails, return cached response if available
    if (cachedResponse) {
      return cachedResponse;
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Network request failed:', error);
    
    // Return cached response if available
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response for API requests
    return new Response(
      JSON.stringify({ error: 'Offline', message: 'You are currently offline' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Handle static assets - cache first, network fallback
 */
async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request, {
      credentials: 'same-origin',
    });

    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone).catch(() => {
        // Ignore cache errors
      });
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Static asset fetch failed:', error);
    return new Response('Not Found', { status: 404 });
  }
}

/**
 * Handle page requests - network first, cache fallback
 */
async function handlePageRequest(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const networkResponse = await fetch(request, {
      credentials: 'same-origin',
    });

    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone).catch(() => {
        // Ignore cache errors
      });
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Page fetch failed:', error);
    
    // Try to return cached page
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    const offlineResponse = await cache.match(OFFLINE_PAGE);
    if (offlineResponse) {
      return offlineResponse;
    }

    return new Response('Offline', { status: 503 });
  }
}

/**
 * Check if URL is a static asset
 */
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.ico'];
  return staticExtensions.some(ext => url.includes(ext));
}

/**
 * Message handler for cache management
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});
