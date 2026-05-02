/** Keep in sync with `docs/analytics/events.yaml` (verified by `npm run verify:telemetry`). */
export type TelemetryEventName =
  | "workspace_opened"
  | "permission_denied_viewed"
  | "sandbox_seeded"
  | "setup_cta_clicked"
  | "empty_state_cta_clicked"
  | "home_viewed"
  | "competition_viewed"
  | "match_viewed"
  | "source_viewed"
  | "filter_applied"
  | "source_paused"
  | "identity_link_completed"
  | "consent_revoked"
  | "merge_applied"
  | "data_product_created"
  | "widget_published"
  | "widget_unpublished"
  | "api_key_created"
  | "integrator_hub_viewed"
  | "partner_access_granted"
  | "partners_directory_viewed"
  | "partners_access_revoked"
  | "trust_queue_viewed"
  | "trust_signal_reviewed"
  | "role_changed"
  | "settings_workspace_viewed"
  | "settings_retention_saved"
  | "search_run"
  | "notification_opened"
  | "flag_enabled";

export type TelemetryPayload = Record<string, unknown>;

/**
 * Minimal telemetry shim for Phase 0/1.
 * Replace with a real client later (Segment, PostHog, etc.) without changing call sites.
 */
export function track(event: TelemetryEventName, payload: TelemetryPayload = {}) {
  // Keep it explicit and inspectable during early UX development.
  // eslint-disable-next-line no-console
  console.info("[telemetry]", event, payload);
  (window as unknown as { __HG_TELEMETRY__?: Array<{ event: string; payload: unknown; ts: number }> })
    .__HG_TELEMETRY__ ??= [];
  (window as unknown as { __HG_TELEMETRY__: Array<{ event: string; payload: unknown; ts: number }> })
    .__HG_TELEMETRY__.push({ event, payload, ts: Date.now() });
}

