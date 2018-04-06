self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('wittr-static-v1').then(function(cache) {
      return cache.addAll([
        '/',
        'js/main.js',
        'css/main.css',
        'imgs/icon.png',
        'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
        'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  // TODO: respond with an entry from the cache if there is one.
  // If there isn't, fetch from the network.
  
  // It's a good thing Mike tells us to do this synchronously, to not rely on
  // Promises even though that's what we've been doing so far. Browsers have 
  // been fetching things from cache to the user seamless all along, why should
  // we developers introduce any time gap now that we're using service workers?
  // 
  // We still need to use event.respondWith, even though documentation says its
  // sole param expects a Promise that resolves to a Response, Jake has taught 
  // us that it can also take a Response directly instead. So we'll go straight
  // into the cache. `cache.match` and `caches.match` return a Promise that 
  // resolves to a Response, which is exactly what `respondWith` is looking for.
  // But if there's nothing in the cache that matches the request, it returns 
  // `undefined`. That's our cue to go over the network. We can do this all in 
  // essentially one line of code.
  
  // Why doesn't the following work?
  //event.respondWith(
  //  caches.match(event.request, { cacheName: 'wittr-static-v1' }) 
  //  // If the above fails, i.e. is undefined, it resorts to fetch below
  //  ||
  //  fetch(event.request)
  //);
  
  // The above doesn't work b/c caches.match always returns a Promise! It's
  // asynchronous. Even if the request is not found in the cache, the
  // `undefined` is what the Promise itself resolves to. So we fix the code to
  // use the then response handler and shift the logic there.
  event.respondWith(
    caches
      .match(event.request, { cacheName: 'wittr-static-v1' }) // By the way, caches.match takes a second argument of options, one of which specifies the cache name to search in!
      .then(cached_response => cached_response || fetch(event.request))
  );
  
});
