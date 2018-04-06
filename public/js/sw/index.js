// Step 1. refactor version string into re-usable variables and bump the version
// number while at it.
const wittr_version             = '2a';
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
    // We grab all the cache names via `caches.keys`. 
    // We want to delete all caches that are:
    // 1. Not the current cache,
    // 2. Do not start with the pattern of our cache names.
    // 
    // Note this is less efficient than the previous solution as we loop at most
    // twice, whereas before we just looped once.
    caches.keys().then(cache_names => {
      cache_names
        .filter(cache_name => (cache_name !== wittr_static_cache_name && cache_name.startsWith(wittr_static_cache_prefix)))
        .map(old_cache_name => caches.delete(old_cache_name));
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
