import {config} from '../../lib/config';
import {serverEvent} from '../../lib/server-analytics';
import type {APIRoute} from 'astro';
import {authorizedReport,db} from '../../lib/server';
export const prerender=false;
export const GET:APIRoute=({url,locals})=>{
 const report=authorizedReport(locals.owner,url.searchParams.get('report')||'');if(!report)return new Response('Report not found.',{status:404});
 serverEvent('download_requested');
 const search=db.searches.get(report.searchId)!;
 const text=[`${config.name.toUpperCase()} — DEMO / SYNTHETIC DATA`,'No live vehicle check. Do not use this fixture for a real purchase.',`Vehicle: ${report.identity.year} ${report.identity.make} ${report.identity.model}`,`Submitted identifier: ${search.input} ${search.state||''}`,`Report generated: ${report.generatedAt}`,`Fixture freshness: ${report.sourceFreshness}`,'','MATERIAL FINDING: Front-end damage recorded. Severity and repair quality unknown. Ask for repair invoices and an independent inspection.','','COVERAGE',...report.coverage.map(c=>`${c.category}: ${c.status==='record'?'Record found':c.status==='no-match'?'No matching record found':'Coverage unavailable'}. ${c.note}`),'','DATED EVIDENCE',...report.events.map(e=>`${e.date} — ${e.title}${e.mileage!==undefined?` — ${e.mileage} miles`:''}\n${e.detail}\nSource: ${e.source}`),'','No matching record is not proof that an incident never occurred. A report does not replace an inspection.'].join('\n\n');
 return new Response(text,{headers:{'Content-Type':'text/plain; charset=utf-8','Content-Disposition':'attachment; filename="vincar-demo.txt"','Cache-Control':'private, no-store'}});
};
