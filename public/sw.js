/**
 * Service Worker - 乡遗识 PWA
 * 
 * 功能：
 * - 缓存静态资源
 * - 离线访问支持
 * - 网络优先策略
 */

const CACHE_NAME = 'heritage-harvest-v1';
const STATIC_CACHE = 'heritage-harvest-static-v1';
const DYNAMIC_CACHE = 'heritage-harvest-dynamic-v1';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/heritage-harvest/',
  '/heritage-harvest/index.html',
  '/heritage-harvest/manifest.json',
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// 请求拦截 - 网络优先策略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非同源请求和 Chrome 扩展请求
  if (url.origin !== location.origin) {
    return;
  }

  // 跳过 API 请求
  if (url.pathname.includes('/api/')) {
    return;
  }

  // 对于导航请求，使用网络优先策略
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 克隆响应并缓存
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // 网络失败时使用缓存
          return caches.match(request).then((response) => {
            return response || caches.match('/heritage-harvest/index.html');
          });
        })
    );
    return;
  }

  // 对于其他请求，使用缓存优先策略
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // 后台更新缓存
        fetch(request).then((networkResponse) => {
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, networkResponse);
          });
        });
        return cachedResponse;
      }

      // 没有缓存时从网络获取
      return fetch(request).then((networkResponse) => {
        // 缓存成功的响应
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      });
    })
  );
});

// 后台同步
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
});

// 推送通知
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || '乡遗识';
  const options = {
    body: data.body || '有新的非遗体验等你探索',
    icon: '/heritage-harvest/icons/icon-192x192.png',
    badge: '/heritage-harvest/icons/icon-72x72.png',
    data: data.url || '/heritage-harvest/',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 通知点击
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data));
});
