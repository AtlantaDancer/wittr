self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).then(function(response) {
      if (response.status === 404) {
        // TODO: instead, respond with the gif at
        // /imgs/dr-evil.gif
        // using a network request
        
        // We no longer need this.
        //return new Response("Whoops, not found");
        
        // event.respondWith expects a Promise that resolves to a Response.
        // That's exactly what a fetch() is, unless we chain a .then with a callback.
        // Then the onus of what the Promise ultimately resolves to falls on said
        // callback. Long story short, it is safe to return a fetch here.
        // 
        // We're doing something like:
        // event.respondWith(
        //  new Promise that resolves to Response()
        //  .then(re => new Promise that resolves to Response() )
        // )
        return fetch('/imgs/dr-evil.gif');
      }
      return response;
    }).catch(function() {
      return new Response("Uh oh, that totally failed!");
    })
  );
  
  // Test this on a 404.
  // fetch itself resolves to a Response if you don't .then() it.
  //event.respondWith(fetch('/imgs/dr-evil.gif')); // Loads image
  
  // Test this on a 404.
  // fetch itself resolves to a Response, but if you .then(callback) it, the
  // onus is on the callback.
  //event.respondWith(fetch('/imgs/dr-evil.gif').then()); // Loads image
  //event.respondWith(fetch('/imgs/dr-evil.gif').then(function(){ })); // Breaks page
  //event.respondWith(fetch('/imgs/dr-evil.gif').then(response => response)); // Loads image
});
