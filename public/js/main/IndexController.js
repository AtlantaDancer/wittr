import PostsView from './views/Posts';
import ToastsView from './views/Toasts';
import idb from 'idb';

function openDatabase() {
  // If the browser doesn't support service worker,
  // we don't care about having a database
  if (!navigator.serviceWorker) {
    return Promise.resolve();
  }

  return idb.open('wittr', 1, function(upgradeDb) {
    var store = upgradeDb.createObjectStore('wittrs', {
      keyPath: 'id'
    });
    store.createIndex('by-date', 'time');
  });
}

export default function IndexController(container) {
  this._container = container;
  this._postsView = new PostsView(this._container);
  this._toastsView = new ToastsView(this._container);
  this._lostConnectionToast = null;
  this._dbPromise = openDatabase();
  this._registerServiceWorker();

  var indexController = this;

  this._showCachedMessages().then(function() {
    indexController._openSocket();
  });
}

IndexController.prototype._registerServiceWorker = function() {
  if (!navigator.serviceWorker) return;

  var indexController = this;

  navigator.serviceWorker.register('/sw.js').then(function(reg) {
    if (!navigator.serviceWorker.controller) {
      return;
    }

    if (reg.waiting) {
      indexController._updateReady(reg.waiting);
      return;
    }

    if (reg.installing) {
      indexController._trackInstalling(reg.installing);
      return;
    }

    reg.addEventListener('updatefound', function() {
      indexController._trackInstalling(reg.installing);
    });
  });

  // Ensure refresh is only called once.
  // This works around a bug in "force update on reload".
  var refreshing;
  navigator.serviceWorker.addEventListener('controllerchange', function() {
    if (refreshing) return;
    window.location.reload();
    refreshing = true;
  });
};

IndexController.prototype._showCachedMessages = function() {
  var indexController = this;

  return this._dbPromise.then(function(db) {
    // if we're already showing posts, eg shift-refresh
    // or the very first load, there's no point fetching
    // posts from IDB
    if (!db || indexController._postsView.showingPosts()) return;

    // TODO: get all of the wittr message objects from indexeddb,
    // then pass them to:
    // indexController._postsView.addPosts(messages)
    // in order of date, starting with the latest.
    // Remember to return a promise that does all this,
    // so the websocket isn't opened until you're done!
    
    // Solution #1:
    // idb-test has all the sample code, however, the order would be all wrong.
    // How do we retreive all messages (and leave it in a promise?)?
    // 
    // If we use openCursor, we can reverse the direction of iteration i.e.
    // `index.openCursor(null, "prev")`
    // Credit: https://stackoverflow.com/a/25055070/781824
    // 
    // Is there a way to, say, "getAll" via cursor?
    // Nope.
    // 
    // Jake notes promises are tricky with cursor, so iterateCursor is actually 
    // openCursor that takes a 3rd argument -- a callback function with IDBCursor 
    // as its argument.
    /*
    let messages = new Array();
    return db.transaction('wittrs').objectStore('wittrs').index('by-date').iterateCursor(null, 'prev', cursor => {
      if ( ! cursor) {
        console.log('no cursor', messages); // Proof the messages are sorted as desired.
        indexController._postsView.addPosts(messages);
        return;
      }
      messages.push(cursor.value);
      cursor.continue();
    });
    */
    
    // Solution #2:
    // Since we can grab all the messages, we can use Array.reverse.
    return db.transaction('wittrs').objectStore('wittrs').index('by-date').getAll().then(messages => {
      const descending_messages = messages.reverse();
      console.log('messages in date descending order ', descending_messages); // Proof the messages are sorted as desired.
      indexController._postsView.addPosts(descending_messages);
    });
  });
};

IndexController.prototype._trackInstalling = function(worker) {
  var indexController = this;
  worker.addEventListener('statechange', function() {
    if (worker.state == 'installed') {
      indexController._updateReady(worker);
    }
  });
};

IndexController.prototype._updateReady = function(worker) {
  var toast = this._toastsView.show("New version available", {
    buttons: ['refresh', 'dismiss']
  });

  toast.answer.then(function(answer) {
    if (answer != 'refresh') return;
    worker.postMessage({action: 'skipWaiting'});
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

  this._dbPromise.then(function(db) {
    if (!db) return;

    var tx = db.transaction('wittrs', 'readwrite');
    var store = tx.objectStore('wittrs');
    messages.forEach(function(message) {
      store.put(message);
    });
  });

  this._postsView.addPosts(messages);
};
