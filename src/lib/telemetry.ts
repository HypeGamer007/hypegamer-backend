export type TelemetryEventName =
  | "workspace_opened"
  | "permission_denied_viewed"
  | "setup_cta_clicked"
  | "sandbox_seeded"
  | "home_viewed"
  | "competition_viewed"
  | "match_viewed"
  | "source_viewed"
  | "source_paused"
  | "identity_link_completed"
  | "consent_revoked"
  | "empty_state_cta_clicked"
  | "filter_applied"
  | "data_product_created"
  | "widget_published"
  | "api_key_created";

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

