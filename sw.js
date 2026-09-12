// Defesa Fácil — Service Worker
// Cache básico para permitir instalação como app e funcionamento
// parcial offline (a leitura de documentos por IA e a busca de CEP
// continuam exigindo internet, mas o app abre e navega sem conexão).

const CACHE_NAME = 'defesa-facil-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Não intercepta chamadas de API (IA, ViaCEP, Nominatim, Maps, planilha) — só os arquivos do app
  if (event.request.method !== 'GET' || event.request.url.includes('/api') ) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => caches.match('./index.html'));
    })
  );
});
