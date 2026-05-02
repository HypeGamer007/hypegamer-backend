import {
  prependWebhookDeliveryRow,
  readWebhookEndpoints,
  writeWebhookEndpoints,
  type WebhookEndpoint,
} from "@/lib/developerWebhooksStore";
import { emitSetupChanged } from "@/lib/setupEvents";
import {
  STORAGE_DEMO_SEEDED,
  STORAGE_GOVERNANCE_MODULES_VISITED,
  STORAGE_INTEGRATOR_HUB_VISITED,
  STORAGE_ONBOARDING_COMPLETE,
  STORAGE_SOURCES_VISITED,
} from "@/lib/storageKeys";
import { track } from "@/lib/telemetry";
import { buildWebhookPayloadPreview } from "@/mocks/webhookDemo";

const TOUR_ENDPOINT_ID = "wh_ep_moba_full_tour";

/**
 * One-click mock tour: global sandbox flag, setup checklist progress, and a sample
 * webhook endpoint + delivered row so Developers → Integrations / Logs showcase real UI.
 * Does not replace bundled `DEMO_*` fixtures — those are already MOBA-themed in mocks.
 */
export function runFullDemoTour(): void {
  localStorage.setItem(STORAGE_ONBOARDING_COMPLETE, "1");
  localStorage.setItem(STORAGE_DEMO_SEEDED, "1");
  localStorage.setItem(STORAGE_SOURCES_VISITED, "1");
  localStorage.setItem(STORAGE_INTEGRATOR_HUB_VISITED, "1");
  localStorage.setItem(STORAGE_GOVERNANCE_MODULES_VISITED, "1");

  const rest = readWebhookEndpoints().filter((e) => e.id !== TOUR_ENDPOINT_ID);
  const endpoint: WebhookEndpoint = {
    id: TOUR_ENDPOINT_ID,
    url: "https://partner-demo.example/hooks/moba-control-plane",
    events: ["widget_published", "data_product_created"],
    signingSecret: "hg_whsec_tour_moba_demo_not_for_production",
    createdAt: new Date().toISOString(),
  };
  writeWebhookEndpoints([endpoint, ...rest]);

  const at = new Date().toISOString();
  prependWebhookDeliveryRow({
    id: "wh_del_moba_tour_1",
    at,
    endpointId: TOUR_ENDPOINT_ID,
    endpointUrl: endpoint.url,
    event: "widget_published",
    status: "delivered",
    attempts: 1,
    requestId: "req_moba_tour_demo",
    payloadPreview: buildWebhookPayloadPreview("widget_published"),
  });

  track("sandbox_seeded", {
    source: "full_demo_tour",
    fixtureSet: "moba_operational.demo",
    workspaceId: "demo_workspace",
    projectId: "demo_project",
  });

  emitSetupChanged();
}
