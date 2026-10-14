import {boundedText} from '../../lib/request';
import type {APIRoute} from 'astro';
import {createSearch} from '../../lib/server';
export const prerender=false;
export const POST:APIRoute=async({request,locals,redirect})=>{
 try{const text=await boundedText(request);if(text.length>8192)throw new Error('Input is too long.');const data=new URLSearchParams(text);
 // Native FormData fetch uses multipart; accept that through a bounded Request clone.
 let fields:FormData|URLSearchParams=data;
 if(request.headers.get('content-type')?.includes('multipart/form-data'))fields=await new Request(request.url,{method:'POST',headers:request.headers,body:text}).formData();
 const kind=String(fields.get('kind')||'');const search=await createSearch(locals.owner,{kind,input:String(fields.get(kind)||''),state:String(fields.get('state')||''),scenario:String(fields.get('scenario')||'available')});
 const url=`/search/${search.id}/`;return request.headers.get('accept')?.includes('application/json')?Response.json({url}):redirect(url,303);
 }catch(e){return Response.json({error:e instanceof Error?e.message:'Search failed. Please retry.'},{status:400});}
};
