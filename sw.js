/* 노블 메신저 – 서비스 워커 (휴대폰 알림, 앱 설치) */
const CACHE = 'noble-msg-v1';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'config.js', 'vendor/supabase-2.118.0.js', 'icons/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
/* 화면 파일: 네트워크 우선, 끊기면 저장본 사용 (항상 최신 버전 유지) */
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then((r) => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request).then((m) => m || caches.match('index.html'))));
});

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: '노블 메신저', body: e.data ? e.data.text() : '' }; }
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    // 앱을 보고 있는 중이면 화면 안에서 알려주므로 휴대폰 알림은 생략
    if (wins.some((w) => w.visibilityState === 'visible' && w.focused)) return;
    await self.registration.showNotification(d.title || '노블 메신저', {
      body: d.body || '', tag: d.tag, renotify: true,
      icon: 'icons/icon-192.png', badge: 'icons/badge-96.png', data: { url: d.url || '' }
    });
  })());
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = new URL('./' + (e.notification.data && e.notification.data.url ? e.notification.data.url : ''), self.registration.scope).href;
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) {
      if (w.url.startsWith(self.registration.scope)) { await w.focus(); w.postMessage({ type: 'open', url: e.notification.data && e.notification.data.url }); return; }
    }
    await self.clients.openWindow(target);
  })());
});
