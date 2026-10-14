// Aggregate event-name counters only; replace with an approved metrics sink.
// Never include identifiers, email, report contents, tokens, or payment payloads.
export const serverMetrics = new Map<string,number>();
export function serverEvent(name:'search_submitted'|'vehicle_identified'|'purchase_confirmed'|'download_requested'|'delivery_failed'|'report_delivered'){
 serverMetrics.set(name,(serverMetrics.get(name)||0)+1);
}
