import type {Report, VehicleIdentity} from './models';
export const identity:VehicleIdentity={year:2019,make:'Example',model:'Touring Sedan',body:'4-door sedan',engine:'2.0L gasoline • automatic'};
export const fixture:Omit<Report,'id'|'owner'|'searchId'|'generatedAt'>={identity,sourceFreshness:'2026-09-30T00:00:00Z',coverage:[
 {category:'Damage & accidents',status:'record',note:'One synthetic damage entry; repair quality is not established.'},
 {category:'Title brands',status:'no-match',note:'No matching brand in this fixture. This is not proof of a clean title.'},
 {category:'Mileage',status:'record',note:'Three synthetic odometer readings. Check the current odometer.'},
 {category:'Ownership & use',status:'record',note:'Personal-use registration recorded; owner identities are excluded.'},
 {category:'Recalls',status:'unavailable',note:'No live recall connection. Check the manufacturer before purchase.'},
 {category:'Past listings & photos',status:'unavailable',note:'Listing and photo coverage is not included in this fixture.'}
],events:[
 {id:'registration',date:'2019-06-12',category:'Ownership & use',title:'First registration recorded',detail:'Personal-use registration. This fixture does not identify an owner.',mileage:18,source:'Synthetic registration fixture'},
 {id:'service',date:'2022-04-08',category:'Mileage',title:'Odometer reading recorded',detail:'Ask for the service invoice and compare it with the maintenance schedule.',mileage:28140,source:'Synthetic service fixture'},
 {id:'damage',date:'2024-02-19',category:'Damage & accidents',title:'Front-end damage recorded',detail:'Severity and repair quality are unknown. Ask for repair invoices and arrange an independent inspection.',source:'Synthetic damage fixture'},
 {id:'mileage',date:'2026-09-14',category:'Mileage',title:'Latest recorded mileage',detail:'The current odometer may be higher. Compare it at the viewing.',mileage:62480,source:'Synthetic inspection fixture'}
]};
