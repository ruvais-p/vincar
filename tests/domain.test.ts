import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validate,checksum} from '../src/lib/validation.ts';
import {createSearch,createOrder,simulatePayment,fulfill,db,id,activeCredits,authorizedReport,redeem,receiveWebhook} from '../src/lib/server.ts';
test('VIN normalization, invalid letters, older formats and state validation',()=>{
 assert.deepEqual(validate('vin',' 1hgcm82633a004352 '),{value:'1HGCM82633A004352'});
 assert.ok(validate('vin','1HGCM82633A00435I').error);assert.match(validate('vin','123456').error!,/Older/);
});
test('checksum utility for a provider-declared applicable VIN',()=>{assert.equal(checksum('1HGCM82633A004352'),true);assert.equal(checksum('1HGCM82633A004353'),false);assert.ok(validate('plate','ABC 123','CA').value);assert.ok(validate('plate','ABC','XX').error);});
test('availability is separate from receipt and identity; no-match cannot checkout',async()=>{
 const owner=id();const search=await createSearch(owner,{kind:'vin',input:'1HGCM82633A004352',scenario:'identified'});assert.equal(search.status,'identified');assert.equal(db.reports.size,0);assert.throws(()=>createOrder(owner,search.id,'single','guest@example.com'));
});
test('verified sandbox callback grants one report; duplicate requests and callbacks do not double charge or deduct',async()=>{
 const owner=id();const search=await createSearch(owner,{kind:'vin',input:'1HGCM82633A004352',scenario:'available'});
 const order=createOrder(owner,search.id,'compare','guest@example.com').order!;const again=createOrder(owner,search.id,'compare','guest@example.com').order!;assert.equal(order.id,again.id);assert.equal(order.status,'pending');assert.equal(activeCredits(owner),0);
 await assert.rejects(()=>receiveWebhook(JSON.stringify({orderId:order.id}), 'fake'));
 await Promise.all([simulatePayment(order),simulatePayment(order),simulatePayment(order)]);assert.equal(order.status,'fulfilled');assert.equal(activeCredits(owner),2);assert.ok(authorizedReport(owner,order.reportId!));assert.equal(authorizedReport(id(),order.reportId!),undefined);
 await fulfill(order);assert.equal(activeCredits(owner),2);assert.equal([...db.reports.values()].filter(r=>r.owner===owner).length,1);
 const repeated=await createSearch(owner,{kind:'vin',input:'1HGCM82633A004352',scenario:'available'});assert.equal((await redeem(owner,repeated.id))?.id,order.reportId);assert.equal(activeCredits(owner),2);
});
test('paid fulfillment failure preserves payment and credits; retry is idempotent',async()=>{
 const owner=id();const search=await createSearch(owner,{kind:'plate',input:'DEMO 2',state:'CA',scenario:'fulfillment-failed'});const order=createOrder(owner,search.id,'single','guest@example.com').order!;await simulatePayment(order);assert.equal(order.status,'fulfillment-failed');assert.equal(activeCredits(owner),1);assert.equal(order.reportId,undefined);
 await Promise.all([fulfill(order,true),fulfill(order,true)]);assert.equal(order.status,'fulfilled');assert.equal(activeCredits(owner),0);assert.equal([...db.reports.values()].filter(r=>r.owner===owner).length,1);
});
test('concurrent credit redemption cannot spend one balance twice',async()=>{
 const owner=id();const first=await createSearch(owner,{kind:'plate',input:'FIRST',state:'CA',scenario:'available'});const order=createOrder(owner,first.id,'compare','guest@example.com').order!;await simulatePayment(order);
 const searches=await Promise.all(['SECOND','THIRD','FOURTH'].map(input=>createSearch(owner,{kind:'plate',input,state:'CA',scenario:'available'})));
 await Promise.all(searches.map(s=>redeem(owner,s.id)));assert.equal(activeCredits(owner),0);assert.equal([...db.reports.values()].filter(r=>r.owner===owner).length,3);
});
test('request body limit applies even without Content-Length',async()=>{
 const {boundedText}=await import('../src/lib/request.ts');assert.equal(await boundedText(new Request('https://example.test',{method:'POST',body:'hello'})),'hello');await assert.rejects(()=>boundedText(new Request('https://example.test',{method:'POST',body:'x'.repeat(8193)})),/too large/);
});
