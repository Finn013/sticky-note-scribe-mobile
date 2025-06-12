
const CACHE_NAME = 'sticky-notes-v1';

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
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Игнорируем запросы к Chrome Extension
  if (event.request.url.includes('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Возвращаем кэшированную версию или загружаем из сети
        if (response) {
          return response;
        }
        
        return fetch(event.request).catch(() => {
          // Если офлайн и запрашивается HTML страница, возвращаем главную
          if (event.request.destination === 'document') {
            return caches.match(`${BASE_PATH}/`);
          }
        });
      }
    )
  );
});
