import {boundedText} from '../../lib/request';
import type {APIRoute} from 'astro';
import {db,createOrder,simulatePayment,fulfill,redeem,saved,authorizedReport,provider,outbox,digest,id} from '../../lib/server';
export const prerender=false;
export const POST:APIRoute=async({request,locals,redirect,cookies,url})=>{
 try{
 const raw=await boundedText(request);if(raw.length>8192)throw new Error('Request too large.');const data=new URLSearchParams(raw);const action=String(data.get('action')||'');const owner=locals.owner;
 if(action==='order'){
 const result=createOrder(owner,String(data.get('search')),String(data.get('plan')),String(data.get('email')));
 if(result.reportId)return redirect(`/reports/${result.reportId}/`,303);return redirect(`/checkout/?order=${result.order!.id}`,303);
 }
 if(action==='pay'||action==='retry-order'){
 const order=db.orders.get(String(data.get('order')));if(!order||order.owner!==owner)return new Response('Order not found.',{status:404});
 if(action==='pay')await simulatePayment(order);else await fulfill(order,true);
 return redirect(order.reportId?`/reports/${order.reportId}/`:`/checkout/?order=${order.id}`,303);
 }
 if(action==='credit'){
 const report=await redeem(owner,String(data.get('search')));return redirect(report?`/reports/${report.id}/`:'/account/',303);
 }
 if(action==='retry-search'){
 const search=db.searches.get(String(data.get('search')));if(!search||search.owner!==owner)return new Response('Search not found.',{status:404});
 search.scenario='available';Object.assign(search,await provider.search(search));return redirect(`/search/${search.id}/`,303);
 }
 if(action==='save'){
 const report=authorizedReport(owner,String(data.get('report')));if(!report)return new Response('Report not found.',{status:404});
 const list=saved.get(owner)||new Set<string>();list.has(report.id)?list.delete(report.id):list.add(report.id);saved.set(owner,list);return redirect('/account/shortlist/',303);
 }
 if(action==='account'){
 const email=String(data.get('email')||'');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw new Error('Enter a valid email.');db.users.get(owner)!.email=email;return redirect('/account/?profile=saved',303);
 }
 if(action==='access'){
 const token=String(data.get('token')||'');const delivery=outbox.get(digest(token));
 if(!delivery||delivery.used||delivery.expires<Date.now())return new Response('This access link has expired or was already used.',{status:410});
 const order=db.orders.get(delivery.orderId);if(!order?.reportId)return new Response('Report not available.',{status:404});
 delivery.used=true;const session=id();db.sessions.set(session,{owner:delivery.owner,expires:Date.now()+7*86400000});cookies.set('vh_session',session,{path:'/',httpOnly:true,sameSite:'lax',secure:url.protocol==='https:',maxAge:7*86400});return redirect(`/reports/${order.reportId}/`,303);
 }
 throw new Error('Unknown action.');
 }catch(e){return new Response(e instanceof Error?e.message:'Unable to complete the action. Please go back and retry.',{status:400});}
};
