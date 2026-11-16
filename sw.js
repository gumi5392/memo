/* Production PWA network-first update worker. v6.16.0 */
const MEMO_SW_BUILD='6.16.0-production.1';
const PRODUCTION_CACHE_PREFIX='memo-production-only-';
self.addEventListener('install',event=>{
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(name=>name.startsWith(PRODUCTION_CACHE_PREFIX)).map(name=>caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  const scope=new URL(self.registration.scope);
  if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
  const file=url.pathname.slice(scope.pathname.length).toLowerCase();
  // The production worker must never handle the separately hosted test app.
  if(file.startsWith('test/'))return;
  const html=request.mode==='navigate'||file===''||file==='index.html';
  const releaseFile=file==='version.json'||file==='manifest.webmanifest'||file==='sw.js';
  if(html||releaseFile){
    event.respondWith(fetch(new Request(request,{cache:'no-store'})));
  }
});
self.addEventListener('message',event=>{
  if(event.data?.type==='MEMO_PRODUCTION_WORKER_BUILD'){
    event.ports?.[0]?.postMessage({build:MEMO_SW_BUILD});
  }
});
