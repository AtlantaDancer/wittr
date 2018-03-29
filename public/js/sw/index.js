self.addEventListener('fetch', function(event) {
	// TODO: respond to all requests with an html response
	// containing an element with class="a-winner-is-me".
	// Ensure the Content-Type of the response is "text/html"
  
  // respondWith expects a Promise that resolves to a Response.
  // So we make a new Promise and resolve it immediately.
  event.respondWith(
    new Promise(
      resolve => resolve(new Response(
        '<span class="a-winner-is-me">Hello world</span>',
        {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      ))
    )  
  );
  
  // It is not necessary to return the resolve, this works, too:
  /*
  event.respondWith(
    new Promise(
      resolve => {
        resolve(new Response(
          '<span class="a-winner-is-me">Hello world2</span>',
          {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          }
        ));
      }
    )  
  );
  */
});
