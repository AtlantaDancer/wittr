// Step 1. refactor version string into re-usable variables and bump the version
// number while at it.
const wittr_version             = 2;
const wittr_static_cache_prefix = 'wittr-static-v';
const wittr_static_cache_name   = `${wittr_static_cache_prefix}${wittr_version}`;

self.addEventListener('install', function(event) {
  event.waitUntil(
    // TODO: change the site's theme, eg swap the vars in public/scss/_theme.scss
    // Ensure at least $primary-color changes
    
    // See Step 2 in public/scss/_theme.scss
    
    // TODO: change cache name to 'wittr-static-v2'
    
    // See Step 1 above.
    caches.open(wittr_static_cache_name).then(function(cache) {
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

self.addEventListener('activate', function(event) {
  event.waitUntil(
    // TODO: remove the old cache
    
    // Step 3. 
    // We will loop through all the caches by their names via `caches.keys`.
    // Then for every cache that isn't the new one, if its name matches the
    // static name pattern of wittr-static-v, then we know it's an older cache,
    // and we can safely kill it with fire. safely.
    caches.keys().then(cache_names => {
      cache_names.map(cache_name => {
        if (cache_name !== wittr_static_cache_name && cache_name.startsWith(wittr_static_cache_prefix)) {
          caches.delete(cache_name);
        }
      });
      // `caches.keys()` Promise now ends along with `waitUntil` as it is not
      // waiting on any of the `caches.delete()` above (they also happen
      // asynchronously and return Promises). This is actually fine, as we don't
      // want the app to hang while we slay the outdated caches. with fire. safely.
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
