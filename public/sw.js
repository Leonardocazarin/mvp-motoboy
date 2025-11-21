// Service Worker para PWA - Motoboy Cockpit
const CACHE_NAME = 'motoboy-cockpit-v2';
const RUNTIME_CACHE = 'motoboy-runtime-v2';

// Arquivos essenciais para cache
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache aberto, adicionando arquivos...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Arquivos em cache!');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Erro ao cachear arquivos:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service Worker ativado!');
      return self.clients.claim();
    })
  );
});

// Estratégia de cache: Network First com fallback para Cache
self.addEventListener('fetch', (event) => {
  // Ignorar requisições não-GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorar requisições de chrome-extension e outras origens
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Verificar se é uma resposta válida
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone a resposta para cachear
        const responseToCache = response.clone();
        
        caches.open(RUNTIME_CACHE)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          })
          .catch((error) => {
            console.error('[SW] Erro ao cachear:', error);
          });
        
        return response;
      })
      .catch(() => {
        // Se falhar, buscar no cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Servindo do cache:', event.request.url);
              return cachedResponse;
            }
            
            // Se não encontrar no cache, retornar página offline
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Suporte para notificações push
self.addEventListener('push', (event) => {
  console.log('[SW] Push recebido:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do Motoboy Cockpit',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'motoboy-notification',
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Abrir App' },
      { action: 'close', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Motoboy Cockpit', options)
  );
});

// Ação ao clicar na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificação clicada:', event.action);
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Aqui você pode sincronizar dados quando a conexão voltar
      Promise.resolve()
    );
  }
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('[SW] Mensagem recebida:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
});

console.log('[SW] Service Worker carregado!');
