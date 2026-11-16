/* TEST-only PWA network-first update worker. v6.14.17 */
const MEMO_SW_BUILD='6.14.17-test.1';
const TEST_CACHE_PREFIX='memo-test-only-';
self.addEventListener('install',event=>{
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(name=>name.startsWith(TEST_CACHE_PREFIX)).map(name=>caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  const scope=new URL(self.registration.scope);
  // The test worker never intercepts production /memo/ routes or Supabase.
  if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
  const file=url.pathname.slice(scope.pathname.length).toLowerCase();
  const html=request.mode==='navigate'||file===''||file==='index.html';
  const releaseFile=file==='version.json'||file==='manifest.webmanifest'||file==='sw.js';
  if(html||releaseFile){
    // No app-shell cache may hide a newly uploaded release, including in PWA.
    event.respondWith(fetch(new Request(request,{cache:'no-store'})));
  }
});
self.addEventListener('message',event=>{
  if(event.data?.type==='MEMO_TEST_WORKER_BUILD'){
    event.ports?.[0]?.postMessage({build:MEMO_SW_BUILD});
  }
});
