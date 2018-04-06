var staticCacheName = 'wittr-static-v3';

self.addEventListener('install', function(event) {
  // TODO: cache /skeleton rather than the root page

  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        '/skeleton', // This was originally '/'
        'js/main.js',
        'css/main.css',
        'imgs/icon.png',
        'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
        'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('wittr-') &&
                 cacheName != staticCacheName;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  // TODO: respond to requests for the root page with
  // the page skeleton from the cache
  
  // First off, what does a request for the root page look like?
  // We will only see it once this updated SW is active and we navigate to the
  // root page. Refreshing will not trigger a request for the root.
  //console.log('request: ', event.request.url, new URL(event.request.url));
  // When the URL's pathname is '/' and its origin is the same as the one we're 
  // currently on, that's our cue to sub in the page skeleton instead.
  // 
  // There's no global window object in the SW. It does have a global location,
  // which is the exact same as self.location. It also has a self.origin, too.
  
  const request_url = new URL(event.request.url); // This allows us to look for '/'.
  let cache_request = (request_url.pathname === '/' && request_url.origin === self.origin) ? '/skeleton' : event.request;

  event.respondWith(
    // When matching against the cache, if fetching the root, we replaced `event.request` with '/skeleton' above
    caches.match(cache_request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
