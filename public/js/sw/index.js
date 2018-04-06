self.addEventListener('install', function(event) {
  var urlsToCache = [
    '/',
    'js/main.js',
    'css/main.css',
    'imgs/icon.png',
    'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
    'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'
  ];

  event.waitUntil(
    // TODO: open a cache named 'wittr-static-v1'
    // Add cache the urls from urlsToCache
    
    // waitUntil extends the lifetime of an event.
    // It has 1 param: a Promise!
    // The method Jake taught to make a new cache, `caches.open`, returns a Promise!
    caches.open('wittr-static-v1')
    // However, this Promise resolves to a cache, and we need to do stuff with that.
    .then(
      // Now that we've then'd the Promise, its resolution is tied to the fate
      // of its callback, if a Promise is returned (which is what we want for 
      // `waitUntil`), the fate of the original Promise is deferred to this new
      // one. Jake also taught us about `cache.addAll`. It does exactly what we
      // need to do and it also returns a Promise!
      wittr_static_cache => wittr_static_cache.addAll(urlsToCache)
    )
  );
});

self.addEventListener('fetch', function(event) {
  // Leave this blank for now.
  // We'll get to this in the next task.
});
