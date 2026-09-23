module.exports=[79512,n=>n.a(async(t,e)=>{try{var i=n.i(89171),h=n.i(63034),c=n.i(73853),a=t([h]);if([h]=a.then?(await a)():a,"function"!=typeof h.default)throw Error('Default export is missing in "./sitemap.ts"');async function x(){let n=await (0,h.default)(),t=(0,c.resolveRouteData)(n,"sitemap");return new i.NextResponse(t,{headers:{"Content-Type":"application/xml","Cache-Control":"public, max-age=0, must-revalidate"}})}n.s(["GET",0,x]),e()}catch(n){e(n)}},!1),87576,n=>n.a(async(t,e)=>{try{var i=n.i(79512),h=n.i(63034),c=t([i,h]);[i,h]=c.then?(await c)():c,n.s(["GET",()=>i.GET,"dynamic",()=>h.dynamic]),e()}catch(n){e(n)}},!1),83345,n=>{"use strict";var t=n.i(47909),e=n.i(74017),i=n.i(96250),h=n.i(59756),c=n.i(61916),a=n.i(74677),x=n.i(69741),r=n.i(16795),g=n.i(87718),o=n.i(95169),u=n.i(47587),l=n.i(66012),s=n.i(70101),p=n.i(26937),d=n.i(10372),m=n.i(93695);n.i(52474);var f=n.i(220);let v=new t.AppRouteRouteModule({definition:{kind:e.RouteKind.APP_ROUTE,page:"/sitemap.xml/route",pathname:"/sitemap.xml",filename:"sitemap--route-entry",bundlePath:""},distDir:".next-seo-audit",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/sitemap--route-entry.js",nextConfigOutput:"standalone",userland:()=>n.r(87576),...{}}),{workAsyncStorage:y,workUnitAsyncStorage:b,serverHooks:T}=v;async function C(n,t,i){i.requestMeta&&(0,h.setRequestMeta)(n,i.requestMeta),v.isDev&&(0,h.addRequestMeta)(n,"devRequestTimingInternalsEnd",process.hrtime.bigint());let y="/sitemap.xml/route";y=y.replace(/\/index$/,"")||"/";let b=await v.prepare(n,t,{srcPage:y,multiZoneDraftMode:!1});if(!b)return t.statusCode=400,t.end("Bad Request"),null==i.waitUntil||i.waitUntil.call(i,Promise.resolve()),null;let{buildId:T,deploymentId:C,params:k,nextConfig:E,parsedUrl:P,isDraftMode:I,prerenderManifest:R,routerServerContext:O,isOnDemandRevalidate:w,revalidateOnlyGenerated:q,resolvedPathname:N,clientReferenceManifest:A,serverActionsManifest:S}=b,D=(0,x.normalizeAppPath)(y),M=!!(R.dynamicRoutes[D]||R.routes[N]),H=async()=>((null==O?void 0:O.render404)?await O.render404(n,t,P,!1):t.end("This page could not be found"),null);if(M&&!I){let n=!!R.routes[N],t=R.dynamicRoutes[D];if(t&&!1===t.fallback&&!n){if(E.adapterPath)return await H();throw new m.NoFallbackError}}let L=null;!M||v.isDev||I||(L="/index"===(L=N)?"/":L);let _=!0===v.isDev||!M,K=M&&!_;S&&A&&(0,a.setManifestsSingleton)({page:y,clientReferenceManifest:A,serverActionsManifest:S});let G=n.method||"GET",B=(0,c.getTracer)(),U=B.getActiveScopeSpan(),V=!!(null==O?void 0:O.isWrappedByNextServer),$=!!(0,h.getRequestMeta)(n,"minimalMode"),F=(0,h.getRequestMeta)(n,"incrementalCache")||await v.getIncrementalCache(n,E,R,$);null==F||F.resetRequestCache(),globalThis.__incrementalCache=F;let j={params:k,previewProps:R.preview,renderOpts:{experimental:{authInterrupts:!!E.experimental.authInterrupts,useCacheTimeout:E.experimental.useCacheTimeout},cacheComponents:!!E.cacheComponents,validationLevel:E.experimental.instantInsights.validationLevel,supportsDynamicResponse:_,incrementalCache:F,hmrRefreshHash:(0,h.getRequestMeta)(n,"hmrRefreshHash"),cacheLifeProfiles:E.cacheLife,staticPageGenerationTimeout:E.staticPageGenerationTimeout,waitUntil:i.waitUntil,onClose:n=>{t.on("close",n)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,e,i,h)=>v.onRequestError(n,t,i,h,O)},sharedContext:{buildId:T,deploymentId:C}},X=new r.NodeNextRequest(n),Q=new r.NodeNextResponse(t),Z=g.NextRequestAdapter.fromNodeNextRequest(X,(0,g.signalFromNodeResponse)(t)),W=async({previousCacheEntry:e})=>{try{if(!$&&w&&q&&!e)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let h=await v.handle(Z,j);n.fetchMetrics=j.renderOpts.fetchMetrics;let c=j.renderOpts.pendingWaitUntil;c&&i.waitUntil&&(i.waitUntil(c),c=void 0);let a=j.renderOpts.collectedTags;if(!M)return await (0,l.sendResponse)(X,Q,h,c),null;{let n=await h.blob(),t=(0,s.toNodeOutgoingHttpHeaders)(h.headers);a&&(t[d.NEXT_CACHE_TAGS_HEADER]=a),!t["content-type"]&&n.type&&(t["content-type"]=n.type);let e=void 0!==j.renderOpts.collectedRevalidate&&!(j.renderOpts.collectedRevalidate>=d.INFINITE_CACHE)&&j.renderOpts.collectedRevalidate,i=void 0===j.renderOpts.collectedExpire||j.renderOpts.collectedExpire>=d.INFINITE_CACHE?!1!==e&&e>0?E.expireTime:void 0:j.renderOpts.collectedExpire;return{value:{kind:f.CachedRouteKind.APP_ROUTE,status:h.status,body:Buffer.from(await n.arrayBuffer()),headers:t},cacheControl:{revalidate:e,expire:i}}}}catch(t){throw(null==e?void 0:e.isStale)&&await v.onRequestError(n,t,{routerKind:"App Router",routePath:y,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:K,isOnDemandRevalidate:w})},!1,O),t}},Y=async(h,a)=>{try{var x,r;let h=await v.handleResponse({req:n,nextConfig:E,cacheKey:L,routeKind:e.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:R,isRoutePPREnabled:!1,isOnDemandRevalidate:w,revalidateOnlyGenerated:q,responseGenerator:W,waitUntil:i.waitUntil,isMinimalMode:$});if(!M)return;if((null==h||null==(x=h.value)?void 0:x.kind)!==f.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==h||null==(r=h.value)?void 0:r.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});$||t.setHeader("x-nextjs-cache",w?"REVALIDATED":h.isMiss?"MISS":h.isStale?"STALE":"HIT"),I&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let c=(0,s.fromNodeOutgoingHttpHeaders)(h.value.headers);$&&M||c.delete(d.NEXT_CACHE_TAGS_HEADER),!h.cacheControl||t.getHeader("Cache-Control")||c.get("Cache-Control")||c.set("Cache-Control",(0,p.getCacheControlHeader)(h.cacheControl)),await (0,l.sendResponse)(X,Q,new Response(h.value.body,{headers:c,status:h.value.status||200}));return}catch(t){if(t instanceof m.NoFallbackError||await v.onRequestError(n,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:K,isOnDemandRevalidate:w})},!1,O),M)throw t;await (0,l.sendResponse)(X,Q,new Response(null,{status:500}));return}finally{(()=>{if(!h)return;let n=t.statusCode;h.setAttributes({"http.status_code":n,"next.rsc":!1}),n&&n>=500&&(h.setStatus({code:c.SpanStatusCode.ERROR}),h.setAttribute("error.type",n.toString()));let e=B.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==o.BaseServerSpan.handleRequest)return console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let i=e.get("next.route")||D,x=`${G} ${i}`;h.setAttributes({"next.route":i,"http.route":i,"next.span_name":x}),h.updateName(x),a&&a!==h&&(a.setAttribute("http.route",i),a.updateName(x))})()}};if(V&&U)await Y(U,void 0);else{let t=B.getActiveScopeSpan();await B.withPropagatedContext(n.headers,()=>B.trace(o.BaseServerSpan.handleRequest,{spanName:`${G} ${y}`,kind:c.SpanKind.SERVER,attributes:{"http.method":G,"http.target":n.url}},n=>Y(n,t)),void 0,!V)}}n.s(["handler",0,C,"patchFetch",0,function(){return(0,i.patchFetch)({workAsyncStorage:y,workUnitAsyncStorage:b})},"routeModule",0,v,"serverHooks",0,T,"workAsyncStorage",0,y,"workUnitAsyncStorage",0,b])},63034,n=>n.a(async(t,e)=>{try{var i=n.i(80985),h=n.i(62329),c=t([i]);async function a(){let n=(0,h.getSiteUrl)(),t=["","/blog","/pricing","/try","/diagnostic","/support","/privacy","/terms"].map(t=>({url:`${n}${t}`})),e=await (0,i.publishedSitemapRows)();return[...t,...e.map(t=>({url:`${n}/blog/${t.slug}`,lastModified:t.updatedAt}))]}[i]=c.then?(await c)():c,n.s(["default",0,a,"dynamic",0,"force-dynamic"]),e()}catch(n){e(n)}},!1),5843,n=>{"use strict";let t={publishedAt:new Date("2026-09-20T02:00:00.000Z"),createdAt:new Date("2026-09-20T02:00:00.000Z"),updatedAt:new Date("2026-09-20T02:00:00.000Z")},e=(n,t)=>({name:n,slug:t});function i(n){let e;return{...n,...t,status:"PUBLISHED",coverMediaId:null,noindex:!1,createdBy:"editorial",updatedBy:"editorial",editorialCover:(e=n.category,`/blog/cover/${e.toLowerCase()}`)}}let h=[i({id:"editorial-score-roadmap",category:"TOEIC_STRATEGY",slug:"chien-luoc-tang-diem-toeic-450-den-700",title:"Chiến lược tăng điểm TOEIC từ 450 lên 700: học gì trước?",excerpt:"Lộ trình ưu tiên theo từng mốc điểm, giúp bạn ngừng học dàn trải và tập trung vào những phần tạo ra nhiều điểm nhất.",seoTitle:"Cách tăng điểm TOEIC từ 450 lên 700 theo lộ trình",seoDescription:"Lộ trình tăng điểm TOEIC 450 lên 700: chọn Part ưu tiên, phân bổ thời gian, đo tiến bộ và tránh các lỗi học dàn trải.",canonicalPath:"/blog/chien-luoc-tang-diem-toeic-450-den-700",coverAlt:"Bản đồ lộ trình tăng điểm TOEIC từ 450 lên 700",socialTitle:"Tăng TOEIC 450 lên 700: lộ trình thực tế",socialDescription:"Biết rõ nên học gì trước ở từng giai đoạn thay vì luyện đề liên tục.",authorName:"TOEICGym Editorial",targetTopic:"tăng điểm TOEIC 450 lên 700",searchIntent:"informational",tags:[e("Lộ trình TOEIC","lo-trinh-toeic"),e("TOEIC 700","toeic-700")],content:`## Đừng bắt đầu bằng một lịch học thật d\xe0y

Từ 450 l\xean 700 kh\xf4ng chỉ l\xe0 l\xe0m th\xeam thật nhiều đề. Khoảng điểm n\xe0y thường cho thấy người học đ\xe3 nhận ra cấu tr\xfac b\xe0i thi nhưng c\xf2n mất điểm v\xec ba nguy\xean nh\xe2n: vốn từ theo ngữ cảnh chưa đủ, ngữ ph\xe1p nền chưa tự động v\xe0 tốc độ xử l\xfd chưa ổn định. V\xec vậy, lộ tr\xecnh hiệu quả cần ưu ti\xean đ\xfang thứ tự.

## Giai đoạn 1: củng cố điểm chắc chắn

Trong 2 tuần đầu, h\xe3y d\xf9ng một b\xe0i đ\xe1nh gi\xe1 để x\xe1c định Part yếu thay v\xec đo\xe1n. Với Reading, ưu ti\xean Part 5 để củng cố loại từ, th\xec, mệnh đề quan hệ v\xe0 li\xean từ. Với Listening, tập trung Part 2 v\xec c\xe2u ngắn gi\xfap bạn nhận ra nhanh vấn đề về từ để hỏi, th\xec v\xe0 \xfd định người n\xf3i.

- Học 20–30 ph\xfat mỗi ng\xe0y, 5 ng\xe0y mỗi tuần.
- Sau mỗi lượt luyện, ghi lại **l\xfd do sai**, kh\xf4ng chỉ đ\xe1p \xe1n đ\xfang.
- \xd4n lại c\xe2u sai sau 1 ng\xe0y v\xe0 3 ng\xe0y.
- Chỉ tăng số lượng khi độ ch\xednh x\xe1c đ\xe3 ổn định.

## Giai đoạn 2: chuyển từ kiến thức sang tốc độ

Khi Part 5 v\xe0 Part 2 đạt khoảng 75–80% trong c\xe1c bộ c\xe2u vừa sức, bắt đầu gh\xe9p b\xe0i theo nh\xf3m. Part 3–4 cần nghe theo cụm th\xf4ng tin: ai, ở đ\xe2u, vấn đề g\xec v\xe0 h\xe0nh động tiếp theo. Part 6–7 cần đọc c\xe2u hỏi trước, t\xecm từ kh\xf3a v\xe0 nhận ra c\xe1ch đề diễn đạt lại th\xf4ng tin.

Đừng bấm giờ qu\xe1 gắt ngay từ đầu. H\xe3y đo thời gian ho\xe0n th\xe0nh tự nhi\xean trong ba buổi, sau đ\xf3 giảm mục ti\xeau khoảng 5–10% mỗi tuần. Tốc độ bền vững đến từ khả năng nhận dạng mẫu c\xe2u, kh\xf4ng phải đọc hoặc nghe vội.

## Giai đoạn 3: m\xf4 phỏng \xe1p lực b\xe0i thi

Trong 2–3 tuần cuối, xen kẽ một b\xe0i thi thử với c\xe1c buổi sửa lỗi. Một b\xe0i thi thử chỉ c\xf3 gi\xe1 trị khi bạn d\xe0nh đủ thời gian ph\xe2n t\xedch. Chia lỗi th\xe0nh bốn nh\xf3m: thiếu từ vựng, sai ngữ ph\xe1p, bỏ s\xf3t chi tiết v\xe0 quản l\xfd thời gian. Nh\xf3m lỗi xuất hiện nhiều nhất sẽ l\xe0 trọng t\xe2m tuần tiếp theo.

## Lịch mẫu 6 tuần

- **Tuần 1–2:** Part 2, Part 5 v\xe0 từ vựng nền. Theo d\xf5i độ ch\xednh x\xe1c theo kỹ năng.
- **Tuần 3–4:** Part 3–4, Part 6–7. Theo d\xf5i tốc độ v\xe0 lỗi paraphrase.
- **Tuần 5:** B\xe0i hỗn hợp theo nửa đề. Theo d\xf5i sức bền v\xe0 c\xe1ch ph\xe2n bổ thời gian.
- **Tuần 6:** Thi thử, sửa lỗi v\xe0 \xf4n nhẹ. Theo d\xf5i độ ổn định qua nhiều lần l\xe0m b\xe0i.

Điểm số kh\xf4ng tăng tuyến t\xednh từng ng\xe0y. H\xe3y nh\xecn xu hướng của 3–5 phi\xean gần nhất v\xe0 số lỗi lặp lại. Khi lỗi cũ giảm, bạn đang tiến bộ ngay cả khi một b\xe0i cụ thể kh\xf3 hơn.`}),i({id:"editorial-listening",category:"LISTENING",slug:"cach-luyen-nghe-toeic-part-3-4",title:"Cách luyện nghe TOEIC Part 3 và 4 không cần nghe từng từ",excerpt:"Kỹ thuật đọc trước câu hỏi, dự đoán bối cảnh và bắt cụm thông tin giúp bạn theo kịp hội thoại dài.",seoTitle:"Cách luyện nghe TOEIC Part 3, 4 hiệu quả",seoDescription:"Hướng dẫn luyện nghe TOEIC Part 3 và 4: đọc trước câu hỏi, bắt từ khóa, nhận diện paraphrase và sửa lỗi bằng transcript.",canonicalPath:"/blog/cach-luyen-nghe-toeic-part-3-4",coverAlt:"Tai nghe và dạng sóng minh họa luyện nghe TOEIC Part 3 và 4",socialTitle:"Nghe Part 3–4 mà không cần hiểu từng từ",socialDescription:"Một quy trình nghe chủ động, dễ áp dụng trong mỗi buổi luyện.",authorName:"TOEICGym Editorial",targetTopic:"cách luyện nghe TOEIC Part 3 4",searchIntent:"informational",tags:[e("TOEIC Listening","toeic-listening"),e("Part 3","part-3"),e("Part 4","part-4")],content:`## V\xec sao cố nghe từng từ lại l\xe0m bạn chậm hơn?

Part 3 v\xe0 Part 4 kiểm tra khả năng theo d\xf5i mục đ\xedch giao tiếp, chi tiết v\xe0 h\xe0nh động tiếp theo. Nếu cố dịch từng từ sang tiếng Việt, bạn dễ mắc kẹt ở một c\xe2u v\xe0 bỏ lỡ phần c\xf2n lại. Mục ti\xeau tốt hơn l\xe0 nhận ra **khung th\xf4ng tin** của đoạn nghe.

## Quy tr\xecnh 4 bước cho mỗi nh\xf3m c\xe2u

### 1. Đọc trước c\xe2u hỏi

Trong thời gian hướng dẫn hoặc khoảng nghỉ, đọc nhanh ba c\xe2u hỏi. Gạch trong đầu c\xe1c từ gi\xfap x\xe1c định người, địa điểm, vấn đề, thời gian hoặc h\xe0nh động. Đừng đọc kỹ cả bốn đ\xe1p \xe1n nếu chưa đủ thời gian.

### 2. Dự đo\xe1n bối cảnh

C\xe1c từ như appointment, shipment, invoice hay reservation gi\xfap bạn dự đo\xe1n ngữ cảnh. Dự đo\xe1n kh\xf4ng phải chọn đ\xe1p \xe1n trước; n\xf3 gi\xfap n\xe3o chuẩn bị nh\xf3m từ vựng c\xf3 thể xuất hiện.

### 3. Nghe \xfd v\xe0 paraphrase

Đ\xe1p \xe1n đ\xfang hiếm khi lặp nguy\xean văn. “The delivery has been delayed” c\xf3 thể được hỏi th\xe0nh “What problem does the speaker mention?”. H\xe3y ghi nhớ \xfd nghĩa của cả cụm thay v\xec săn một từ tr\xf9ng khớp.

### 4. Chốt đ\xe1p \xe1n v\xe0 chuyển tiếp

Nếu ph\xe2n v\xe2n, loại đ\xe1p \xe1n sai bối cảnh rồi chọn phương \xe1n tốt nhất. Kh\xf4ng d\xf9ng thời gian của đoạn sau để cứu một c\xe2u trước.

## Sửa b\xe0i bằng transcript đ\xfang c\xe1ch

Nghe lại lần hai m\xe0 chưa xem transcript. Sau đ\xf3 mở transcript, đ\xe1nh dấu đoạn chứa đ\xe1p \xe1n v\xe0 từ nối bạn đ\xe3 bỏ lỡ. Cuối c\xf9ng nghe lại ở tốc độ chuẩn, vừa nghe vừa theo d\xf5i chữ, rồi đ\xf3ng transcript v\xe0 nghe lần cuối.

Bạn kh\xf4ng cần ch\xe9p ch\xednh tả to\xe0n bộ. Chỉ ch\xe9p c\xe2u chứa lỗi ph\xe1t \xe2m nối \xe2m, từ vựng mới hoặc paraphrase quan trọng. C\xe1ch n\xe0y giữ thời gian sửa b\xe0i ngắn nhưng vẫn c\xf3 chiều s\xe2u.

## B\xe0i luyện 20 ph\xfat

- 3 ph\xfat đọc c\xe2u hỏi v\xe0 dự đo\xe1n bối cảnh.
- 5 ph\xfat l\xe0m một nh\xf3m Part 3 hoặc Part 4.
- 8 ph\xfat nghe lại v\xe0 ph\xe2n t\xedch transcript.
- 4 ph\xfat nhại lại 2–3 c\xe2u quan trọng.

Theo d\xf5i ri\xeang ba loại lỗi: kh\xf4ng nhận ra \xe2m, kh\xf4ng biết từ v\xe0 biết từ nhưng kh\xf4ng theo kịp \xfd. Mỗi loại lỗi cần một c\xe1ch sửa kh\xe1c nhau; đ\xe2y l\xe0 l\xfd do bảng điểm tổng kh\xf4ng đủ để định hướng buổi học tiếp theo.`}),i({id:"editorial-reading",category:"READING",slug:"quan-ly-thoi-gian-toeic-reading-75-phut",title:"Cách chia 75 phút TOEIC Reading để không bỏ dở Part 7",excerpt:"Khung thời gian thực tế cho Part 5, 6, 7 cùng chiến thuật xử lý khi bạn bắt đầu chậm hơn dự kiến.",seoTitle:"Cách chia thời gian TOEIC Reading 75 phút",seoDescription:"Cách quản lý 75 phút TOEIC Reading cho Part 5, 6, 7, kèm mốc kiểm tra và chiến thuật tránh bỏ trắng Part 7.",canonicalPath:"/blog/quan-ly-thoi-gian-toeic-reading-75-phut",coverAlt:"Đồng hồ 75 phút và ba phần của bài TOEIC Reading",socialTitle:"Chia 75 phút Reading để không bỏ Part 7",socialDescription:"Khung thời gian và mốc kiểm soát dễ nhớ cho ngày thi.",authorName:"TOEICGym Editorial",targetTopic:"chia thời gian TOEIC Reading 75 phút",searchIntent:"informational",tags:[e("TOEIC Reading","toeic-reading"),e("Part 7","part-7")],content:`## Mục ti\xeau kh\xf4ng phải l\xe0m Part 5 thật nhanh bằng mọi gi\xe1

Reading c\xf3 100 c\xe2u trong 75 ph\xfat. Nhiều người d\xe0nh qu\xe1 l\xe2u cho c\xe1c c\xe2u ngữ ph\xe1p kh\xf3 rồi phải đo\xe1n h\xe0ng loạt ở Part 7. Một khung tham khảo c\xe2n bằng l\xe0: Part 5 trong 10–12 ph\xfat, Part 6 trong 8–10 ph\xfat v\xe0 d\xe0nh \xedt nhất 53–55 ph\xfat cho Part 7.

## Mốc kiểm so\xe1t dễ nhớ

- C\xf2n 63 ph\xfat: chuyển sang Part 6.
- C\xf2n 53 ph\xfat: bắt đầu Part 7.
- C\xf2n 25 ph\xfat: n\xean bước v\xe0o nh\xf3m nhiều đoạn văn.
- C\xf2n 5 ph\xfat: ho\xe0n tất mọi \xf4 đ\xe1p \xe1n, quay lại c\xe2u đ\xe3 đ\xe1nh dấu.

Khung n\xe0y cần được điều chỉnh theo năng lực. Nếu bạn mạnh Part 5, c\xf3 thể tiết kiệm v\xe0i ph\xfat; nếu thường sai v\xec đọc vội, đừng \xe9p xuống một mốc kh\xf4ng thực tế.

## Quy tắc 30 gi\xe2y cho c\xe2u mắc kẹt

Với Part 5, nếu sau khoảng 30 gi\xe2y bạn vẫn chưa x\xe1c định được c\xe2u đang kiểm tra g\xec, h\xe3y loại đ\xe1p \xe1n r\xf5 r\xe0ng sai, đ\xe1nh dấu v\xe0 chuyển tiếp. Một c\xe2u kh\xf3 c\xf3 c\xf9ng gi\xe1 trị điểm với c\xe2u dễ.

Ở Part 7, đọc c\xe2u hỏi trước đoạn văn để biết cần t\xecm th\xf4ng tin n\xe0o. Với c\xe2u hỏi \xfd ch\xednh, đọc ti\xeau đề, c\xe2u mở đầu v\xe0 mục đ\xedch của t\xe0i liệu. Với c\xe2u hỏi chi tiết, x\xe1c định t\xean ri\xeang, ng\xe0y, số hoặc từ kh\xf3a rồi qu\xe9t đ\xfang v\xf9ng văn bản.

## Xử l\xfd b\xe0i đọc đ\xf4i v\xe0 ba

Đừng đọc cả ba t\xe0i liệu từ đầu đến cuối rồi mới nh\xecn c\xe2u hỏi. H\xe3y đọc c\xe2u hỏi, x\xe1c định c\xe2u n\xe0o chỉ cần một t\xe0i liệu v\xe0 c\xe2u n\xe0o y\xeau cầu kết nối nhiều nguồn. L\xe0m c\xe2u đơn nguồn trước để t\xedch lũy điểm chắc chắn.

C\xe1c c\xe2u suy luận n\xean l\xe0m sau c\xe2u chi tiết. Khi đ\xe3 hiểu nh\xe2n vật, thời gian v\xe0 sự kiện, bạn sẽ suy luận nhanh hơn v\xe0 \xedt dựa v\xe0o cảm gi\xe1c.

## C\xe1ch luyện để khung thời gian trở th\xe0nh phản xạ

Mỗi tuần, l\xe0m \xedt nhất hai phi\xean c\xf3 bấm giờ nhưng kh\xf4ng nhất thiết l\xe0m đủ 100 c\xe2u. Một phi\xean c\xf3 thể l\xe0 30 c\xe2u Part 5 trong 12 ph\xfat; phi\xean kh\xe1c l\xe0 một cụm Part 7 trong 20 ph\xfat. Sau khi chấm, ghi lại số c\xe2u đ\xfang v\xe0 số c\xe2u phải đo\xe1n v\xec hết giờ.

Bạn chỉ n\xean r\xfat thời gian khi độ ch\xednh x\xe1c kh\xf4ng giảm mạnh. Quản l\xfd thời gian tốt l\xe0 ho\xe0n th\xe0nh nhiều c\xe2u **c\xf3 chất lượng**, kh\xf4ng phải lướt qua to\xe0n bộ đề.`}),i({id:"editorial-grammar",category:"GRAMMAR",slug:"ngu-phap-toeic-part-5-can-hoc",title:"7 chủ điểm ngữ pháp TOEIC Part 5 cần học trước",excerpt:"Danh sách ngữ pháp có tần suất ứng dụng cao, dấu hiệu nhận biết và cách luyện để tránh học lan man.",seoTitle:"7 chủ điểm ngữ pháp TOEIC Part 5 quan trọng",seoDescription:"Tổng hợp 7 chủ điểm ngữ pháp TOEIC Part 5 nên ưu tiên: loại từ, thì, hòa hợp, mệnh đề, liên từ, giới từ và cấu trúc so sánh.",canonicalPath:"/blog/ngu-phap-toeic-part-5-can-hoc",coverAlt:"Các khối câu minh họa ngữ pháp TOEIC Part 5",socialTitle:"Ngữ pháp Part 5: học 7 nhóm này trước",socialDescription:"Dấu hiệu nhận biết và cách ôn theo lỗi thay vì học thuộc rời rạc.",authorName:"TOEICGym Editorial",targetTopic:"ngữ pháp TOEIC Part 5",searchIntent:"informational",tags:[e("Ngữ pháp TOEIC","ngu-phap-toeic"),e("Part 5","part-5")],content:`## 1. Loại từ

Đ\xe2y l\xe0 nh\xf3m tạo điểm nhanh v\xec vị tr\xed trống thường cho biết cần danh từ, động từ, t\xednh từ hay trạng từ. H\xe3y nh\xecn từ đứng trước v\xe0 sau chỗ trống trước khi dịch cả c\xe2u. V\xed dụ, sau mạo từ thường cần danh từ; trước danh từ thường l\xe0 t\xednh từ.

## 2. Th\xec v\xe0 dạng động từ

Kh\xf4ng học th\xec như một bảng c\xf4ng thức t\xe1ch rời. H\xe3y gắn ch\xfang với dấu hiệu thời gian v\xe0 quan hệ giữa c\xe1c sự kiện. TOEIC thường d\xf9ng hiện tại đơn cho quy tr\xecnh, hiện tại ho\xe0n th\xe0nh cho trải nghiệm hoặc thay đổi đến hiện tại, v\xe0 tương lai cho lịch tr\xecnh hoặc cam kết.

## 3. H\xf2a hợp chủ ngữ – động từ

T\xecm chủ ngữ ch\xednh, bỏ qua cụm giới từ chen giữa. C\xe1c từ như each, every, neither thường đi với động từ số \xedt; trong khi a number of đi với số nhiều nhưng the number of đi với số \xedt.

## 4. Mệnh đề quan hệ

Ph\xe2n biệt who, which, that, whose v\xe0 where dựa tr\xean danh từ được thay thế v\xe0 vai tr\xf2 c\xf2n thiếu trong mệnh đề. Đừng chọn chỉ v\xec thấy danh từ chỉ người hoặc vật; cần kiểm tra sau chỗ trống đ\xe3 c\xf3 chủ ngữ hay chưa.

## 5. Li\xean từ v\xe0 trạng từ nối

Because nối một mệnh đề, because of đi với cụm danh từ. Although tạo quan hệ nhượng bộ trong một c\xe2u, c\xf2n however thường nối \xfd giữa hai c\xe2u hoặc hai mệnh đề độc lập với dấu c\xe2u ph\xf9 hợp.

## 6. Giới từ

Giới từ trong TOEIC xuất hiện nhiều trong cụm cố định c\xf4ng sở: responsible for, interested in, comply with, prior to. N\xean học cả cụm v\xe0 một c\xe2u v\xed dụ thay v\xec ghi ri\xeang từng từ.

## 7. So s\xe1nh v\xe0 lượng từ

Ch\xfa \xfd danh từ đếm được, kh\xf4ng đếm được v\xe0 cấu tr\xfac so s\xe1nh. Fewer đi với danh từ đếm được số nhiều; less đi với danh từ kh\xf4ng đếm được. C\xe1c cấu tr\xfac the more…, the more… hoặc one of the most… cũng xuất hiện thường xuy\xean.

## C\xe1ch \xf4n 15 ph\xfat mỗi ng\xe0y

Chọn một chủ điểm, l\xe0m 8–10 c\xe2u v\xe0 ghi lại mẫu khiến bạn chọn sai. Cuối tuần, trộn c\xe1c chủ điểm để kiểm tra khả năng nhận diện. Nếu chỉ luyện từng nh\xf3m ri\xeang, bạn c\xf3 thể l\xe0m đ\xfang v\xec đ\xe3 biết trước dạng b\xe0i chứ chưa thật sự nhận ra t\xedn hiệu trong đề.`}),i({id:"editorial-vocabulary",category:"VOCABULARY",slug:"tu-vung-toeic-theo-chu-de-cong-so",title:"Từ vựng TOEIC theo chủ đề công sở: học cụm, không học từ lẻ",excerpt:"Cách xây vốn từ có thể dùng ngay trong Listening và Reading bằng collocation, ngữ cảnh và lịch ôn ngắt quãng.",seoTitle:"Từ vựng TOEIC theo chủ đề công sở dễ nhớ",seoDescription:"Học từ vựng TOEIC theo cụm và chủ đề: tuyển dụng, họp, giao hàng, du lịch công tác; kèm phương pháp ôn ngắt quãng.",canonicalPath:"/blog/tu-vung-toeic-theo-chu-de-cong-so",coverAlt:"Sổ từ vựng TOEIC với các chủ đề công sở",socialTitle:"Học từ vựng TOEIC theo cụm để nhớ lâu",socialDescription:"Biến danh sách từ thành vốn từ dùng được trong bài thi.",authorName:"TOEICGym Editorial",targetTopic:"từ vựng TOEIC theo chủ đề",searchIntent:"informational",tags:[e("Từ vựng TOEIC","tu-vung-toeic"),e("Collocation","collocation")],content:`## V\xec sao danh s\xe1ch 600 từ thường kh\xf4ng đủ?

Biết nghĩa tiếng Việt của một từ chưa chắc gi\xfap bạn nhận ra n\xf3 khi nghe hoặc chọn đ\xfang trong c\xe2u. TOEIC kiểm tra từ trong ngữ cảnh c\xf4ng việc, v\xec vậy đơn vị học hiệu quả n\xean l\xe0 **cụm từ + t\xecnh huống + một c\xe2u mẫu**.

## Bốn nh\xf3m n\xean học trước

### Tuyển dụng v\xe0 nh\xe2n sự

C\xe1c cụm phổ biến gồm apply for a position, meet the qualifications, conduct an interview, receive training v\xe0 employee benefits. H\xe3y ch\xfa \xfd cả từ loại: application, applicant v\xe0 applicable c\xf3 vai tr\xf2 kh\xe1c nhau.

### Họp v\xe0 dự \xe1n

Học c\xe1c cụm schedule a meeting, meet a deadline, submit a proposal, reach an agreement v\xe0 provide an update. Đ\xe2y l\xe0 nh\xf3m thường xuất hiện trong email, th\xf4ng b\xe1o v\xe0 hội thoại nội bộ.

### Đơn h\xe0ng v\xe0 giao nhận

C\xe1c cụm process an order, issue an invoice, track a shipment, delivery delay v\xe0 out of stock gi\xfap bạn xử l\xfd cả Part 3, 4, 6 v\xe0 7.

### Du lịch c\xf4ng t\xe1c

Ưu ti\xean make a reservation, boarding pass, travel itinerary, rental vehicle v\xe0 accommodation. Học th\xeam c\xe1c c\xe1ch diễn đạt tương đương v\xec đề thường paraphrase.

## Mẫu thẻ từ hiệu quả

Mặt trước ghi một c\xe2u c\xf3 chỗ trống: “The supplier will ___ the order by Friday.” Mặt sau ghi confirm, ph\xe1t \xe2m, nghĩa ngắn v\xe0 cụm confirm an order. C\xe2u c\xf3 ngữ cảnh buộc bạn nhớ c\xe1ch d\xf9ng, kh\xf4ng chỉ nhận mặt từ.

## Lịch \xf4n ngắt qu\xe3ng

\xd4n lại sau 1 ng\xe0y, 3 ng\xe0y, 7 ng\xe0y v\xe0 14 ng\xe0y. Mỗi lần, ưu ti\xean tự nhớ trước khi lật đ\xe1p \xe1n. Nếu một từ li\xean tục sai, th\xeam một c\xe2u v\xed dụ mới hoặc đối chiếu với từ dễ nhầm.

## Biến từ mới th\xe0nh điểm số

Sau khi học 10–15 cụm, l\xe0m một b\xe0i ngắn đ\xfang chủ đề. Đ\xe1nh dấu cụm đ\xe3 gặp v\xe0 c\xe1ch đề biến đổi ch\xfang. Chu tr\xecnh học – gặp trong c\xe2u hỏi – sửa lỗi gi\xfap từ vựng gắn với t\xedn hiệu b\xe0i thi v\xe0 được nhớ l\xe2u hơn.`}),i({id:"editorial-study-plan",category:"STUDY_PLAN",slug:"lo-trinh-hoc-toeic-30-ngay-cho-nguoi-ban-ron",title:"Lộ trình học TOEIC 30 ngày cho người bận rộn",excerpt:"Kế hoạch 30–45 phút mỗi ngày với mục tiêu rõ cho từng tuần, ngày nghỉ và cách điều chỉnh khi lỡ buổi.",seoTitle:"Lộ trình học TOEIC 30 ngày cho người bận rộn",seoDescription:"Kế hoạch học TOEIC 30 ngày, 30–45 phút mỗi ngày: đánh giá đầu vào, luyện theo điểm yếu, thi thử và ôn lỗi có hệ thống.",canonicalPath:"/blog/lo-trinh-hoc-toeic-30-ngay-cho-nguoi-ban-ron",coverAlt:"Lịch học TOEIC 30 ngày với các buổi luyện ngắn",socialTitle:"Lộ trình TOEIC 30 ngày, mỗi ngày 30–45 phút",socialDescription:"Một kế hoạch đủ nhẹ để duy trì và đủ rõ để đo tiến bộ.",authorName:"TOEICGym Editorial",targetTopic:"lộ trình học TOEIC 30 ngày",searchIntent:"informational",tags:[e("Kế hoạch học","ke-hoach-hoc"),e("30 ngày","30-ngay")],content:`## Nguy\xean tắc: buổi ngắn nhưng c\xf3 v\xf2ng phản hồi

Một kế hoạch tốt phải gồm luyện, chấm, hiểu lỗi v\xe0 \xf4n lại. Nếu 45 ph\xfat chỉ d\xf9ng để l\xe0m c\xe2u mới, bạn sẽ lặp lại c\xf9ng một lỗi. H\xe3y d\xe0nh \xedt nhất một phần ba thời gian cho sửa b\xe0i.

## Tuần 1: đo điểm xuất ph\xe1t

Ng\xe0y đầu l\xe0m b\xe0i đ\xe1nh gi\xe1 hoặc một bộ hỗn hợp vừa sức. Trong c\xe1c ng\xe0y tiếp theo, chia thời gian cho Part yếu nhất v\xe0 một Part bạn c\xf3 thể cải thiện nhanh. Cuối tuần xem lại lỗi theo kỹ năng: loại từ, \xfd ch\xednh, chi tiết, paraphrase hay kh\xf4ng nhận ra \xe2m.

## Tuần 2: x\xe2y kỹ năng nền

Mỗi ng\xe0y chọn một mục ti\xeau hẹp. V\xed dụ: 10 c\xe2u loại từ, một nh\xf3m Part 3, hoặc một b\xe0i đọc email. Học tối đa 10–15 cụm từ mới từ ch\xednh c\xe1c c\xe2u đ\xe3 l\xe0m. Ng\xe0y thứ bảy nghỉ hoặc chỉ \xf4n thẻ từ 10 ph\xfat.

## Tuần 3: tăng tốc v\xe0 trộn dạng b\xe0i

Bắt đầu bấm giờ cho c\xe1c nh\xf3m ngắn. Xen kẽ Listening v\xe0 Reading để tr\xe1nh học lệch. Hai buổi trong tuần n\xean l\xe0 b\xe0i hỗn hợp, gi\xfap bạn chuyển nhanh giữa c\xe1c dạng c\xe2u hỏi.

## Tuần 4: m\xf4 phỏng v\xe0 ổn định

L\xe0m một b\xe0i d\xe0i v\xe0o đầu tuần, sau đ\xf3 d\xf9ng 2–3 ng\xe0y sửa lỗi. Cuối tuần l\xe0m b\xe0i m\xf4 phỏng cuối c\xf9ng ở đ\xfang khung giờ dự kiến thi. Ng\xe0y trước kỳ thi chỉ \xf4n nhẹ, chuẩn bị giấy tờ v\xe0 ngủ đủ.

## Khung 35 ph\xfat mẫu

- 5 ph\xfat \xf4n lại lỗi cũ.
- 15 ph\xfat l\xe0m b\xe0i c\xf3 mục ti\xeau.
- 10 ph\xfat đọc giải th\xedch v\xe0 ghi l\xfd do sai.
- 5 ph\xfat \xf4n từ vựng vừa gặp.

Nếu bỏ lỡ một ng\xe0y, kh\xf4ng cần học gấp đ\xf4i v\xe0o h\xf4m sau. Tiếp tục lịch v\xe0 dời b\xe0i thi thử nếu cần. T\xednh li\xean tục quan trọng hơn một buổi học qu\xe1 sức khiến bạn bỏ cuộc trong nhiều ng\xe0y.`}),i({id:"editorial-exam",category:"EXAM_TIPS",slug:"kinh-nghiem-thi-toeic-ngay-thi",title:"Kinh nghiệm thi TOEIC: checklist trước và trong ngày thi",excerpt:"Chuẩn bị giấy tờ, nhịp sinh hoạt và chiến thuật phòng thi để năng lực thật không bị giảm vì lỗi nhỏ.",seoTitle:"Kinh nghiệm thi TOEIC và checklist ngày thi",seoDescription:"Checklist thi TOEIC: giấy tờ, thời gian có mặt, ăn ngủ, tô đáp án và cách xử lý khi mất tập trung trong phòng thi.",canonicalPath:"/blog/kinh-nghiem-thi-toeic-ngay-thi",coverAlt:"Checklist chuẩn bị cho ngày thi TOEIC",socialTitle:"Checklist ngày thi TOEIC để tránh mất điểm oan",socialDescription:"Những việc nhỏ nên chuẩn bị từ tối hôm trước đến khi nộp bài.",authorName:"TOEICGym Editorial",targetTopic:"kinh nghiệm thi TOEIC ngày thi",searchIntent:"informational",tags:[e("Ngày thi TOEIC","ngay-thi-toeic"),e("Checklist","checklist")],content:`## Trước ng\xe0y thi

Kiểm tra ch\xednh x\xe1c giấy tờ được đơn vị tổ chức y\xeau cầu, địa điểm, ph\xf2ng thi v\xe0 giờ c\xf3 mặt. Quy định c\xf3 thể thay đổi theo từng đơn vị, v\xec vậy h\xe3y đọc th\xf4ng b\xe1o ch\xednh thức thay v\xec chỉ dựa v\xe0o kinh nghiệm truyền miệng.

Chuẩn bị quần \xe1o thoải m\xe1i, đường đi v\xe0 phương \xe1n dự ph\xf2ng. Kh\xf4ng cố học một chủ điểm mới v\xe0o tối cuối. \xd4n nhẹ c\xe1c lỗi quen thuộc rồi đi ngủ đ\xfang giờ gi\xfap \xedch nhiều hơn một buổi luyện k\xe9o d\xe0i.

## Buổi s\xe1ng ng\xe0y thi

Ăn m\xf3n quen thuộc, uống đủ nước nhưng tr\xe1nh thay đổi th\xf3i quen với qu\xe1 nhiều c\xe0 ph\xea. Đến sớm để c\xf3 thời gian ổn định t\xe2m l\xfd v\xe0 xử l\xfd t\xecnh huống giao th\xf4ng. Tắt hoặc cất thiết bị theo đ\xfang hướng dẫn của gi\xe1m thị.

## Trong phần Listening

Tận dụng khoảng hướng dẫn để l\xe0m quen \xe2m lượng v\xe0 đọc trước khi được ph\xe9p. Nếu bỏ lỡ một c\xe2u, chọn phương \xe1n tốt nhất rồi chuyển tiếp. Việc cố nhớ lại một đoạn đ\xe3 qua thường khiến bạn mất th\xeam c\xe2u kế tiếp.

Giữ mắt ở nh\xf3m c\xe2u hiện tại. Với Part 3 v\xe0 4, x\xe1c định nhanh c\xe2u hỏi về ai, ở đ\xe2u, vấn đề v\xe0 h\xe0nh động tiếp theo.

## Trong phần Reading

Giữ c\xe1c mốc thời gian đ\xe3 luyện. Kh\xf4ng để một c\xe2u Part 5 kh\xf3 lấy mất thời gian của nhiều c\xe2u Part 7. T\xf4 đ\xe1p \xe1n theo nhịp ổn định v\xe0 kiểm tra số c\xe2u để tr\xe1nh lệch d\xf2ng.

Khi mất tập trung, dừng v\xe0i gi\xe2y, thở chậm v\xe0 quay lại từ c\xe2u hiện tại. Đừng tự đ\xe1nh gi\xe1 điểm số giữa b\xe0i; năng lượng đ\xf3 n\xean d\xe0nh cho c\xe2u c\xf2n lại.

## Năm ph\xfat cuối

Đảm bảo mọi c\xe2u đều c\xf3 đ\xe1p \xe1n nếu b\xe0i thi kh\xf4ng trừ điểm c\xe2u sai. Kiểm tra c\xe1c c\xe2u đ\xe3 đ\xe1nh dấu v\xe0 vị tr\xed t\xf4, kh\xf4ng thay đổi h\xe0ng loạt chỉ v\xec lo lắng. Sau khi nộp b\xe0i, ghi lại trải nghiệm khi c\xf2n nhớ để kế hoạch sau n\xe0y thực tế hơn.`})];n.s(["EDITORIAL_POSTS",0,h])},80985,n=>n.a(async(t,e)=>{try{var i=n.i(75225),h=n.i(79371),c=n.i(86371);n.i(34279);var a=n.i(5843),x=t([h]);async function r(){let n=[];try{n=await h.db.select({slug:c.contentPosts.slug,updatedAt:c.contentPosts.updatedAt}).from(c.contentPosts).where((0,i.and)((0,i.eq)(c.contentPosts.status,"PUBLISHED"),(0,i.eq)(c.contentPosts.noindex,!1)))}catch{console.warn("Could not load CMS sitemap rows; using bundled editorial rows.")}let t=new Set(n.map(n=>n.slug));return[...n,...a.EDITORIAL_POSTS.filter(n=>!t.has(n.slug)).map(n=>({slug:n.slug,updatedAt:n.updatedAt}))]}[h]=x.then?(await x)():x,n.s(["publishedSitemapRows",0,r]),e()}catch(n){e(n)}},!1)];

//# sourceMappingURL=_1em9c17._.js.map