self.addEventListener('fetch', function(event) {
  // TODO: only respond to requests with a
  // url ending in ".jpg"
  
  // The Request details can be found in FetchEvent's request property.
  // The Request's URL is in its url property.
  // --
  // We don't care for multiple ".jpg" occuring within the URL string, just the 
  // end. We also don't care for cachebusters/query strings at the end.
  
  // Pre-ES6 way of checking end of string is to grab a piece of it starting 
  // from its end. We do minus 4 because we know .jpg is 4 characters.
  // Could be more programmatic/clear by saying substr('.jpg'.length) and re-use
  // '.jpg' in a variable to prevent errors.
//  if (event.request.url.substr(-4) === '.jpg') {
//    console.log('3.13.2 Pre-ES6-style condition');
//    event.respondWith(
//      fetch('/imgs/dr-evil.gif')
//    );
//  }
  
  // ES6 introduces a new method for String:
  // endsWith(needle, haystack_length) where latter param is optional.
  // This is much cleaner/clear in terms of what I, as a developer, am trying 
  // to do in this condition. Definitely preferable readability-wise, not to
  // mention less likely to make a mistake.
  if (event.request.url.endsWith('.jpg')) {
    console.log('3.13.2 ES6-style condition');
    event.respondWith(
      fetch('/imgs/dr-evil.gif')
    );
  }
});
