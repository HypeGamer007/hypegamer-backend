import type { WebhookTestEventName } from "@/lib/developerWebhooksStore";

export const WEBHOOK_TEST_EVENTS: Array<{ value: WebhookTestEventName; label: string }> = [
  { value: "source_paused", label: "source_paused" },
  { value: "merge_applied", label: "merge_applied" },
  { value: "widget_published", label: "widget_published" },
  { value: "data_product_created", label: "data_product_created" },
  { value: "consent_revoked", label: "consent_revoked" },
];

export const WEBHOOK_TEST_EVENT_VALUES: WebhookTestEventName[] = WEBHOOK_TEST_EVENTS.map((e) => e.value);

export function buildWebhookPayloadPreview(event: WebhookTestEventName): string {
  const base: Record<string, unknown> = {
    event,
    workspaceId: "demo_workspace",
    projectId: "demo_project",
    occurredAt: new Date().toISOString(),
    restrictedField: "[REDACTED]",
  };

  switch (event) {
    case "source_paused":
      base.sourceId = "src_demo_1";
      base.impactedProductCount = 2;
      break;
    case "merge_applied":
      base.reviewerId = "integrity_reviewer";
      base.confidenceBand = "medium";
      break;
    case "widget_published":
      base.widgetId = "wg_demo";
      base.environment = "sandbox";
      break;
    case "data_product_created":
      base.dataProductId = "dp_demo";
      base.entityType = "competition";
      break;
    case "consent_revoked":
      base.playerId = "demo_player";
      base.consentType = "profile_share";
      break;
    default:
      break;
  }

  return JSON.stringify(base, null, 2);
}

export function newSigningSecret(): string {
  const tail = crypto.randomUUID().replace(/-/g, "").slice(0, 20);
  return `hg_whsec_${tail}`;
}

export function maskSigningSecret(secret: string): string {
  if (secret.length <= 12) return "••••";
  return `${secret.slice(0, 10)}…${secret.slice(-4)}`;
}
