import PostsView from './views/Posts';
import ToastsView from './views/Toasts';
import idb from 'idb';

export default function IndexController(container) {
  this._container = container;
  this._postsView = new PostsView(this._container);
  this._toastsView = new ToastsView(this._container);
  this._lostConnectionToast = null;
  this._openSocket();
  this._registerServiceWorker();
}

IndexController.prototype._registerServiceWorker = function() {
  if (!navigator.serviceWorker) return;

  var indexController = this;
  
  /**
   * statechange event handler for installed SWs
   *
   * Since we'll have to do this at least twice, let's make something for re-use.
   * If the SW's state becomes installed, run _updateReady.
   * 
   * @param {ServiceWorker} sw  A SW via reg.installing
   */
  let monitor_installing_sw = sw => sw.addEventListener('statechange', function() {
    if (this.state === 'installed') {
      indexController._updateReady();
    }
  });

  navigator.serviceWorker.register('/sw.js').then(function(reg) {
    // TODO: if there's no controller, this page wasn't loaded
    // via a service worker, so they're looking at the latest version.
    // In that case, exit early
    
    // Even if there is a reg.active Service Worker (SW), it's not actually
    // controlling this page unless navigator.serviceWorker.controller exists.
    if ( ! navigator.serviceWorker.controller ) return;

    // TODO: if there's an updated worker already waiting, call
    // indexController._updateReady()
    
    // At this point navigator.serviceWorker.controller === reg.active.
    // There's no way to gauge from it if there's another SW wandering around
    // the interwebs. That role is filled by this Service Worker Registration.
    // If it's waiting, it's ready.
    if ( reg.waiting ) {
      indexController._updateReady();
    }

    // TODO: if there's an updated worker installing, track its
    // progress. If it becomes "installed", call
    // indexController._updateReady()
    if ( reg.installing ) {
      monitor_installing_sw(reg.installing);
    }

    // TODO: otherwise, listen for new installing workers arriving.
    // If one arrives, track its progress.
    // If it becomes "installed", call
    // indexController._updateReady()
    
    // If there's an update to the SW, reg.installing will always be a new value.
    // E.g. Before/After values for reg.installing
    // 
    // Scenario 1:
    // Before: installing
    // Update: finished installing
    // After:  null - it is now reg.waiting
    // 
    // Scenario 2:
    // Before: installing
    // Update: failed to install
    // After:  null - no longer a SW, presumably
    // 
    // Scenario 3:
    // Before: null
    // Update: new SW
    // After:  installing
    // 
    // So if reg.installing exists, it's a different SW from before, so we can
    // always add the statechange event listener, just like in Jake's code.
    // 
    reg.addEventListener('updatefound', () => {
      let sw = reg.installing;
      if (sw) {
        monitor_installing_sw(sw);
      }
    });
  });
};

IndexController.prototype._updateReady = function() {
  var toast = this._toastsView.show("New version available", {
    buttons: ['whatever']
  });
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
