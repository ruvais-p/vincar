import type {APIRoute} from 'astro';
export const GET:APIRoute=({site})=>new Response(`User-agent: *\nDisallow: /api/\nDisallow: /search/\nDisallow: /reports/\nDisallow: /checkout/\nDisallow: /account/\nSitemap: ${new URL('/sitemap.xml',site).href}\n`,{headers:{'Content-Type':'text/plain'}});
