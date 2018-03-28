self.addEventListener('fetch', function(event) {
  console.log('hello world and event: ', event.request);
});
