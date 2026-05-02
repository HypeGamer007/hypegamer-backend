import { STORAGE_WEBHOOK_DELIVERY_LOG, STORAGE_WEBHOOK_ENDPOINTS } from "@/lib/storageKeys";

export type WebhookTestEventName =
  | "source_paused"
  | "merge_applied"
  | "widget_published"
  | "data_product_created"
  | "consent_revoked";

export type WebhookEndpoint = {
  id: string;
  url: string;
  events: WebhookTestEventName[];
  signingSecret: string;
  createdAt: string;
};

export type DeliveryStatus = "delivered" | "failed" | "retrying";

export type WebhookDeliveryLogRow = {
  id: string;
  at: string;
  endpointId: string;
  endpointUrl: string;
  event: WebhookTestEventName;
  status: DeliveryStatus;
  attempts: number;
  requestId: string;
  lastError?: string;
  payloadPreview: string;
};

const MAX_LOG_ROWS = 200;

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readWebhookEndpoints(): WebhookEndpoint[] {
  return parseJson<WebhookEndpoint[]>(localStorage.getItem(STORAGE_WEBHOOK_ENDPOINTS), []);
}

export function writeWebhookEndpoints(rows: WebhookEndpoint[]) {
  localStorage.setItem(STORAGE_WEBHOOK_ENDPOINTS, JSON.stringify(rows));
}

export function appendWebhookEndpoint(row: WebhookEndpoint) {
  writeWebhookEndpoints([...readWebhookEndpoints(), row]);
}

export function deleteWebhookEndpoint(endpointId: string) {
  writeWebhookEndpoints(readWebhookEndpoints().filter((e) => e.id !== endpointId));
  const logs = readWebhookDeliveryLog().filter((l) => l.endpointId !== endpointId);
  writeWebhookDeliveryLog(logs);
}

export function readWebhookDeliveryLog(): WebhookDeliveryLogRow[] {
  return parseJson<WebhookDeliveryLogRow[]>(localStorage.getItem(STORAGE_WEBHOOK_DELIVERY_LOG), []);
}

export function writeWebhookDeliveryLog(rows: WebhookDeliveryLogRow[]) {
  const next = rows.slice(0, MAX_LOG_ROWS);
  localStorage.setItem(STORAGE_WEBHOOK_DELIVERY_LOG, JSON.stringify(next));
}

export function prependWebhookDeliveryRow(row: WebhookDeliveryLogRow) {
  writeWebhookDeliveryLog([row, ...readWebhookDeliveryLog()]);
}

export function updateWebhookDeliveryRow(id: string, patch: Partial<WebhookDeliveryLogRow>) {
  const next = readWebhookDeliveryLog().map((r) => (r.id === id ? { ...r, ...patch } : r));
  writeWebhookDeliveryLog(next);
}

export function findWebhookDeliveryRow(id: string): WebhookDeliveryLogRow | undefined {
  return readWebhookDeliveryLog().find((r) => r.id === id);
}
