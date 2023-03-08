const cacheName = "todo"; // Whatever name
// Pass all assets here
// This example use a folder named «/core» in the root folder
// It is mandatory to add an icon (Important for mobile users)
const filesToCache = ["/", "/index.html", "/css/main.css", "/js/main.js"];

self.addEventListener("install", function (event) {
    console.log(event);
    event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(filesToCache)));
});

self.addEventListener("activate", (event) => {
    console.log("Service worker activate event!");
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    console.log("Fetch intercepted for:", event.request.url);
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});
