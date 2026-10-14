import {config} from './config';
export function validate(kind:string,raw:string,state?:string):{value:string;error?:string} {
 const value=raw.trim().toUpperCase();
 if(kind==='vin') {
  if(value.length!==17) return {value,error: value.length>0&&value.length<17?'Enter a 17-character VIN. Older, pre-1981 identifiers need a specialist service; this demo does not support them.':'Enter all 17 characters of the VIN.'};
  if(!/^[A-HJ-NPR-Z0-9]{17}$/.test(value)) return {value,error:'Use letters and numbers only. A standard VIN never contains I, O, or Q.'};
 } else if(kind==='plate') {
  if(!state||!config.states.includes(state)) return {value,error:'Choose a supported US state or the District of Columbia.'};
  // Broad input safety bound, not a claim about state-specific plate formats.
  if(!/^[A-Z0-9 -]{1,10}$/.test(value)||!/[A-Z0-9]/.test(value)) return {value,error:'Enter 1–10 letters, numbers, spaces, or hyphens from your plate. Specialty formats may need a VIN search.'};
 } else return {value,error:'Choose VIN or license plate.'};
 return {value};
}
export function checksum(vin:string):boolean {
 const values:Record<string,number>={A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,J:1,K:2,L:3,M:4,N:5,P:7,R:9,S:2,T:3,U:4,V:5,W:6,X:7,Y:8,Z:9};
 const weights=[8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2];
 const sum=[...vin].reduce((n,c,i)=>n+(values[c]??Number(c))*weights[i],0)%11;
 return vin[8]===(sum===10?'X':String(sum));
}
