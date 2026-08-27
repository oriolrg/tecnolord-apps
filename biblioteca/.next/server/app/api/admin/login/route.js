"use strict";(()=>{var e={};e.id=672,e.ids=[672],e.modules={3524:e=>{e.exports=require("@prisma/client")},38:e=>{e.exports=require("argon2")},2934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6005:e=>{e.exports=require("node:crypto")},303:(e,t,n)=>{n.r(t),n.d(t,{originalPathname:()=>U,patchFetch:()=>T,requestAsyncStorage:()=>R,routeModule:()=>x,serverHooks:()=>E,staticGenerationAsyncStorage:()=>S});var i={};n.r(i),n.d(i,{POST:()=>A});var a=n(9303),o=n(8716),r=n(670),s=n(7070),u=n(1412),l=n(3524),d=n(6005),c=n(2434);let w="login:identity",p={maxFailures:5,windowMs:9e5,blockMs:9e5};function f(e,t){return!!e?.blockedUntil&&e.blockedUntil.getTime()>t.getTime()}function m(e,t,n=p){if(f(e,t))return{failedCount:e.failedCount,windowStartedAt:e.windowStartedAt,blockedUntil:e.blockedUntil};let i=!e||t.getTime()-e.windowStartedAt.getTime()>=n.windowMs,a=i?1:e.failedCount+1,o=a>=n.maxFailures?new Date(t.getTime()+n.blockMs):null;return{failedCount:a,windowStartedAt:i?t:e.windowStartedAt,blockedUntil:o}}function g(e){return e instanceof l.Prisma.PrismaClientKnownRequestError&&("P2002"===e.code||"P2010"===e.code&&"string"==typeof e.meta?.code&&"23505"===e.meta.code)}async function b(e,t=new Date,n=c._){for(let i=0;i<2;i+=1)try{let i=(0,d.randomUUID)();await n.$executeRaw`
        INSERT INTO "biblioteca"."LoginRateLimit"
          ("id", "scope", "key", "failedCount", "windowStartedAt", "blockedUntil", "createdAt", "updatedAt")
        VALUES
          (${i}, ${w}, ${e}, 0, ${t}, NULL, ${t}, ${t})
        ON CONFLICT ("scope", "key") DO NOTHING
      `;let a=await n.$queryRaw`
        SELECT "id", "scope", "key", "failedCount", "windowStartedAt", "blockedUntil"
        FROM "biblioteca"."LoginRateLimit"
        WHERE "scope" = ${w}
          AND "key" = ${e}
        FOR UPDATE
      `;if(a[0])return a[0]}catch(e){if(0===i&&g(e))continue;throw e}throw Error("No s'ha pogut bloquejar el limit d'intents de login")}async function k(e,t,n=new Date){return c._.$transaction(async i=>{let a=await b(e,n,i);return t(i,a,n)})}async function y(e,t=new Date,n=c._,i){if(i){let a=m(i,t);return await n.$executeRaw`
      UPDATE "biblioteca"."LoginRateLimit"
      SET "failedCount" = ${a.failedCount},
          "windowStartedAt" = ${a.windowStartedAt},
          "blockedUntil" = ${a.blockedUntil},
          "updatedAt" = ${t}
      WHERE "scope" = ${w}
        AND "key" = ${e}
    `,{...i,...a}}for(let n=0;n<2;n+=1)try{return await c._.$transaction(async n=>{let i=(await n.$queryRaw`
          SELECT "id", "scope", "key", "failedCount", "windowStartedAt", "blockedUntil"
          FROM "biblioteca"."LoginRateLimit"
          WHERE "scope" = ${w}
            AND "key" = ${e}
          FOR UPDATE
        `)[0]??null,a=m(i,t);if(i)return await n.$executeRaw`
            UPDATE "biblioteca"."LoginRateLimit"
            SET "failedCount" = ${a.failedCount},
                "windowStartedAt" = ${a.windowStartedAt},
                "blockedUntil" = ${a.blockedUntil},
                "updatedAt" = ${t}
            WHERE "scope" = ${w}
              AND "key" = ${e}
          `,{...i,...a};let o=(0,d.randomUUID)();return await n.$executeRaw`
          INSERT INTO "biblioteca"."LoginRateLimit"
            ("id", "scope", "key", "failedCount", "windowStartedAt", "blockedUntil", "createdAt", "updatedAt")
          VALUES
            (${o}, ${w}, ${e}, ${a.failedCount}, ${a.windowStartedAt}, ${a.blockedUntil}, ${t}, ${t})
        `,{id:o,scope:w,key:e,...a}})}catch(e){if(0===n&&g(e))continue;throw e}throw Error("No s'ha pogut actualitzar el limit d'intents de login")}async function $(e,t=c._){await t.$executeRaw`
    DELETE FROM "biblioteca"."LoginRateLimit"
    WHERE "scope" = ${w}
      AND "key" = ${e}
  `}function h(e){return new s.NextResponse(null,{status:303,headers:{Location:e}})}async function A(e){let t=await e.formData(),n=String(t.get("email")??"").toLowerCase().trim(),i=String(t.get("password")??""),a=await k(n,async(e,t,a)=>{if(f(t,a))return{ok:!1,status:429,retryAfterSeconds:Math.max(1,Math.ceil((t.blockedUntil.getTime()-a.getTime())/1e3))};let o=await e.user.findUnique({where:{email:n}}),r=await (0,u.Gv)(i,o?.passwordHash??"$argon2id$v=19$m=65536,t=3,p=4$Hs78GKVbET+H+vLKAPRWZA$qRVtB353/QIgTKKpAGFJgO+/JnJ/egne4hCywJ0F4e0");return o&&(0,u.VN)(o)&&r?(await $(n,e),{ok:!0,userId:o.id}):(await y(n,a,e,t),{ok:!1,status:303})});return a.ok||429!==a.status?a.ok?(await (0,u.ed)(a.userId),h("/biblioteca/admin")):h("/biblioteca/admin/login?error=1"):new s.NextResponse("Massa intents de login. Torna-ho a provar mes tard.",{status:429,headers:{"Retry-After":String(a.retryAfterSeconds)}})}let x=new a.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/admin/login/route",pathname:"/api/admin/login",filename:"route",bundlePath:"app/api/admin/login/route"},resolvedPagePath:"/home/lab-host/tecnolord-apps/biblioteca/app/api/admin/login/route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:R,staticGenerationAsyncStorage:S,serverHooks:E}=x,U="/api/admin/login/route";function T(){return(0,r.patchFetch)({serverHooks:E,staticGenerationAsyncStorage:S})}},1412:(e,t,n)=>{n.d(t,{o2:()=>S,ed:()=>k,sd:()=>y,_V:()=>R,VN:()=>h,Fi:()=>x,DQ:()=>A,Gv:()=>b});var i=n(1615),a=n(8585),o=n(6005),r=n(38),s=n.n(r),u=n(7070);function l(e){return e&&"active"===e.status?"admin"!==e.role?{ok:!1,status:403,error:"Forbidden"}:{ok:!0}:{ok:!1,status:401,error:"Unauthorized"}}var d=n(2434);let c="biblioteca_session",w="biblioteca_csrf",p="/biblioteca";function f(e){return(0,o.createHash)("sha256").update(e).digest("hex")}function m(e){return{httpOnly:!0,sameSite:"lax",secure:!0,path:p,expires:e}}function g(e){return{httpOnly:!1,sameSite:"lax",secure:!0,path:p,expires:e}}function b(e,t){return s().verify(t,e)}async function k(e){let t=(0,o.randomBytes)(32).toString("base64url"),n=(0,o.randomBytes)(32).toString("base64url"),a=new Date(Date.now()+12096e5);await d._.session.create({data:{tokenHash:f(t),userId:e,expiresAt:a}});let r=(0,i.cookies)();return r.set(c,t,m(a)),r.set(w,n,g(a)),{token:t,csrf:n,expiresAt:a}}async function y(){let e=i.cookies().get(c)?.value;e&&await d._.session.deleteMany({where:{tokenHash:f(e)}});let t=(0,i.cookies)();t.set(c,"",m(new Date(0))),t.set(w,"",g(new Date(0)))}async function $(){let e=i.cookies().get(c)?.value;if(!e)return null;let t=await d._.session.findUnique({where:{tokenHash:f(e)},include:{user:!0}});return!t||t.expiresAt<new Date||"active"!==t.user.status?null:t.user}function h(e){return l(e).ok}async function A(){let e=await $();return e||(0,a.redirect)("/admin/login"),h(e)||(0,a.redirect)("/admin/forbidden"),e}async function x(){let e=await $(),t=l(e);return t.ok?{ok:!0,user:e}:{ok:!1,response:u.NextResponse.json({error:t.error},{status:t.status})}}function R(){return i.cookies().get(w)?.value??""}function S(e){let t=i.cookies().get(w)?.value??"",n=e.headers.get("x-csrf-token")??"",a=Buffer.from(t),r=Buffer.from(n);if(!t||!n||a.length!==r.length||!(0,o.timingSafeEqual)(a,r))throw Error("CSRF token invalid")}},2434:(e,t,n)=>{n.d(t,{_:()=>a});var i=n(3524);let a=globalThis.bibliotecaPrisma??new i.PrismaClient({log:["error"]})},9303:(e,t,n)=>{e.exports=n(517)}};var t=require("../../../../webpack-runtime.js");t.C(e);var n=e=>t(t.s=e),i=t.X(0,[276,70,54],()=>n(303));module.exports=i})();