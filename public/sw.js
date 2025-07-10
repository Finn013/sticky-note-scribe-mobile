
const CACHE_NAME = 'sticky-notes-v2';
const FORCE_CACHE_URLS = ['chrome-extension://', 'moz-extension://', 'safari-web-extension://'];

// Определяем базовый путь в зависимости от окружения
const getBasePath = () => {
  const hostname = self.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '';
  }
  return '/sticky-note-scribe-mobile';
};

const BASE_PATH = getBasePath();

const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.json`
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Кэширование основных ресурсов');
        return cache.addAll(urlsToCache).catch((error) => {
          console.log('Некоторые ресурсы не удалось закэшировать:', error);
          // Кэшируем основные файлы по отдельности
          return Promise.allSettled(
            urlsToCache.map(url => cache.add(url))
          );
        });
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Игнорируем запросы к расширениям браузера и внешним ресурсам
  if (FORCE_CACHE_URLS.some(prefix => event.request.url.includes(prefix)) || 
      event.request.url.includes('retagro.com') ||
      !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // ВСЕГДА возвращаем кэшированную версию если она есть
        if (cachedResponse) {
          console.log('Возвращаем из кэша:', event.request.url);
          return cachedResponse;
        }
        
        // Если нет в кэше - пытаемся загрузить и сохранить в кэш
        return fetch(event.request).then((response) => {
          // Проверяем что ответ валидный
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Клонируем ответ для кэша
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              console.log('Добавляем в кэш:', event.request.url);
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Если офлайн и запрашивается HTML страница, возвращаем главную из кэша
          if (event.request.destination === 'document') {
            return caches.match(`${BASE_PATH}/`) || caches.match(`${BASE_PATH}/index.html`);
          }
          // Для других ресурсов возвращаем базовый ответ
          return new Response('', { 
            status: 200, 
            statusText: 'OK',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
      .catch((error) => {
        console.error('Ошибка в SW fetch:', error);
        // В случае любой ошибки пытаемся вернуть главную страницу из кэша
        if (event.request.destination === 'document') {
          return caches.match(`${BASE_PATH}/`) || caches.match(`${BASE_PATH}/index.html`);
        }
        return new Response('', { status: 200 });
      })
  );
});

// Обновление кэша только по команде (через сообщение)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FORCE_UPDATE') {
    console.log('Получена команда принудительного обновления');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('Удаление кэша для обновления:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('Кэш очищен, перезагружаем страницу');
        return self.clients.matchAll();
      }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'CACHE_CLEARED' });
        });
      })
    );
  }
});
