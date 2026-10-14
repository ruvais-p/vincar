import type {APIRoute} from 'astro';
import {publicPages,guides} from '../lib/content';
export const GET:APIRoute=({site})=>{const routes=['',...Object.keys(publicPages),'pricing','sample-report','vin-check','vin-decoder','license-plate-lookup',...guides.map(g=>'guides/'+g.slug),'guides/buying-checklist'];return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.map(r=>`<url><loc>${new URL('/'+(r?r+'/':''),site).href}</loc></url>`).join('')+'</urlset>',{headers:{'Content-Type':'application/xml'}});};
