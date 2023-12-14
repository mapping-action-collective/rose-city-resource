  const putInCache = async (request, response) => {
    const cache = await caches.open("rose-city-resource");
    await cache.put(request, response);
  };
  
  const cacheFirst = async (request) => {
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
      return responseFromCache;
    }
    const responseFromNetwork = await fetch(request);
    putInCache(request, responseFromNetwork.clone());
    return responseFromNetwork;
  };
  
  self.addEventListener("fetch", async (event) => {
    if (event.request.url.endsWith("/api/meta-information")) {
        const metaInformationResponseFromNetwork = await fetch(event.request);
        if (metaInformationResponseFromNetwork) {
            const metaInformationFromNetwork = await metaInformationResponseFromNetwork.clone().json();
            const dateOfLastDataUpdateFromNetwork = metaInformationFromNetwork.last_update;

            const metaInformationCachedResponse = await caches.match('meta-information');
            if (metaInformationCachedResponse) {
                const metaInformationCached = await metaInformationCachedResponse.clone().json();
                const dateOfLastDataUpdateCached = metaInformationCached.last_update;

                if (dateOfLastDataUpdateCached !== dateOfLastDataUpdateFromNetwork) {
                    caches.delete('rose-city-resource');
                    console.info('Cached data updated to the version published on ', dateOfLastDataUpdateFromNetwork)
                }
            }
        }

        const cache = await caches.open("rose-city-resource");
        await cache.put("meta-information", metaInformationResponseFromNetwork);
    }

    if (event.request.url.endsWith("/api/query")) {
        event.respondWith(cacheFirst(event.request));
    }
  });