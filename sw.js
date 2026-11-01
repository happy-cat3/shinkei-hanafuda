// ルナ先生知育ワールド:かんたんな オフライン対応。ネットが つながるときは いつも 新しい版を とりにいく(古い版が のこらない)。つながらないときだけ 前に見た版を つかう。
const CACHE='luna-v1';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const c=res.clone();caches.open(CACHE).then(ch=>ch.put(r,c)).catch(()=>{})}return res}).catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('./index.html'):undefined))))});
