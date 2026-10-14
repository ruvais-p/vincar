import {serverEvent} from './server-analytics';
import {randomBytes,createHmac,timingSafeEqual,createHash} from 'node:crypto';
import {plans,config} from './config';
import {fixture,identity} from './fixtures';
import {validate} from './validation';
import type {Search,SearchState,Report,Order,Entitlement,CreditLedgerEntry,User} from './models';
export const id=()=>randomBytes(24).toString('base64url');
export const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
export interface Persistence {
 users:Map<string,User>; sessions:Map<string,{owner:string;expires:number}>; searches:Map<string,Search>; reports:Map<string,Report>; orders:Map<string,Order>; entitlements:Map<string,Entitlement>; ledger:Map<string,CreditLedgerEntry>; callbacks:Set<string>;
}
class DemoMemoryPersistence implements Persistence {
 users=new Map<string,User>();sessions=new Map<string,{owner:string;expires:number}>();searches=new Map<string,Search>();reports=new Map<string,Report>();orders=new Map<string,Order>();entitlements=new Map<string,Entitlement>();ledger=new Map<string,CreditLedgerEntry>();callbacks=new Set<string>();
}
export const db=new DemoMemoryPersistence();
export const saved=new Map<string,Set<string>>();
export const outbox=new Map<string,{owner:string;orderId:string;token:string;expires:number;used:boolean}>();
export interface VehicleProvider { search(search:Search):Promise<Pick<Search,'status'|'identity'>>; report(search:Search):Promise<typeof fixture>; }
export const provider:VehicleProvider={
 async search(search){const state:SearchState=search.scenario==='fulfillment-failed'?'available':(['available','identified','no-match','unsupported','failed'].includes(search.scenario)?search.scenario as SearchState:'available');return {status:state,...(['available','identified'].includes(state)?{identity}: {})};},
 async report(){return structuredClone(fixture);}
};
export interface PaymentAdapter {createSession(order:Order):{id:string;mode:'sandbox'};verifyWebhook(body:string,signature:string):{eventId:string;orderId:string;cents:number;currency:string};}
const sandboxSecret=randomBytes(32);
export const payments:PaymentAdapter={createSession(order){return {id:order.id,mode:'sandbox'};},verifyWebhook(body,signature){const expected=createHmac('sha256',sandboxSecret).update(body).digest('hex');const a=Buffer.from(signature),b=Buffer.from(expected);if(a.length!==b.length||!timingSafeEqual(a,b))throw new Error('Invalid callback signature.');const parsed=JSON.parse(body);if(typeof parsed.eventId!=='string'||typeof parsed.orderId!=='string'||!Number.isInteger(parsed.cents)||parsed.currency!==config.currency)throw new Error('Invalid callback.');return parsed;}};
export function activeCredits(owner:string){return [...db.ledger.values()].filter(e=>e.owner===owner&&new Date(e.expiresAt).getTime()>Date.now()).reduce((sum,e)=>sum+e.delta,0);}
export function findReport(owner:string,search:Search){return [...db.reports.values()].find(r=>{const s=db.searches.get(r.searchId);return r.owner===owner&&s?.kind===search.kind&&s.input===search.input&&s.state===search.state;});}
export function authorizedReport(owner:string,reportId:string){const report=db.reports.get(reportId);return report?.owner===owner&&db.entitlements.get(reportId)?.owner===owner?report:undefined;}
export async function createSearch(owner:string,data:{kind:string;input:string;state?:string;scenario:string}){
 const result=validate(data.kind,data.input,data.state);if(result.error)throw new Error(result.error);
 const search:Search={id:id(),owner,kind:data.kind as 'vin'|'plate',input:result.value,state:data.kind==='plate'?data.state:undefined,scenario:data.scenario,submittedAt:new Date().toISOString(),status:'received'};
 db.searches.set(search.id,search);Object.assign(search,await provider.search(search));serverEvent('search_submitted');if(search.identity)serverEvent('vehicle_identified');return search;
}
export function createOrder(owner:string,searchId:string,planId:string,email:string){
 const search=db.searches.get(searchId);if(!search||search.owner!==owner||search.status!=='available')throw new Error('Confirmed demo availability is required before checkout.');
 const existingReport=findReport(owner,search);if(existingReport)return {reportId:existingReport.id};
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw new Error('Enter a valid email address.');
 const plan=plans.find(p=>p.id===planId);if(!plan)throw new Error('Choose an available plan.');
 const existing=[...db.orders.values()].find(o=>o.owner===owner&&o.searchId===searchId&&o.status!=='fulfilled');if(existing)return {order:existing};
 const order:Order={id:id(),owner,searchId,planId,cents:plan.cents,email,status:'pending',createdAt:new Date().toISOString()};db.orders.set(order.id,order);payments.createSession(order);return {order};
}
const inFlight=new Map<string,Promise<Report|undefined>>();
async function fulfillUnlocked(order:Order,retry=false){
 if(order.reportId)return db.reports.get(order.reportId);
 if(order.status!=='paid'&&order.status!=='fulfillment-failed')throw new Error('Payment is not verified.');
 const search=db.searches.get(order.searchId)!;
 const existing=findReport(order.owner,search);if(existing){order.status='fulfilled';order.reportId=existing.id;return existing;}
 if(search.scenario==='fulfillment-failed'&&!retry){order.status='fulfillment-failed';serverEvent('delivery_failed');return;}
 try{
  const data=await provider.report(search);
  const buckets=[...db.ledger.values()].filter(e=>e.owner===order.owner&&e.reason==='purchase'&&new Date(e.expiresAt).getTime()>Date.now()).sort((a,b)=>a.expiresAt.localeCompare(b.expiresAt));
  const bucket=buckets.find(b=>[...db.ledger.values()].filter(e=>e.owner===order.owner&&e.orderId===b.orderId).reduce((n,e)=>n+e.delta,0)>0);
  if(!bucket)throw new Error('No valid report credit remains.');
  const report:Report={...data,id:id(),owner:order.owner,searchId:search.id,generatedAt:new Date().toISOString()};
  // Synchronous commit in demo. Production repository must make this a transaction.
  db.reports.set(report.id,report);db.entitlements.set(report.id,{owner:order.owner,reportId:report.id,orderId:order.id});
  db.ledger.set(`report:${report.id}`,{id:`report:${report.id}`,owner:order.owner,orderId:bucket.orderId,delta:-1,expiresAt:bucket.expiresAt,reason:'report'});
  order.status='fulfilled';order.reportId=report.id;serverEvent('report_delivered');
  const token=id();outbox.set(digest(token),{owner:order.owner,orderId:order.id,token,expires:Date.now()+30*60*1000,used:false});return report;
 }catch{order.status='fulfillment-failed';serverEvent('delivery_failed');return;}
}
export async function fulfill(order:Order,retry=false){
 // Serializes fulfillment per owner, including different orders spending the same balance.
 const previous=inFlight.get(order.owner)||Promise.resolve(undefined);
 const task=previous.catch(()=>undefined).then(()=>fulfillUnlocked(order,retry));inFlight.set(order.owner,task);
 try{return await task;}finally{if(inFlight.get(order.owner)===task)inFlight.delete(order.owner);}
}
export async function receiveWebhook(body:string,signature:string){
 const event=payments.verifyWebhook(body,signature);const order=db.orders.get(event.orderId);
 if(!order||order.cents!==event.cents)throw new Error('Order or amount mismatch.');
 if(db.callbacks.has(event.eventId))return order;
 if(order.status==='pending'){
  order.status='paid';serverEvent('purchase_confirmed');const plan=plans.find(p=>p.id===order.planId)!;const expires=new Date();expires.setUTCFullYear(expires.getUTCFullYear()+1);
  db.ledger.set(`purchase:${order.id}`,{id:`purchase:${order.id}`,owner:order.owner,orderId:order.id,delta:plan.credits,expiresAt:expires.toISOString(),reason:'purchase'});
 }
 db.callbacks.add(event.eventId);await fulfill(order);return order;
}
export async function simulatePayment(order:Order){
 // Local sandbox provider produces a signed callback. A return URL cannot grant access.
 const body=JSON.stringify({eventId:`sandbox:${order.id}`,orderId:order.id,cents:order.cents,currency:config.currency});
 return receiveWebhook(body,createHmac('sha256',sandboxSecret).update(body).digest('hex'));
}
export async function redeem(owner:string,searchId:string){
 const search=db.searches.get(searchId);if(!search||search.owner!==owner||search.status!=='available')throw new Error('Vehicle availability is required.');const existing=findReport(owner,search);if(existing)return existing;
 const pending=[...db.orders.values()].find(o=>o.owner===owner&&o.searchId===searchId&&o.planId==='credit');
 if(pending)return fulfill(pending,true);
 if(activeCredits(owner)<1)throw new Error('No valid report credits remain.');
 const order:Order={id:id(),owner,searchId,planId:'credit',cents:0,email:db.users.get(owner)?.email||'',status:'paid',createdAt:new Date().toISOString()};db.orders.set(order.id,order);return fulfill(order);
}
