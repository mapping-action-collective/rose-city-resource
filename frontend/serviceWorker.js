/* Read a value from the cache */
async function read (key, store) {
  try {
    const cache = await caches.open(store);
    const value = await cache.match(key);

    return {
      responseObject: value.clone(), // Clone is necessary as the response is a stream and can only be read once
      status: 'OK',
      toJson: async () => {
        return await value.clone().json();
      }
    }
  }
  catch (error) {
    console.error(error);

    return {
      responseObject: null,
      status: 'FAIL'
    }
  }
};

/* Write a value to the cache */
async function write (key, value, store) {
  if (value.clone === 'function') {
    const cache = await caches.open(store);
    await cache.put(key, value.clone());
  }
};

/* Make a network request */
async function acquire (request) {
  try {
    const response = await fetch(request);

    return {
      responseObject: response.clone(), // Clone is necessary as the response is a stream and can only be read once
      status: response.statusText,
      toJson: async () => {
        return await response.clone().json();
      }
    }
  }
  catch (error) {
    console.error(error);

    return {
      responseObject: null,
      status: 'FAIL'
    }
  }
};

/* Clear the cache */
async function clear (store) {
  const status = await caches.delete(store);
  return {
    status: status ? 'OK': 'FAIL'
  }
}
  
self.addEventListener("fetch", async (event) => {
  if (event.request.url.endsWith("/api/meta-information")) {
      const metaInfoFromNetwork = await acquire(event.request);

      if (metaInfoFromNetwork.status === 'OK') {
          const metaInfoNetworkObj = await metaInfoFromNetwork.toJson();
          const updateDateFromNetwork = metaInfoNetworkObj.last_update;

          const metaInfoFromCache = await read('meta-information', 'rose-city-resource');
          if (metaInfoFromCache.status === 'OK') {
              const metaInfoCacheObj = await metaInfoFromCache.toJson();
              const updateDateFromCache = metaInfoCacheObj.last_update;

              if (updateDateFromCache !== updateDateFromNetwork) {
                  if (clear('rose-city-resource') === 'OK') {
                    console.info('Cached data updated to the version published on ', updateDateFromNetwork)
                  }
              }
          }
      }

      write('meta-information', metaInfoFromNetwork.responseObject, 'rose-city-resource');
  }

  else if (event.request.url.endsWith("/api/query")) {
    event.respondWith(
      cacheFirstStrategy(event.request)
    );
  }
});

/* Use a cached response if available; otherwise, make a network request */
async function cacheFirstStrategy (request) {
  const responseFromCache = await read(request, 'rose-city-resource');
  if (responseFromCache.status === 'OK') {
    return responseFromCache.responseObject;
  }
  const responseFromNetwork = await acquire(request);
  if (responseFromNetwork.status !== 'OK') {
    write(request, responseFromNetwork.responseObject, 'rose-city-resource');
    return responseFromNetwork.responseObject;
  }
};