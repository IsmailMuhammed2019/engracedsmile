const CACHE_NAME = 'engracedsmile-v1'
const urlsToCache = [
  '/',
  '/book',
  '/bookings',
  '/auth/login',
  '/auth/register',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
]

// Admin routes to exclude from PWA caching
const adminRoutes = ['/admin']

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache')
        return cache.addAll(urlsToCache)
      })
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip caching for admin routes
  if (adminRoutes.some(route => event.request.url.includes(route))) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

