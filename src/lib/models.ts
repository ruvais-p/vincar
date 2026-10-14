export type SearchState='received'|'identified'|'available'|'no-match'|'unsupported'|'failed';
export interface VehicleIdentity {vin?:string; year:number; make:string; model:string; body:string; engine:string;}
export interface Coverage {category:string; status:'record'|'no-match'|'unavailable'; note:string;}
export interface Search {id:string; owner:string; kind:'vin'|'plate'; input:string; state?:string; submittedAt:string; status:SearchState; identity?:VehicleIdentity; scenario:string;}
export interface ReportEvent {id:string; date:string; category:string; title:string; detail:string; mileage?:number; source:string;}
export interface Report {id:string; owner:string; searchId:string; generatedAt:string; sourceFreshness:string; identity:VehicleIdentity; coverage:Coverage[]; events:ReportEvent[];}
export interface Order {id:string; owner:string; searchId:string; planId:string; cents:number; email:string; status:'pending'|'paid'|'fulfilled'|'fulfillment-failed'; reportId?:string; createdAt:string;}
export interface Entitlement {owner:string; reportId:string; orderId:string;}
export interface CreditLedgerEntry {id:string; owner:string; orderId:string; delta:number; expiresAt:string; reason:'purchase'|'report'|'restoration';}
export interface User {id:string; email?:string; createdAt:string;}
