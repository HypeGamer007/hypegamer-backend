import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/empty-state/EmptyState";
import { EnvironmentBadge } from "@/components/entity/EnvironmentBadge";
import { FilterBar } from "@/components/filters/FilterBar";
import { PageFrame } from "@/components/layout/PageFrame";
import { DataTable } from "@/components/patterns/DataTable";
import { RouteViewRoot } from "@/components/state/RouteViewRoot";
import { useDemoSeeded } from "@/hooks/useDemoSeeded";
import { useRouteFixture } from "@/hooks/useRouteFixture";
import { resolveListRouteStatus } from "@/lib/resolveListRouteStatus";
import { seedDemoWorkspace } from "@/lib/seedDemoWorkspace";
import { emitSetupChanged } from "@/lib/setupEvents";
import { STORAGE_INTEGRATOR_HUB_VISITED } from "@/lib/storageKeys";
import { mergeSearchParams } from "@/lib/searchParams";
import { track } from "@/lib/telemetry";
import {
  INTEGRATOR_DEMO,
  buildPipelinePayloadPreview,
  formatUsd,
  type IntegratorPluginRow,
  type IntegratorPipelineEvent,
  type MappingStatus,
  type ReadinessRag,
} from "@/mocks/integrator.demo";
import styles from "@/pages/IntegratorPage.module.css";

type IntegratorTab = "connect" | "pipeline" | "mapping" | "readiness" | "plugins" | "roi";

function parseTab(raw: string | null): IntegratorTab {
  if (raw === "connect" || raw === "pipeline" || raw === "mapping" || raw === "readiness" || raw === "plugins" || raw === "roi") {
    return raw;
  }
  return "connect";
}

function kindLabel(kind: IntegratorPluginRow["kind"]): string {
  switch (kind) {
    case "widget":
      return "Widget";
    case "export":
      return "Export";
    case "tournament_tool":
      return "Tournament tool";
    case "broadcast_partner":
      return "Broadcast partner";
    default:
      return kind;
  }
}

function mappingStatusLabel(s: MappingStatus): string {
  switch (s) {
    case "present":
      return "Present";
    case "partial":
      return "Partial";
    case "missing":
      return "Missing";
    default:
      return s;
  }
}

function ragBadgeClass(r: ReadinessRag): string {
  if (r === "green") return styles.badgeGreen;
  if (r === "amber") return styles.badgeAmber;
  return styles.badgeRed;
}

function mappingToRag(s: MappingStatus): ReadinessRag {
  if (s === "present") return "green";
  if (s === "partial") return "amber";
  return "red";
}

function ragStatClass(r: "green" | "amber" | "red"): string {
  if (r === "green") return `${styles.ragStat} ${styles.ragGreen}`;
  if (r === "amber") return `${styles.ragStat} ${styles.ragAmber}`;
  return `${styles.ragStat} ${styles.ragRed}`;
}

export function IntegratorPage() {
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
        pathname: "/integrator",
        search: mergeSearchParams(searchParams, { tab: "connect" }).toString(),
      },
      { replace: true },
    );
  }, [navigate, searchParams]);

  const logLevel = searchParams.get("logLevel") ?? "";

  const pipelineRows = useMemo(() => {
    const base = INTEGRATOR_DEMO.pipelineEvents;
    if (!logLevel) return base;
    return base.filter((e) => e.level === logLevel);
  }, [logLevel]);

  const roiStats = useMemo(() => {
    const plugins = INTEGRATOR_DEMO.plugins;
    const greens = plugins.filter((p) => p.readiness === "green");
    const greensAndAmber = plugins.filter((p) => p.readiness === "green" || p.readiness === "amber");
    const sum = (rows: IntegratorPluginRow[]) =>
      rows.reduce(
        (acc, p) => {
          acc.low += p.upliftLowUsd;
          acc.high += p.upliftHighUsd;
          return acc;
        },
        { low: 0, high: 0 },
      );
    return {
      conservative: sum(greens),
      upside: sum(greensAndAmber),
      redBlocked: plugins.filter((p) => p.readiness === "red").length,
    };
  }, []);

  const filtersDisabled = status === "loading" || status === "error" || status === "empty";
  const pipelineFilterEmpty =
    demoSeeded && (status === "ready" || status === "partial") && tab === "pipeline" && pipelineRows.length === 0 && Boolean(logLevel);

  useEffect(() => {
    track("integrator_hub_viewed", {
      section: tab,
      demoSeeded,
      fixture: fx.rawFixture ?? "default",
    });
  }, [tab, demoSeeded, fx.rawFixture]);

  useEffect(() => {
    if (status === "ready" || status === "partial") {
      localStorage.setItem(STORAGE_INTEGRATOR_HUB_VISITED, "1");
      emitSetupChanged();
    }
  }, [status]);

  const setTab = (next: IntegratorTab) => {
    navigate({
      pathname: "/integrator",
      search: mergeSearchParams(searchParams, { tab: next }).toString(),
    });
  };

  const partialBanner =
    fx.rawFixture === "partial"
      ? "Some plugin eligibility signals may be truncated for viewers under policy."
      : undefined;

  const descriptionByTab: Record<IntegratorTab, string> = {
    connect: "Keys, webhooks, and entry points to move data into the control plane (mock UI).",
    pipeline: "Normalized ingestion log: SDK batches, mapping, consent, and partner queues (deterministic demo).",
    mapping: "Canonical field requirements and what is present, partial, or missing — never conflate certified vs community.",
    readiness: "Red / amber / green summary across plugins and third-party destinations.",
    plugins: "First-party widgets, exports, tournament tools, and broadcast partners with explicit gaps to go green.",
    roi: "Illustrative monthly uplift bands from enabled plugins — labeled demo math only.",
  };

  return (
    <RouteViewRoot
      gateAnalyticsId="integrator"
      status={status}
      permissions={fx.permissions}
      restricted={fx.restricted}
      requestId={fx.requestId}
      onRetry={() => window.location.reload()}
      partialBanner={partialBanner}
      empty={{
        analyticsId: "integrator-empty",
        title: "Integrator hub needs sandbox data",
        body: "Load demo fixtures to walk the connect → pipeline → plugins journey with deterministic logs and readiness.",
        primaryCta: { label: "Load sandbox data", action: "load_sandbox" },
        secondaryCta: { label: "Back to Home", action: "goto_home" },
        onPrimary: () => {
          seedDemoWorkspace("integrator_empty");
          window.location.assign("/integrator?tab=connect");
        },
        onSecondary: () => navigate("/home"),
      }}
    >
      <PageFrame
        pageTestId="integrator-page"
        title="Integrator hub"
        description={descriptionByTab[tab]}
        badges={<EnvironmentBadge />}
      >
        <p className={styles.panelNote} data-testid="integrator-mock-banner">
          {INTEGRATOR_DEMO.demoDisclaimer}
        </p>

        <div className={styles.tabList} role="tablist" aria-label="Integrator journey">
          {(
            [
              ["connect", "Connect"],
              ["pipeline", "Pipeline log"],
              ["mapping", "Field map"],
              ["readiness", "Readiness"],
              ["plugins", "Plugins"],
              ["roi", "ROI"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`${styles.tab} ${tab === id ? styles.tabActive : ""}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "connect" ? (
          <section className={styles.card} aria-labelledby="int-connect-h">
            <h2 id="int-connect-h" className={styles.h2}>
              Connect your pipeline
            </h2>
            <p className={styles.panelNote}>
              Production would issue scoped keys, rotate secrets, and bind environments. Here, links jump to the mocked control-plane modules.
            </p>
            <div className={styles.connectGrid}>
              <div className={styles.connectCard}>
                <h3>API keys</h3>
                <p>Create server or read-only keys with reveal-once handling.</p>
                <Link to="/developers?tab=keys" data-testid="integrator-link-keys">
                  Open Keys →
                </Link>
              </div>
              <div className={styles.connectCard}>
                <h3>Webhooks & delivery</h3>
                <p>Subscribe endpoints, run the test console, and inspect delivery logs.</p>
                <Link to="/developers?tab=integrations" data-testid="integrator-link-integrations">
                  Open Integrations →
                </Link>
              </div>
              <div className={styles.connectCard}>
                <h3>Data products</h3>
                <p>Drafts and published extracts that feed widgets and exports.</p>
                <Link to="/data-products" data-testid="integrator-link-data-products">
                  Open Data products →
                </Link>
              </div>
              <div className={styles.connectCard}>
                <h3>Widgets</h3>
                <p>Publish overlays when readiness allows (policy still applies in live).</p>
                <Link to="/widgets" data-testid="integrator-link-widgets">
                  Open Widgets →
                </Link>
              </div>
              <div className={styles.connectCard}>
                <h3>Partners & trust</h3>
                <p>Grant matrix, integrity signals, and workspace policy (Phase 4 governance mock).</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Link to="/partners" data-testid="integrator-link-partners">
                    Partners →
                  </Link>
                  <Link to="/trust" data-testid="integrator-link-trust">
                    Trust →
                  </Link>
                  <Link to="/settings" data-testid="integrator-link-settings">
                    Settings →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {tab === "pipeline" ? (
          <section className={styles.card} aria-labelledby="int-pipe-h">
            <h2 id="int-pipe-h" className={styles.h2}>
              Ingestion & mapping log
            </h2>
            <p className={styles.panelNote}>
              Newest events first. Channels mirror a future observability contract; payloads stay summarized here (no restricted literals in the table).
            </p>
            <FilterBar
              analyticsId="integrator_pipeline"
              disabled={filtersDisabled}
              showClearButton={!pipelineFilterEmpty}
              filterParamKeys={["logLevel"]}
              selects={[
                {
                  param: "logLevel",
                  label: "Level",
                  allLabel: "All",
                  options: [
                    { value: "info", label: "info" },
                    { value: "warn", label: "warn" },
                    { value: "error", label: "error" },
                  ],
                },
              ]}
            />
            {pipelineFilterEmpty ? (
              <EmptyState
                analyticsId="integrator-pipeline-filter-empty"
                title="No events at this level"
                body="Clear the level filter to see all demo pipeline rows."
                primaryCta={{ label: "Clear level filter", action: "clear_log_level" }}
                onPrimary={() =>
                  navigate({
                    pathname: "/integrator",
                    search: mergeSearchParams(searchParams, { logLevel: null }).toString(),
                  })
                }
              />
            ) : (
              <div data-testid="integrator-pipeline-table">
                <DataTable<IntegratorPipelineEvent>
                  loading={status === "loading"}
                  loadingColSpan={6}
                  caption="Fixture source: specs/mocks/integrator-demo.json"
                  columns={[
                    { id: "at", header: "Time", cell: (r) => new Date(r.at).toLocaleString() },
                    { id: "level", header: "Level", cell: (r) => r.level },
                    { id: "channel", header: "Channel", cell: (r) => <span className={styles.mono}>{r.channel}</span> },
                    { id: "message", header: "Message", cell: (r) => r.message },
                    { id: "req", header: "Request ID", cell: (r) => r.requestId ?? "—" },
                    {
                      id: "payload",
                      header: "Payload",
                      cell: (r) => (
                        <details className={styles.payloadDetails} data-testid={`integrator-pipeline-payload-${r.id}`}>
                          <summary className={styles.payloadSummary}>Preview</summary>
                          <pre className={styles.payloadPre} tabIndex={0}>
                            {buildPipelinePayloadPreview(r)}
                          </pre>
                        </details>
                      ),
                    },
                  ]}
                  rows={pipelineRows}
                />
              </div>
            )}
          </section>
        ) : null}

        {tab === "mapping" ? (
          <section className={styles.card} aria-labelledby="int-map-h">
            <h2 id="int-map-h" className={styles.h2}>
              Canonical field map
            </h2>
            <p className={styles.panelNote}>
              Status uses present / partial / missing. Partial rows still surface provenance so certified data is never visually conflated with community sources.
            </p>
            <div data-testid="integrator-mapping-table">
              <DataTable
                loading={status === "loading"}
                loadingColSpan={4}
                caption="Mapping contract aligns to future schemas under specs/schemas."
                columns={[
                  { id: "label", header: "Requirement", cell: (r) => r.label },
                  { id: "cat", header: "Category", cell: (r) => r.category },
                  {
                    id: "status",
                    header: "Status",
                    cell: (r) => (
                      <span className={ragBadgeClass(mappingToRag(r.status))}>{mappingStatusLabel(r.status)}</span>
                    ),
                  },
                  { id: "note", header: "Provenance & notes", cell: (r) => r.provenanceNote },
                ]}
                rows={INTEGRATOR_DEMO.mappingRequirements}
              />
            </div>
          </section>
        ) : null}

        {tab === "readiness" ? (
          <section className={styles.card} aria-labelledby="int-ready-h">
            <h2 id="int-ready-h" className={styles.h2}>
              Readiness overview
            </h2>
            <p className={styles.panelNote}>{INTEGRATOR_DEMO.readinessSummary.headline}</p>
            <div className={styles.ragRow} data-testid="integrator-readiness-stats">
              <div className={ragStatClass("green")}>
                <strong>{INTEGRATOR_DEMO.readinessSummary.green}</strong>
                <span>Green plugins</span>
              </div>
              <div className={ragStatClass("amber")}>
                <strong>{INTEGRATOR_DEMO.readinessSummary.amber}</strong>
                <span>Amber (policy overlays)</span>
              </div>
              <div className={ragStatClass("red")}>
                <strong>{INTEGRATOR_DEMO.readinessSummary.red}</strong>
                <span>Red (blocked)</span>
              </div>
            </div>
            <p className={styles.panelNote}>
              <strong>Red</strong> means a hard blocker (credentials, certified source). <strong>Amber</strong> means you can ship with restrictions or silhouettes.
              <strong> Green</strong> means all stated requirements for that plugin path are satisfied in this demo fixture.
            </p>
          </section>
        ) : null}

        {tab === "plugins" ? (
          <section className={styles.card} aria-labelledby="int-plug-h">
            <h2 id="int-plug-h" className={styles.h2}>
              Plugins & third-party destinations
            </h2>
            <p className={styles.panelNote}>
              Each row lists what is still missing to reach <strong>green</strong>. Third-party tools use the same matrix so partners see qualification gaps upfront.
            </p>
            <div data-testid="integrator-plugins-table">
              <DataTable<IntegratorPluginRow>
                loading={status === "loading"}
                loadingColSpan={6}
                caption="Uplift columns are illustrative USD / month bands for demos only."
                columns={[
                  { id: "name", header: "Integration", cell: (r) => r.name },
                  { id: "kind", header: "Type", cell: (r) => kindLabel(r.kind) },
                  { id: "partner", header: "Partner", cell: (r) => r.partnerName ?? "—" },
                  {
                    id: "readiness",
                    header: "Readiness",
                    cell: (r) => (
                      <span className={ragBadgeClass(r.readiness)} data-testid={`integrator-plugin-rag-${r.id}`}>
                        {r.readiness}
                      </span>
                    ),
                  },
                  {
                    id: "missing",
                    header: "Missing for green",
                    cell: (r) => (r.missingForGreen.length ? r.missingForGreen.join("; ") : "—"),
                  },
                  {
                    id: "uplift",
                    header: "Est. monthly",
                    cell: (r) =>
                      r.readiness === "red"
                        ? "—"
                        : `${formatUsd(r.upliftLowUsd)} – ${formatUsd(r.upliftHighUsd)}`,
                  },
                ]}
                rows={INTEGRATOR_DEMO.plugins}
              />
            </div>
          </section>
        ) : null}

        {tab === "roi" ? (
          <section className={styles.card} aria-labelledby="int-roi-h">
            <h2 id="int-roi-h" className={styles.h2}>
              {INTEGRATOR_DEMO.roiNarrative.title}
            </h2>
            <p className={styles.panelNote}>{INTEGRATOR_DEMO.roiNarrative.body}</p>
            <div className={styles.roiPanel} data-testid="integrator-roi-panel">
              <p className={styles.panelNote} style={{ marginTop: 0 }}>
                {INTEGRATOR_DEMO.roiNarrative.methodology}
              </p>
              <div className={styles.roiGrid}>
                <div className={styles.roiCell}>
                  <dl>
                    <dt>Conservative (green only)</dt>
                    <dd data-testid="integrator-roi-conservative">
                      {formatUsd(roiStats.conservative.low)} – {formatUsd(roiStats.conservative.high)} / mo
                    </dd>
                  </dl>
                </div>
                <div className={styles.roiCell}>
                  <dl>
                    <dt>Upside (green + amber with overlays)</dt>
                    <dd data-testid="integrator-roi-upside">
                      {formatUsd(roiStats.upside.low)} – {formatUsd(roiStats.upside.high)} / mo
                    </dd>
                  </dl>
                </div>
                <div className={styles.roiCell}>
                  <dl>
                    <dt>Blocked integrations</dt>
                    <dd data-testid="integrator-roi-blocked">{roiStats.redBlocked}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </PageFrame>
    </RouteViewRoot>
  );
}
