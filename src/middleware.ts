import {defineMiddleware} from 'astro:middleware';
import {db,id} from './lib/server';
const limits=new Map<string,{count:number;until:number}>();
export const onRequest=defineMiddleware(async(context,next)=>{
 const dynamic=/^\/(api|search|checkout|reports|account)(\/|$)/.test(context.url.pathname);
 if(!dynamic)return next();
 if((process.env.APP_MODE||import.meta.env.APP_MODE||'demo')!=='demo')return new Response('Live mode is not configured. Licensed providers, durable storage, payments, and delivery are required.',{status:503,headers:{'Cache-Control':'no-store'}});
 if(!['GET','HEAD','OPTIONS'].includes(context.request.method)){
  const origin=context.request.headers.get('origin');
  if(origin!==context.url.origin)return new Response('Cross-site request rejected.',{status:403});
 }
 let token=context.cookies.get('vh_session')?.value;
 let session=token?db.sessions.get(token):undefined;
 if(!session||session.expires<Date.now()){
  token=id();const owner=id();session={owner,expires:Date.now()+7*86400000};db.sessions.set(token,session);db.users.set(owner,{id:owner,createdAt:new Date().toISOString()});
  context.cookies.set('vh_session',token,{path:'/',httpOnly:true,sameSite:'lax',secure:context.url.protocol==='https:',maxAge:7*86400});
 }
 context.locals.owner=session.owner;
 if(context.request.method==='POST'){
  // Server-derived client address; do not trust arbitrary forwarded headers.
  let address='local';try{address=context.clientAddress;}catch{}
  const key=address;let limit=limits.get(key);if(!limit||limit.until<Date.now()){limit={count:0,until:Date.now()+60000};limits.set(key,limit);}limit.count++;
  if(limits.size>10000)for(const [k,v]of limits)if(v.until<Date.now())limits.delete(k);
  if(limit.count>60)return new Response(JSON.stringify({error:'Too many requests. Please try again in a minute.'}),{status:429,headers:{'Content-Type':'application/json','Retry-After':'60','Cache-Control':'no-store'}});
  const length=Number(context.request.headers.get('content-length')||0);if(length>8192)return new Response('Request too large.',{status:413});
 }
 const response=await next();response.headers.set('Cache-Control','private, no-store');response.headers.set('X-Robots-Tag','noindex, nofollow');response.headers.set('Referrer-Policy','strict-origin');response.headers.set('X-Content-Type-Options','nosniff');response.headers.set('Content-Security-Policy',"frame-ancestors 'none'; base-uri 'self'; object-src 'none'");return response;
});
