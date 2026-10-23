/* Production memo app: network-first navigation, v6.15.1 */
const MEMO_SW_BUILD='6.15.1-stable';
self.addEventListener('install',event=>{event.waitUntil(self.skipWaiting())});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(k=>k.startsWith('memo-production-only-')).map(k=>caches.delete(k)));
 await self.clients.claim();
})())});
self.addEventListener('fetch',event=>{
 const request=event.request;if(request.method!=='GET')return;
 const url=new URL(request.url);if(url.origin!==self.location.origin)return;
 const pathname=url.pathname.toLowerCase();
 if(request.mode==='navigate'||pathname.endsWith('/index.html')||pathname.endsWith('/version.json')||pathname.endsWith('/sw.js')){
  event.respondWith(fetch(new Request(request,{cache:'no-store'})));
 }
});
