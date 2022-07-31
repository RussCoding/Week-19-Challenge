const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'V.01.00';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
  "./icons/icon-72x72.png",
  "./icons/icon-96x96.png",
  "./icons/icon-128x128.png",
  "./icons/icon-144x144.png",
  "./icons/icon-152x152.png",
  "./icons/icon-192x192.png",
  "./icons/icon-384x384.png",
  "./icons/icon-512x512.png",
  "./manifest.json",
  "./index.html",
  "./js/idb.js",
  "./js/index.js",
  "./css/styles.css"
];
//caching all required files for offline functionality
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('Caching data to ' + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE);
        })
    )
});

//retrieve cached data
self.addEventListener("fetch", function(e) {
    console.log('Requesting: ' + e.request.url);
    e.respondWith(
        caches.match(e.request).then(function (request){
            if (request) {
                console.log('Fetching cached data: ' + e.request.url);
                return request;
            }
            else {
                console.log('File is not cached, getting: ' + e.request.url);
                return fetch(e.request);
            }
        })
    );
});


//deleting old cached data
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keyList) {
            let cacheKeepList = keyList.filter(function(key) {
                return key.indexOf(APP_PREFIX);
            })
            cacheKeepList.push(CACHE_NAME);
            return Promise.all(keyList.map(function (key, i) {
                if(cacheKeepList.indexOf(key) === -1) {
                    console.log('Deleting cache: ' + keyList[i]);
                    return caches.delete(keyList[i]);
                }
            }));
        })
    );
});