export const config = {
  name: import.meta.env?.PUBLIC_PRODUCT_NAME || 'Vincar',
  mode: 'demo' as const,
  market: 'US', currency: 'USD', language: 'en', membershipEnabled: true,
  states: ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'],
  categories: ['Damage & accidents','Title brands','Mileage','Ownership & use','Recalls','Past listings & photos'],
};
export interface Plan {id:string; name:string; cents:number; credits:number; cadence:'one-time'|'monthly'; validity:string; kind?:'report'|'trial'|'compare';}
export const membershipPlan:Plan={id:'compare',name:'AI Compare Unlimited',cents:3999,credits:3,cadence:'monthly',validity:'Cancel anytime',kind:'compare'};
export const plans:Plan[] = [
 {id:'single',name:'Single report',cents:1499,credits:1,cadence:'one-time',validity:'12 months',kind:'report'},
 {id:'trial',name:'3-day unlimited trial',cents:100,credits:3,cadence:'monthly',validity:'3-day trial, then monthly',kind:'trial'},
 ...(config.membershipEnabled ? [membershipPlan] : [])
];
export const money=(cents:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:config.currency}).format(cents/100);
export const date=(value:string)=>new Date(value).toLocaleString('en-US',{dateStyle:'medium',timeStyle:'short',timeZone:'UTC'})+' UTC';
