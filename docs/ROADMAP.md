# Control plane UX — implementation roadmap

This file summarizes what exists in the repo today versus the phased PRD, so delivery stays aligned with contracts under `specs/` and QA lists under `docs/qa/acceptance-checklists/`.

## Legend

| Status | Meaning |
|--------|---------|
| **Shipped** | User-visible flow implemented with mocks/fixtures |
| **Partial** | Scaffold, URL/query contract, or e2e smoke only |
| **Planned** | Described in PRD / manifest / schemas; no UI yet |

---

## Phase 0 — Foundations

| Area | Status | Notes |
|------|--------|--------|
| App shell + primary nav | **Shipped** | Home, operational lists, Entities, Identity, Phase 3 modules, Setup |
| Setup checklist sidebar | **Shipped** | `localStorage` + `setupEvents` |
| Onboarding wizard | **Shipped** | Rail, env choice, connect substeps, demo seed, skip |
| Root redirect | **Shipped** | `/` → `/onboarding` or `/home` |
| View states (loading / ready / empty / partial / error / restricted / denied) | **Partial** | `?fixture=` + `RouteViewRoot`; matrix coverage grows per route in e2e |
| Telemetry shim | **Shipped** | `track()` + `window.__HG_TELEMETRY__`; taxonomy in `docs/analytics/events.yaml` |
| `workspace_opened` | **Shipped** | Once per AppShell mount |
| `sandbox_seeded` | **Shipped** | `seedDemoWorkspace()` centralizes seed + event |
| `permission_denied_viewed` | **Shipped** | When `PermissionGate` renders denied |

**Gaps:** Full keyboard / focus matrix (drawers, dialogs, nested overlays) not exhaustively audited; not every scaffolded route is exercised under all seven fixtures in CI yet.

---

## Phase 1 — Operations (lists + detail)

| Area | Status | Notes |
|------|--------|--------|
| Home command center | **Shipped** | Cards, empty states, quick links when demo seeded |
| Competitions / Matches / Sources lists | **Shipped** | `DataTable`, `FilterBar`, URL-synced filters, filter-empty panel, explicit sort |
| Detail routes | **Shipped** | `/competitions/:id`, `/matches/:id`, `/sources/:id` |
| Breadcrumbs + back links | **Shipped** | List query preserved via `location.state` + `sessionStorage` fallback |
| Demo dataset | **Shipped** | `operational.demo.ts` |
| Detail telemetry | **Shipped** | `competition_viewed`, `match_viewed`, `source_viewed` |
| Source freshness + home summary | **Shipped** | Freshness buckets on home when demo seeded |
| Source pause + impact preview | **Shipped** | Dialog + `source_paused` telemetry + overrides |
| QA checklist | **Aligned** | `docs/qa/acceptance-checklists/phase-1.md` reflects shipped mock behavior vs legacy “not in scope” notes |

**Out of scope for this repo (ingestion):** Replacing mocks with live operational APIs is tracked as a backend / integration phase, not a control-plane UI gap.

---

## Phase 2 — Entities & identity

| Area | Status | Notes |
|------|--------|--------|
| `/entities`, `/entities/:entityId` | **Shipped** | List + detail, filters, sort, `RouteViewRoot`, demo fixtures |
| `/identity` | **Shipped** | Link/revoke demo, consent table, inline audit trail, telemetry |
| E2E | **Shipped** | `identity-and-skill.spec.ts` covers entities navigation, merge reviewer gates, skill/alias cues, identity flows |

**Production hardening (not end-to-end in mock):** Server-enforced merge authorization + immutable audit sink; real provider webhooks for linked-account status (see Phase 2 QA checklist).

---

## Phase 3 — Productization

| Area | Status | Notes |
|------|--------|--------|
| `/data-products` | **Shipped** | List, URL-synced filters, sort, empty + filter-empty, new draft dialog, `data_product_created`, demo + `localStorage` drafts; policy-oriented copy on drafts |
| `/widgets` | **Shipped** | List, sandbox/live preview toggle (copy/banner), publish confirm, `widget_published`, demo persistence |
| `/developers` | **Shipped** | **Keys:** filters, create API key, reveal-once, masked list, `api_key_created`. **Integrations:** webhook endpoints (checkbox event picker, signing secret flows, OAuth stub). **Logs:** delivery table, URL filters, retry simulation, copy link to filtered view, attention affordances. Route query contract in `docs/routes/route-manifest.json` (`tab`, keys + delivery params). Link to Integrator hub from Integrations. |
| `/integrator` | **Shipped** | **Integrator hub** (mock): tabbed journey **Connect** → **Pipeline log** (URL `logLevel` filter) → **Field map** (present/partial/missing + provenance copy) → **Readiness** (R/A/G counts) → **Plugins** (first-party + third-party rows, gaps, illustrative monthly bands) → **ROI** (conservative vs upside vs blocked). Fixture `specs/mocks/integrator-demo.json` + schema `specs/schemas/integrator-demo.schema.json`. Telemetry `integrator_hub_viewed`. |
| E2E | **Shipped** | `products-widgets-developers.spec.ts` + `integrator-hub.spec.ts` (hub tabs, pipeline filter URL, plugins/ROI, link from Developers). |

### Phase 3 — still to build or deepen (mock UI)

| Area | Status | Notes |
|------|--------|--------|
| Data product **policy matrix** + **conflict banners** | **Shipped (mock)** | Matrix table + alert when `ingestionTier=community` drafts exist; `tests/lib/dataProductPolicy.spec.ts` |
| Widget **embed preview** | **Partial** | Sandbox `iframe` + `srcDoc` fixture; restricted fixture withholds embed; no live CDN embed yet |
| Publish / unpublish vs **live policy** | **Partial** | Mock **live publish block** when backing product is community-tier; API-driven rules still future |
| **Telemetry assertions in e2e** | **Partial** | `tests/e2e/cross-cutting/telemetry-contract.spec.ts` + `npm run verify:telemetry` |
| Developers **production** | **Planned** | HMAC-signed delivery, durable logs, OAuth clients—current webhooks are **session-local demo** only |
| **Redaction proofs** | **Planned** | Fixture + tests ensuring restricted fields never leak in previews, logs, or docs when real payloads land |

---

## Integrator success & “network effect” demo (planned UX epic)

**Mock v1 shipped:** `/integrator` (Integrator hub) implements the tabbed journey below with deterministic fixtures—see Phase 3 table. Further work is **live** pipelines, expandable payloads, and telemetry assertions.

**Goal:** One **no-brainer** narrative for publishers and partners: connect → observe → qualify → monetize. UX stays **artifact-first** (contracts, fixtures, state matrix per `AGENTS.md`), with **red / amber / green** (and restricted/denied) semantics aligned to product truth—not decoration.

| Stage | Audience story | Control-plane direction (planned) |
|-------|----------------|-------------------------------------|
| **Connect** | “Plug in your SDK / pipeline.” | Guided connect (keys, env, scopes) tied to `specs/openapi/control-plane.yaml`; clear **mock vs production** boundaries. |
| **Observe** | “See your data land on our platform.” | **Ingestion / delivery log** screen: time-ordered events, request IDs, expandable payloads (redacted), link from Developers test console toward a **first-class pipeline** view when backend exists. |
| **Map** | “What do we have vs what’s missing?” | **Canonical mapping** UI: required fields / entities / consents for each product path; **have / gap** lists driving amber/red. |
| **Readiness** | “Are we good to go?” | **RAG-style readiness** (red / amber / green): blockers, policy-limited fields (`restricted`), and certified vs community separation per global rules. |
| **Plugins & ecosystem** | “Where does this data work?” | **Compatibility matrix:** plugins (widgets, exports, tournament tools) with **per-plugin qualification**—what data you have, what you’re missing to turn a plugin “green,” plus **third-party** destinations (orgs, organizers, external tools) as first-class rows, not an afterthought. |
| **Outcome** | “Why should I care?” | **Optional ROI / uplift** panel: illustrative estimates based on enabled plugins + reach (marketing-grade, clearly labeled **demo math** until real analytics exist). |

**UX principles for this epic:** Single primary path per screen; always show **provenance + freshness**; never conflate certified vs community; every heavy screen supports loading / ready / empty / partial / error / restricted / denied; prefer **one obvious next action** (e.g. “Fix 3 gaps to enable Widget X”).

This epic may span **new routes** or deepen Phase 3 modules; track in route manifest + analytics when routes are added.

---

## Phase 4 — Governance

| Area | Status | Notes |
|------|--------|--------|
| `/partners`, `/trust`, `/settings` | **Shipped** | Mock: `governance-demo` fixture + schema; grant matrix (approve/renew/revoke impact dialogs), trust queue (redacted evidence), settings (members + roles matrix, retention, notifications, IdP placeholder, **audit activity** table + filter + export safety); OpenAPI `/v1/governance/*` list stubs; `RouteViewRoot` + URL filters on partners/trust; nav + cross-links (Integrator, Developers, Widgets, Home) |
| E2E | **Shipped** | `partners-trust-settings.spec.ts` + authz matrix includes governance routes |

---

## Phase 5 — Hardening & rollout

| Area | Status | Notes |
|------|--------|--------|
| `/search` | **Partial (mock)** | Fixture `search-demo.json` + `SearchPage`; URL `q`; `search_run` telemetry; global nav |
| Notifications (mock) | **Partial** | Shell **Notifications** popover with demo deep links + `notification_opened`; no inbox backend |
| E2E | **Partial** | `search-notifications-rollout.spec.ts` (search + notifications + loading) |

---

## Telemetry & QA automation (cross-phase)

| Aspiration | Notes |
|------------|--------|
| **E2E telemetry snapshots** | **Partial:** `tests/e2e/cross-cutting/telemetry-contract.spec.ts` asserts `settings_retention_saved`, `trust_signal_reviewed`, `widget_published`; extend for onboarding / sources / developers when stable. |
| **Contract drift tests** | **Partial:** `npm run verify:telemetry` ensures every `src/` `track("…")` id exists in `docs/analytics/events.yaml`; `TelemetryEventName` in `src/lib/telemetry.ts` should match. OpenAPI ↔ route manifest drift still manual. |

---

## Suggested next build slices (ordered)

1. **Integrator hub — next depth (optional):** Wire **live** ingestion stream when API exists; per-row expand for payload JSON; `__HG_TELEMETRY__` assertions on `integrator_hub_viewed` + tab transitions; home-page CTA into the hub.
2. **Data products depth (optional):** Per-row policy editor + server-shaped validation; expand conflict rules beyond `ingestionTier` mock.
3. **Telemetry e2e:** Expand `telemetry-contract.spec.ts` to Phase 1 (`source_paused`, `filter_applied`) and Phase 3 Developers (`api_key_created`) where stable.
4. **Phase 4 depth (optional):** Full audit export UI, revocation cascade tests, live governance APIs when backend exists.
5. **Contract alignment:** OpenAPI examples under `specs/openapi` ↔ first real `fetch` client for one read-only endpoint when backend exists.

---

## Audit references

- Routes: `docs/routes/route-manifest.json`
- Events: `docs/analytics/events.yaml`
- QA gates: `docs/qa/acceptance-checklists/phase-*.md`
- JSON contracts: `specs/schemas/`, mocks: `specs/mocks/`
