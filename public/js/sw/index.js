self.addEventListener('fetch', function(event) {
  // event.respondWith's argument is either a Response object or a Promise that resolves with a Response.
  event.respondWith(
    //new Response('Hello world') // Response's argument can be anything, blob, buffer, simplest thing is string.
    //new Response('Hello <strong>world</strong>.') // This will print even the HTML tags, b/c the browser will not render it as HTML but as plain text by default.
    new Response('Hello <strong>world</strong>.', { // The second argument of Response is an object that can set headers.
      headers: {'foo': 'bar'}
    })
  );
});
