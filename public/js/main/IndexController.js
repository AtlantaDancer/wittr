import PostsView from './views/Posts';
import ToastsView from './views/Toasts';
import idb from 'idb';


// This constructor takes care of the set up of our app, including setting up
// the web socket for the live updates. For now, we'll ignore everything.
export default function IndexController(container) {
  this._container = container;
  this._postsView = new PostsView(this._container);
  this._toastsView = new ToastsView(this._container);
  this._lostConnectionToast = null;
  this._openSocket(); // Custom code for our app, whatever that is. In this case it's setting up views, getting ready to receive wheats (what's a wheat??).
  this._registerServiceWorker();
}

IndexController.prototype._registerServiceWorker = function() {
  // TODO: register service worker
  
  // Browser's SW isn't going to change, and we'll only refer to this variable  
  // as serviceWorker, ergo const. 
  // Also, we won't have to type navigator.serviceWorker more than once.
  const sw = navigator.serviceWorker;
  
  // If the browser doesn't support SW, it'll be undefined, coerce to false, and
  // no SW-related code will run and break the browser. Otherwise we're all good!
  if (sw) {
    // The SW should not compete with system/network resources.
    // Exception is if you need to do `clients.claim()` ASAP, monitor so you're 
    // not competing with the main page's requests in that case.
    // 
    // Credit:
    // @link https://developers.google.com/web/fundamentals/primers/service-workers/registration#improving_the_boilerplate
    window.addEventListener('load', () => {
      sw.register('/sw.js');
    });
  }
};

// open a connection to the server for live updates
IndexController.prototype._openSocket = function() {
  var indexController = this;
  var latestPostDate = this._postsView.getLatestPostDate();

  // create a url pointing to /updates with the ws protocol
  var socketUrl = new URL('/updates', window.location);
  socketUrl.protocol = 'ws';

  if (latestPostDate) {
    socketUrl.search = 'since=' + latestPostDate.valueOf();
  }

  // this is a little hack for the settings page's tests,
  // it isn't needed for Wittr
  socketUrl.search += '&' + location.search.slice(1);

  var ws = new WebSocket(socketUrl.href);

  // add listeners
  ws.addEventListener('open', function() {
    if (indexController._lostConnectionToast) {
      indexController._lostConnectionToast.hide();
    }
  });

  ws.addEventListener('message', function(event) {
    requestAnimationFrame(function() {
      indexController._onSocketMessage(event.data);
    });
  });

  ws.addEventListener('close', function() {
    // tell the user
    if (!indexController._lostConnectionToast) {
      indexController._lostConnectionToast = indexController._toastsView.show("Unable to connect. Retrying…");
    }

    // try and reconnect in 5 seconds
    setTimeout(function() {
      indexController._openSocket();
    }, 5000);
  });
};

// called when the web socket sends message data
IndexController.prototype._onSocketMessage = function(data) {
  var messages = JSON.parse(data);
  this._postsView.addPosts(messages);
};
