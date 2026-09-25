// オフライン対応の Service Worker（本番ビルドのときだけ main.js から登録）
// ・ページ(HTML): ネット優先（公開した更新がすぐ反映される）。オフライン時は保存済みのものを使う
// ・JS/CSS(ファイル名にハッシュ付き)・アイコン・フォント: 一度取得したら保存したものを使う
const CACHE='mario-v2-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return res;})
      .catch(()=>caches.match('./index.html')));
    return;
  }
  const cacheable=url.origin===self.location.origin||url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com';
  if(!cacheable)return;
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
    if(res.ok||res.type==='opaque'){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
    return res;
  })));
});
