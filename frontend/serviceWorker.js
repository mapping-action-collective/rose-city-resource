const cacheName = "rose-city-resource";

self.addEventListener("fetch", async (event) => {
  if (event.request.url.endsWith("/api/meta-information")) {
    event.respondWith(
      caches.open(cacheName).then((cache) => {
        return cache.match(event.request.url).then((cachedResponse) => {
          return fetch(event.request).then(async (fetchedResponse) => {
            if (
              cachedResponse?.status === 200 &&
              fetchedResponse.status === 200
            ) {
              const updateDateFromCache = (await cachedResponse.clone().json())
                .last_update;
              const updateDateFromNetwork = (
                await fetchedResponse.clone().json()
              ).last_update;
              if (
                isDateValid(updateDateFromCache) &&
                isDateValid(updateDateFromNetwork)
              ) {
                if (updateDateFromCache !== updateDateFromNetwork) {
                  /* Clear the cache since the data version has changed */
                  caches.delete(cacheName).then((status) => {
                    if (status) {
                      console.info(
                        "Cached data updated to the version published on ",
                        updateDateFromNetwork
                      );
                    }
                  });
                }
              }
            }
            cache.put(event.request, fetchedResponse.clone());
            return fetchedResponse;
          });
        });
      })
    );
  } else if (event.request.url.endsWith("/api/query")) {
    event.respondWith(
      caches.open(cacheName).then((cache) => {
        return cache.match(event.request.url).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((fetchedResponse) => {
            cache.put(event.request, fetchedResponse.clone());
            return fetchedResponse;
          });
        });
      })
    );
  }
});

function isDateValid(dateStr) {
  return !Number.isNaN(new Date(dateStr));
}
