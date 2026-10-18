/* Network-first service worker for the note app. v6.10.0 */
const MEMO_SW_BUILD='6.10.0-test.1';
self.addEventListener('install',event=>{
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('memo-test-only-')).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  const pathname=url.pathname.toLowerCase();
  // Never serve an old HTML document, version declaration or service worker script.
  if(request.mode==='navigate'||pathname.endsWith('/index.html')||pathname.endsWith('/version.json')||pathname.endsWith('/sw.js')){
    event.respondWith(fetch(new Request(request,{cache:'no-store'})));
  }
});
