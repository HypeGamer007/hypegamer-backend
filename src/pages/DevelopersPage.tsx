import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import dlg from "@/components/dialogs/ConfirmDialog.module.css";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { EnvironmentBadge } from "@/components/entity/EnvironmentBadge";
import { FilterBar } from "@/components/filters/FilterBar";
import { PageFrame } from "@/components/layout/PageFrame";
import { DataTable } from "@/components/patterns/DataTable";
import { RouteViewRoot } from "@/components/state/RouteViewRoot";
import { useDialogFocusTrap } from "@/hooks/useDialogFocusTrap";
import { useDemoSeeded } from "@/hooks/useDemoSeeded";
import { useRouteFixture } from "@/hooks/useRouteFixture";
import {
  appendWebhookEndpoint,
  deleteWebhookEndpoint,
  findWebhookDeliveryRow,
  prependWebhookDeliveryRow,
  readWebhookDeliveryLog,
  readWebhookEndpoints,
  updateWebhookDeliveryRow,
  type WebhookDeliveryLogRow,
  type WebhookEndpoint,
  type WebhookTestEventName,
} from "@/lib/developerWebhooksStore";
import { readExtraApiKeys, writeExtraApiKeys } from "@/lib/productizationStorage";
import { resolveListRouteStatus } from "@/lib/resolveListRouteStatus";
import { seedDemoWorkspace } from "@/lib/seedDemoWorkspace";
import { mergeSearchParams } from "@/lib/searchParams";
import { track } from "@/lib/telemetry";
import { DEMO_API_KEYS, type ApiKeyRow } from "@/mocks/productization.demo";
import {
  WEBHOOK_TEST_EVENTS,
  WEBHOOK_TEST_EVENT_VALUES,
  buildWebhookPayloadPreview,
  maskSigningSecret,
  newSigningSecret,
} from "@/mocks/webhookDemo";
import tstyles from "@/pages/developers/DevelopersTabs.module.css";

type DevelopersTab = "keys" | "integrations" | "logs";

function uniqOptions(rows: ApiKeyRow[], pick: (r: ApiKeyRow) => string) {
  const set = new Set(rows.map(pick));
  return [...set].sort().map((value) => ({ value, label: value }));
}

function newApiSecret(): string {
  const tail = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return `hg_demo_${tail}`;
}

function maskApiSecret(full: string): string {
  if (full.length <= 10) return "••••";
  return `${full.slice(0, 8)}…${full.slice(-4)}`;
}

function parseTab(raw: string | null): DevelopersTab {
  if (raw === "keys" || raw === "integrations" || raw === "logs") return raw;
  return "integrations";
}

export function DevelopersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fx = useRouteFixture();
  const demoSeeded = useDemoSeeded();
  const status = resolveListRouteStatus(fx, demoSeeded);

  const tab = parseTab(searchParams.get("tab"));
  const didDefaultTab = useRef(false);
  useLayoutEffect(() => {
    if (didDefaultTab.current) return;
    if (searchParams.get("tab")) {
      didDefaultTab.current = true;
      return;
    }
    didDefaultTab.current = true;
    navigate(
      {
        pathname: "/developers",
        search: mergeSearchParams(searchParams, { tab: "integrations" }).toString(),
      },
      { replace: true },
    );
  }, [navigate, searchParams]);

  const [storageTick, setStorageTick] = useState(0);
  const [webhookTick, setWebhookTick] = useState(0);

  const [createKeyOpen, setCreateKeyOpen] = useState(false);
  const [revealApiSecret, setRevealApiSecret] = useState<string | null>(null);
  const [pendingApiKeyRow, setPendingApiKeyRow] = useState<ApiKeyRow | null>(null);
  const [keyLabel, setKeyLabel] = useState("");
  const [keyType, setKeyType] = useState<ApiKeyRow["keyType"]>("server");

  const keyTitleId = useId();
  const keyBodyId = useId();

  const [endpointDialogOpen, setEndpointDialogOpen] = useState(false);
  const [endpointUrl, setEndpointUrl] = useState("");
  const [endpointEvents, setEndpointEvents] = useState<WebhookTestEventName[]>([]);
  const [revealSigningSecret, setRevealSigningSecret] = useState<string | null>(null);
  const [pendingEndpoint, setPendingEndpoint] = useState<WebhookEndpoint | null>(null);
  const epTitleId = useId();
  const epBodyId = useId();

  const [deleteEndpointId, setDeleteEndpointId] = useState<string | null>(null);
  const [revealEndpointId, setRevealEndpointId] = useState<string | null>(null);
  const [signingRevealOpen, setSigningRevealOpen] = useState(false);
  const [signingRevealEndpointId, setSigningRevealEndpointId] = useState<string | null>(null);

  const [testEvent, setTestEvent] = useState<WebhookTestEventName>("data_product_created");
  const [testError, setTestError] = useState<string | null>(null);
  const [logsAttention, setLogsAttention] = useState(false);
  const [copyLogsHint, setCopyLogsHint] = useState<string | null>(null);

  const createKeyOverlayRef = useRef<HTMLDivElement | null>(null);
  const apiRevealOverlayRef = useRef<HTMLDivElement | null>(null);
  const endpointDialogOverlayRef = useRef<HTMLDivElement | null>(null);
  const signingRevealOverlayRef = useRef<HTMLDivElement | null>(null);
  const signingRerevealOverlayRef = useRef<HTMLDivElement | null>(null);

  function finishApiKeyReveal() {
    if (pendingApiKeyRow) {
      writeExtraApiKeys([...readExtraApiKeys(), pendingApiKeyRow]);
      setStorageTick((t) => t + 1);
    }
    setRevealApiSecret(null);
    setPendingApiKeyRow(null);
  }

  function finishEndpointSecretReveal() {
    if (pendingEndpoint) {
      appendWebhookEndpoint(pendingEndpoint);
      setWebhookTick((t) => t + 1);
    }
    setRevealSigningSecret(null);
    setPendingEndpoint(null);
  }

  useDialogFocusTrap(createKeyOpen, createKeyOverlayRef, { onEscape: () => setCreateKeyOpen(false) });
  useDialogFocusTrap(Boolean(revealApiSecret), apiRevealOverlayRef, { onEscape: finishApiKeyReveal });
  useDialogFocusTrap(endpointDialogOpen, endpointDialogOverlayRef, { onEscape: () => setEndpointDialogOpen(false) });
  useDialogFocusTrap(Boolean(revealSigningSecret), signingRevealOverlayRef, { onEscape: finishEndpointSecretReveal });
  useDialogFocusTrap(signingRevealOpen, signingRerevealOverlayRef, {
    onEscape: () => {
      setSigningRevealOpen(false);
      setSigningRevealEndpointId(null);
    },
  });

  useEffect(() => {
    if (tab === "logs") setLogsAttention(false);
  }, [tab]);

  const kt = searchParams.get("keyType") ?? "";
  const q = searchParams.get("q") ?? "";

  const deliveryStatus = searchParams.get("deliveryStatus") ?? "";
  const deliveryEvent = searchParams.get("deliveryEvent") ?? "";
  const deliveryEndpoint = searchParams.get("deliveryEndpoint") ?? "";

  const catalog = useMemo(() => {
    void storageTick;
    return [...DEMO_API_KEYS, ...readExtraApiKeys()];
  }, [storageTick]);

  const keyRows = useMemo(() => {
    const base = catalog;
    return base.filter((r) => {
      if (kt && r.keyType !== kt) return false;
      if (q) {
        const needle = q.toLowerCase();
        const hay = `${r.label} ${r.keyType} ${r.maskedSecret}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [catalog, kt, q]);

  const endpoints = useMemo(() => {
    void webhookTick;
    return readWebhookEndpoints();
  }, [webhookTick]);

  const deliveryRows = useMemo(() => {
    void webhookTick;
    const base = readWebhookDeliveryLog();
    return base.filter((r) => {
      if (deliveryStatus && r.status !== deliveryStatus) return false;
      if (deliveryEvent && r.event !== deliveryEvent) return false;
      if (deliveryEndpoint && r.endpointId !== deliveryEndpoint) return false;
      return true;
    });
  }, [deliveryEndpoint, deliveryEvent, deliveryStatus, webhookTick]);

  const hasKeyFilters = Boolean(kt || q);
  const keyFilterEmpty =
    demoSeeded && (status === "ready" || status === "partial") && tab === "keys" && keyRows.length === 0 && hasKeyFilters;

  const hasDeliveryFilters = Boolean(deliveryStatus || deliveryEvent || deliveryEndpoint);
  const deliveryFilterEmpty =
    demoSeeded &&
    (status === "ready" || status === "partial") &&
    tab === "logs" &&
    deliveryRows.length === 0 &&
    hasDeliveryFilters;

  const partialBanner =
    fx.rawFixture === "partial"
      ? "Delivery logs and retry timelines may be truncated for viewers under policy."
      : undefined;

  const filtersDisabled = status === "loading" || status === "error" || status === "empty";

  const setTab = (next: DevelopersTab) => {
    navigate({
      pathname: "/developers",
      search: mergeSearchParams(searchParams, { tab: next }).toString(),
    });
  };

  const startCreateKey = () => {
    setKeyLabel("");
    setKeyType("server");
    setCreateKeyOpen(true);
  };

  const generateApiKey = () => {
    const secret = newApiSecret();
    const id = `key_${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
    const row: ApiKeyRow = {
      id,
      label: keyLabel.trim() || "New API key",
      keyType: keyType,
      maskedSecret: maskApiSecret(secret),
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
    };
    setPendingApiKeyRow(row);
    setRevealApiSecret(secret);
    setCreateKeyOpen(false);
    track("api_key_created", {
      projectId: "demo_project",
      keyType: keyType,
    });
  };

  const openEndpointDialog = () => {
    setEndpointUrl("");
    setEndpointEvents([]);
    setEndpointDialogOpen(true);
  };

  const createEndpoint = () => {
    const url = endpointUrl.trim();
    if (!url) return;
    if (!endpointEvents.length) return;
    const secret = newSigningSecret();
    const id = `wh_ep_${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
    const row: WebhookEndpoint = {
      id,
      url,
      events: [...endpointEvents],
      signingSecret: secret,
      createdAt: new Date().toISOString(),
    };
    setPendingEndpoint(row);
    setRevealSigningSecret(secret);
    setEndpointDialogOpen(false);
  };

  const sendWebhookTest = () => {
    const targets = readWebhookEndpoints().filter((e) => e.events.includes(testEvent));
    if (!targets.length) {
      setTestError("No endpoints subscribe to that event. Add an endpoint and select the event first.");
      return;
    }
    setTestError(null);
    const payloadPreview = buildWebhookPayloadPreview(testEvent);
    for (const ep of targets) {
      prependWebhookDeliveryRow({
        id: `wh_del_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
        at: new Date().toISOString(),
        endpointId: ep.id,
        endpointUrl: ep.url,
        event: testEvent,
        status: "failed",
        attempts: 1,
        requestId: `req_${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`,
        lastError: "HTTP 502 from sandbox receiver (attempt 1)",
        payloadPreview,
      });
    }
    setLogsAttention(true);
    setWebhookTick((t) => t + 1);
  };

  const retryDelivery = (rowId: string) => {
    const row = findWebhookDeliveryRow(rowId);
    if (!row || row.status !== "failed") return;
    if (row.attempts >= 4) return;
    const nextAttempts = row.attempts + 1;
    if (nextAttempts >= 2) {
      updateWebhookDeliveryRow(rowId, { attempts: nextAttempts, status: "delivered", lastError: undefined });
    } else {
      updateWebhookDeliveryRow(rowId, {
        attempts: nextAttempts,
        status: "failed",
        lastError: `HTTP 502 from sandbox receiver (attempt ${nextAttempts})`,
      });
    }
    setWebhookTick((t) => t + 1);
  };

  const copyFilteredLogsUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyLogsHint("Link copied to clipboard.");
      window.setTimeout(() => setCopyLogsHint(null), 2800);
    } catch {
      setCopyLogsHint("Could not copy automatically — copy from the address bar.");
      window.setTimeout(() => setCopyLogsHint(null), 4000);
    }
  };

  const toggleEndpointEvent = (ev: WebhookTestEventName, checked: boolean) => {
    setEndpointEvents((cur) => {
      if (checked) return cur.includes(ev) ? cur : [...cur, ev];
      return cur.filter((e) => e !== ev);
    });
  };

  const description =
    tab === "keys"
      ? "API keys with reveal-once handling and masked listings afterward."
      : tab === "integrations"
        ? "Webhook endpoints, signing secrets, and a mocked test console (replace with real delivery workers)."
        : "Delivery attempts with retry simulation and URL-synced filters for reproducible QA.";

  const primaryAction =
    tab === "keys" ? (
      <button type="button" className={dlg.btn} disabled={filtersDisabled} onClick={startCreateKey}>
        Create API key
      </button>
    ) : tab === "integrations" ? (
      <button
        type="button"
        className={dlg.btn}
        disabled={filtersDisabled}
        data-testid="developers-header-add-webhook"
        onClick={openEndpointDialog}
      >
        Add webhook endpoint
      </button>
    ) : null;

  return (
    <RouteViewRoot
      gateAnalyticsId="developers"
      status={status}
      permissions={fx.permissions}
      restricted={fx.restricted}
      requestId={fx.requestId}
      onRetry={() => window.location.reload()}
      partialBanner={partialBanner}
      empty={{
        analyticsId: "developers-empty",
        title: "Developers portal not initialized",
        body: "Load sandbox data to preview API keys, webhook integrations, and delivery logs with deterministic fixtures.",
        primaryCta: { label: "Load sandbox data", action: "load_sandbox" },
        secondaryCta: { label: "Back to Home", action: "goto_home" },
        onPrimary: () => {
          seedDemoWorkspace("developers_empty");
          window.location.assign("/developers");
        },
        onSecondary: () => navigate("/home"),
      }}
    >
      <PageFrame pageTestId="developers-page" title="Developers" description={description} badges={<EnvironmentBadge />} actions={primaryAction}>
        <div className={tstyles.tabList} role="tablist" aria-label="Developers sections">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "keys"}
            className={`${tstyles.tab} ${tab === "keys" ? tstyles.tabActive : ""}`}
            onClick={() => setTab("keys")}
          >
            Keys
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "integrations"}
            className={`${tstyles.tab} ${tab === "integrations" ? tstyles.tabActive : ""}`}
            onClick={() => setTab("integrations")}
          >
            Integrations
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "logs"}
            className={`${tstyles.tab} ${tab === "logs" ? tstyles.tabActive : ""}`}
            onClick={() => setTab("logs")}
            aria-label={logsAttention && tab !== "logs" ? "Logs, new failed deliveries to review" : "Logs"}
          >
            <span className={tstyles.tabLabel}>
              Logs
              {logsAttention && tab !== "logs" ? (
                <span className={tstyles.tabBadge} data-testid="logs-tab-attention-badge" aria-hidden>
                  New
                </span>
              ) : null}
            </span>
          </button>
        </div>

        <p className={tstyles.panelNote}>
          Mocked control-plane UI: deterministic fixtures + local persistence. Replace with real API calls where noted in
          contracts.
        </p>

        {tab === "keys" ? (
          <>
            <FilterBar
              analyticsId="developers_keys"
              disabled={filtersDisabled}
              showClearButton={!keyFilterEmpty}
              search={{ param: "q", label: "Search", placeholder: "Search labels or key types" }}
              selects={[
                {
                  param: "keyType",
                  label: "Key type",
                  allLabel: "All",
                  options: uniqOptions(catalog, (r) => r.keyType),
                },
              ]}
            />

            {keyFilterEmpty ? (
              <EmptyState
                analyticsId="developers-keys-filter-empty"
                title="No keys match these filters"
                body="Clear filters to see all keys in this workspace."
                primaryCta={{ label: "Clear filters", action: "clear_filters" }}
                onPrimary={() =>
                  navigate({
                    pathname: "/developers",
                    search: mergeSearchParams(searchParams, { q: null, keyType: null }).toString(),
                  })
                }
              />
            ) : (
              <DataTable
                loading={status === "loading"}
                loadingColSpan={5}
                caption="Secrets are never shown again after you close the reveal dialog."
                columns={[
                  { id: "label", header: "Label", cell: (r) => r.label },
                  { id: "type", header: "Type", cell: (r) => r.keyType },
                  { id: "secret", header: "Key", cell: (r) => r.maskedSecret },
                  {
                    id: "last",
                    header: "Last used",
                    cell: (r) => (r.lastUsedAt ? new Date(r.lastUsedAt).toLocaleString() : "—"),
                  },
                  { id: "created", header: "Created", cell: (r) => new Date(r.createdAt).toLocaleString() },
                ]}
                rows={keyRows}
              />
            )}
          </>
        ) : null}

        {tab === "integrations" ? (
          <>
            <section className={tstyles.card} aria-labelledby="int-journey-h">
              <h2 id="int-journey-h" className={tstyles.h2}>
                Full partner journey
              </h2>
              <p className={tstyles.panelNote}>
                See ingestion-style logs, canonical field mapping, plugin readiness (red / amber / green), third-party destinations, and illustrative ROI bands in one demo hub.
              </p>
              <Link to="/integrator?tab=pipeline" data-testid="developers-link-integrator-hub">
                Open Integrator hub →
              </Link>
              <p className={tstyles.panelNote} style={{ marginTop: 12 }}>
                Governance (Phase 4 mock):{" "}
                <Link to="/partners" data-testid="developers-link-partners">
                  Partners
                </Link>
                {" · "}
                <Link to="/trust" data-testid="developers-link-trust">
                  Trust
                </Link>
                {" · "}
                <Link to="/settings" data-testid="developers-link-settings">
                  Settings
                </Link>
              </p>
            </section>
            <section className={tstyles.card} aria-labelledby="wh-endpoints-h">
              <h2 id="wh-endpoints-h" className={tstyles.h2}>
                Webhook endpoints
              </h2>
              <p className={tstyles.panelNote}>
                Endpoints subscribe to events. The test console sends a preview payload to every subscribed endpoint.
              </p>

              {status === "loading" ? (
                <div data-testid="webhook-endpoints-table">
                  <DataTable
                    loading
                    loadingColSpan={5}
                    caption="Signing secrets are stored for this demo browser session only."
                    columns={[
                      { id: "url", header: "URL", cell: (r) => r.url },
                      { id: "events", header: "Events", cell: (r) => r.events.join(", ") },
                      { id: "secret", header: "Signing secret", cell: (r) => maskSigningSecret(r.signingSecret) },
                      { id: "created", header: "Created", cell: (r) => new Date(r.createdAt).toLocaleString() },
                      { id: "actions", header: "", cell: () => null },
                    ]}
                    rows={[]}
                  />
                </div>
              ) : endpoints.length === 0 ? (
                <EmptyState
                  analyticsId="webhook-endpoints-empty"
                  title="No webhook endpoints yet"
                  body="Add a receiver URL and choose which events should receive test deliveries. Signing secrets stay in this browser for the demo session only."
                  primaryCta={{ label: "Add webhook endpoint", action: "add_webhook" }}
                  onPrimary={() => openEndpointDialog()}
                />
              ) : (
                <div data-testid="webhook-endpoints-table">
                  <DataTable
                    loading={false}
                    loadingColSpan={5}
                    caption="Signing secrets are stored for this demo browser session only."
                    columns={[
                      { id: "url", header: "URL", cell: (r) => r.url },
                      { id: "events", header: "Events", cell: (r) => r.events.join(", ") },
                      { id: "secret", header: "Signing secret", cell: (r) => maskSigningSecret(r.signingSecret) },
                      { id: "created", header: "Created", cell: (r) => new Date(r.createdAt).toLocaleString() },
                      {
                        id: "actions",
                        header: "",
                        cell: (r) => (
                          <div className={tstyles.rowActions}>
                            <button type="button" className={dlg.btn} onClick={() => setRevealEndpointId(r.id)}>
                              Reveal secret…
                            </button>
                            <button type="button" className={dlg.btn} onClick={() => setDeleteEndpointId(r.id)}>
                              Delete
                            </button>
                          </div>
                        ),
                      },
                    ]}
                    rows={endpoints}
                  />
                </div>
              )}
            </section>

            <section className={tstyles.card} aria-labelledby="wh-test-h">
              <h2 id="wh-test-h" className={tstyles.h2}>
                Webhook test console
              </h2>
              {testError ? (
                <p className={tstyles.error} role="alert">
                  {testError}
                </p>
              ) : null}
              <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
                <label className={tstyles.panelNote} htmlFor="wh-test-event" style={{ margin: 0 }}>
                  Event
                </label>
                <select
                  id="wh-test-event"
                  value={testEvent}
                  disabled={filtersDisabled}
                  onChange={(e) => setTestEvent(e.target.value as WebhookTestEventName)}
                >
                  {WEBHOOK_TEST_EVENTS.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
                <div>
                  <div className={tstyles.panelNote} style={{ marginBottom: 8 }}>
                    Payload preview (always redacts restricted fields)
                  </div>
                  <pre className={tstyles.mono} data-testid="webhook-payload-preview">
                    {buildWebhookPayloadPreview(testEvent)}
                  </pre>
                </div>
                <button type="button" className={`${dlg.btn} ${dlg.primary}`} disabled={filtersDisabled} onClick={sendWebhookTest}>
                  Send test delivery
                </button>
                {logsAttention && tab === "integrations" ? (
                  <p className={tstyles.panelNote} role="status" data-testid="delivery-hint-open-logs" style={{ marginTop: 4 }}>
                    New failed deliveries recorded. Open the <strong>Logs</strong> tab to review attempts and retry.
                  </p>
                ) : null}
              </div>
            </section>

            <section className={tstyles.card} aria-labelledby="oauth-h">
              <h2 id="oauth-h" className={tstyles.h2}>
                OAuth clients
              </h2>
              <EmptyState
                analyticsId="oauth-clients-stub"
                title="OAuth clients ship next"
                body="This panel reserves space for client credentials, redirect URIs, and rotation workflows. Hook points will align to `specs/openapi/control-plane.yaml`."
                announce={false}
              />
            </section>
          </>
        ) : null}

        {tab === "logs" ? (
          <>
            <div className={tstyles.logsToolbar}>
              <div className={tstyles.logsToolbarFilters}>
                <FilterBar
                  analyticsId="developers_delivery_logs"
                  disabled={filtersDisabled}
                  showClearButton={!deliveryFilterEmpty}
                  selects={[
                    {
                      param: "deliveryStatus",
                      label: "Status",
                      allLabel: "All",
                      options: [
                        { value: "failed", label: "failed" },
                        { value: "delivered", label: "delivered" },
                        { value: "retrying", label: "retrying" },
                      ],
                    },
                    {
                      param: "deliveryEvent",
                      label: "Event",
                      allLabel: "All",
                      options: WEBHOOK_TEST_EVENTS,
                    },
                    {
                      param: "deliveryEndpoint",
                      label: "Endpoint",
                      allLabel: "All",
                      options: endpoints.map((e) => ({ value: e.id, label: e.url })),
                    },
                  ]}
                />
              </div>
              <button
                type="button"
                className={dlg.btn}
                disabled={filtersDisabled}
                data-testid="developers-copy-logs-filter-url"
                onClick={() => void copyFilteredLogsUrl()}
              >
                Copy link to this view
              </button>
            </div>
            {copyLogsHint ? (
              <p className={tstyles.copyHint} role="status" data-testid="developers-copy-logs-hint">
                {copyLogsHint}
              </p>
            ) : null}

            {deliveryFilterEmpty ? (
              <EmptyState
                analyticsId="developers-delivery-filter-empty"
                title="No delivery rows match these filters"
                body="Clear filters to see the newest attempts first."
                primaryCta={{ label: "Clear filters", action: "clear_filters" }}
                onPrimary={() =>
                  navigate({
                    pathname: "/developers",
                    search: mergeSearchParams(searchParams, {
                      deliveryStatus: null,
                      deliveryEvent: null,
                      deliveryEndpoint: null,
                    }).toString(),
                  })
                }
              />
            ) : (
              <div data-testid="webhook-delivery-table">
              <DataTable
                loading={status === "loading"}
                loadingColSpan={6}
                caption="Retry simulates bounded attempts; production would enqueue worker jobs and surface request IDs."
                columns={[
                  { id: "at", header: "Time", cell: (r) => new Date(r.at).toLocaleString() },
                  { id: "endpoint", header: "Endpoint", cell: (r) => r.endpointUrl },
                  { id: "event", header: "Event", cell: (r) => r.event },
                  { id: "status", header: "Status", cell: (r) => r.status },
                  { id: "attempts", header: "Attempts", cell: (r) => r.attempts },
                  { id: "req", header: "Request ID", cell: (r) => r.requestId },
                  {
                    id: "actions",
                    header: "",
                    cell: (r: WebhookDeliveryLogRow) => (
                      <button
                        type="button"
                        className={dlg.btn}
                        disabled={r.status === "delivered" || r.attempts >= 4}
                        data-testid={`delivery-retry-${r.id}`}
                        onClick={() => retryDelivery(r.id)}
                      >
                        Retry
                      </button>
                    ),
                  },
                ]}
                rows={deliveryRows}
              />
              </div>
            )}
          </>
        ) : null}
      </PageFrame>

      {createKeyOpen ? (
        <div
          ref={createKeyOverlayRef}
          className={dlg.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby={keyTitleId}
          aria-describedby={keyBodyId}
          data-testid="create-api-key-dialog"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCreateKeyOpen(false);
          }}
        >
          <div className={dlg.dialog}>
            <h2 className={dlg.title} id={keyTitleId}>
              Create API key
            </h2>
            <p className={dlg.body} id={keyBodyId}>
              You will see the full secret exactly once. Copy it to a password manager before continuing.
            </p>
            <div className={dlg.panel}>
              <label className={dlg.body} htmlFor="api-key-label">
                Label
              </label>
              <input
                id="api-key-label"
                type="text"
                value={keyLabel}
                onChange={(e) => setKeyLabel(e.target.value)}
                style={{ width: "100%", marginTop: 8, marginBottom: 16 }}
              />
              <label className={dlg.body} htmlFor="api-key-type">
                Key type
              </label>
              <select
                id="api-key-type"
                value={keyType}
                onChange={(e) => setKeyType(e.target.value as ApiKeyRow["keyType"])}
                style={{ width: "100%", marginTop: 8 }}
              >
                <option value="server">server</option>
                <option value="readonly">readonly</option>
              </select>
            </div>
            <div className={dlg.actions}>
              <button type="button" className={dlg.btn} onClick={() => setCreateKeyOpen(false)}>
                Cancel
              </button>
              <button type="button" className={`${dlg.btn} ${dlg.primary}`} onClick={generateApiKey}>
                Generate key
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {revealApiSecret ? (
        <div
          ref={apiRevealOverlayRef}
          className={dlg.overlay}
          role="dialog"
          aria-modal="true"
          data-testid="api-key-reveal-dialog"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) finishApiKeyReveal();
          }}
        >
          <div className={dlg.dialog}>
            <h2 className={dlg.title}>Your new API key</h2>
            <p className={dlg.body}>Copy this value now. For security it will not be shown again.</p>
            <div className={dlg.panel}>
              <code data-testid="api-key-secret-value" style={{ wordBreak: "break-all" }}>
                {revealApiSecret}
              </code>
            </div>
            <div className={dlg.actions}>
              <button type="button" className={`${dlg.btn} ${dlg.primary}`} onClick={finishApiKeyReveal}>
                I have stored this key
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {endpointDialogOpen ? (
        <div
          ref={endpointDialogOverlayRef}
          className={dlg.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby={epTitleId}
          aria-describedby={epBodyId}
          data-testid="create-webhook-endpoint-dialog"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEndpointDialogOpen(false);
          }}
        >
          <div className={dlg.dialog}>
            <h2 className={dlg.title} id={epTitleId}>
              Add webhook endpoint
            </h2>
            <p className={dlg.body} id={epBodyId}>
              Paste a receiver URL and choose which events should fan out to it during tests.
            </p>
            <div className={dlg.panel}>
              <label className={dlg.body} htmlFor="wh-endpoint-url">
                Endpoint URL
              </label>
              <input
                id="wh-endpoint-url"
                type="url"
                inputMode="url"
                placeholder="https://example.com/webhooks/hypegamer"
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                style={{ width: "100%", marginTop: 8, marginBottom: 16 }}
              />
              <fieldset className={tstyles.eventFieldset} data-testid="webhook-endpoint-events-fieldset">
                <legend className={tstyles.eventLegend}>Subscribed events</legend>
                <div className={tstyles.eventCheckboxGrid}>
                  {WEBHOOK_TEST_EVENTS.map((ev) => (
                    <label key={ev.value} className={tstyles.eventCheckboxRow}>
                      <input
                        type="checkbox"
                        checked={endpointEvents.includes(ev.value)}
                        onChange={(e) => toggleEndpointEvent(ev.value, e.target.checked)}
                        aria-label={`Subscribe to ${ev.label}`}
                        data-testid={`webhook-endpoint-event-${ev.value}`}
                      />
                      <span>{ev.label}</span>
                    </label>
                  ))}
                </div>
                <div className={tstyles.eventActions}>
                  <button type="button" className={dlg.btn} onClick={() => setEndpointEvents([...WEBHOOK_TEST_EVENT_VALUES])}>
                    Select all test events
                  </button>
                  <button type="button" className={dlg.btn} onClick={() => setEndpointEvents([])}>
                    Clear all
                  </button>
                </div>
              </fieldset>
            </div>
            <div className={dlg.actions}>
              <button type="button" className={dlg.btn} onClick={() => setEndpointDialogOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className={`${dlg.btn} ${dlg.primary}`}
                disabled={!endpointUrl.trim() || endpointEvents.length === 0}
                onClick={createEndpoint}
              >
                Create endpoint
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {revealSigningSecret ? (
        <div
          ref={signingRevealOverlayRef}
          className={dlg.overlay}
          role="dialog"
          aria-modal="true"
          data-testid="webhook-signing-secret-reveal-dialog"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) finishEndpointSecretReveal();
          }}
        >
          <div className={dlg.dialog}>
            <h2 className={dlg.title}>Webhook signing secret</h2>
            <p className={dlg.body}>Copy this signing secret now. The list view will stay masked afterward.</p>
            <div className={dlg.panel}>
              <code data-testid="webhook-signing-secret-value" className={tstyles.mono}>
                {revealSigningSecret}
              </code>
            </div>
            <div className={dlg.actions}>
              <button type="button" className={`${dlg.btn} ${dlg.primary}`} onClick={finishEndpointSecretReveal}>
                I have stored this signing secret
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={deleteEndpointId != null}
        title="Delete webhook endpoint?"
        body="This removes the endpoint and its delivery history from this demo browser session."
        confirmLabel="Delete endpoint"
        tone="danger"
        onCancel={() => setDeleteEndpointId(null)}
        onConfirm={() => {
          if (!deleteEndpointId) return;
          deleteWebhookEndpoint(deleteEndpointId);
          setDeleteEndpointId(null);
          setWebhookTick((t) => t + 1);
        }}
        testId="delete-webhook-endpoint-dialog"
      />

      <ConfirmDialog
        open={revealEndpointId != null}
        title="Reveal signing secret?"
        body="This is a demo-only convenience. In production, prefer a secret manager and never re-expose signing material."
        confirmLabel="Reveal"
        onCancel={() => setRevealEndpointId(null)}
        onConfirm={() => {
          if (!revealEndpointId) return;
          setSigningRevealEndpointId(revealEndpointId);
          setRevealEndpointId(null);
          setSigningRevealOpen(true);
        }}
        testId="reveal-webhook-signing-secret-confirm"
      />

      {signingRevealOpen ? (
        <div
          ref={signingRerevealOverlayRef}
          className={dlg.overlay}
          role="dialog"
          aria-modal="true"
          data-testid="webhook-signing-secret-rereveal-dialog"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSigningRevealOpen(false);
              setSigningRevealEndpointId(null);
            }
          }}
        >
          <div className={dlg.dialog}>
            <h2 className={dlg.title}>Signing secret</h2>
            <p className={dlg.body}>Stored locally for this demo session.</p>
            <div className={dlg.panel}>
              <code className={tstyles.mono} data-testid="webhook-signing-secret-rereveal-value">
                {signingRevealEndpointId
                  ? readWebhookEndpoints().find((e) => e.id === signingRevealEndpointId)?.signingSecret ?? ""
                  : ""}
              </code>
            </div>
            <div className={dlg.actions}>
              <button
                type="button"
                className={`${dlg.btn} ${dlg.primary}`}
                onClick={() => {
                  setSigningRevealOpen(false);
                  setSigningRevealEndpointId(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </RouteViewRoot>
  );
}
