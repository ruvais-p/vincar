export type AnalyticsEvent='checker_started'|'validation_failed'|'search_submitted'|'vehicle_identified'|'preview_viewed'|'plan_selected'|'checkout_started'|'purchase_confirmed'|'report_opened'|'download_requested'|'cancellation_completed';
// Integration hook only: no network transport, identifiers, user data or content.
export function track(name:AnalyticsEvent){window.dispatchEvent(new CustomEvent('vehicle-history:analytics',{detail:{name}}));}
