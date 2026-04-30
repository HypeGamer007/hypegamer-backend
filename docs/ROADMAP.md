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
|------|--------|------|
| App shell + primary nav | **Shipped** | Home, operational lists, Entities, Identity, Phase 3 modules, Setup |
| Setup checklist sidebar | **Shipped** | `localStorage` + `setupEvents` |
| Onboarding wizard | **Shipped** | Rail, env choice, connect substeps, demo seed, skip |
| Root redirect | **Shipped** | `/` → `/onboarding` or `/home` |
| View states (loading / empty / error / partial / restricted / denied) | **Partial** | `?fixture=` + `RouteViewRoot`; matrix coverage grows per route in e2e |
| Telemetry shim | **Shipped** | `track()` + `window.__HG_TELEMETRY__`; taxonomy in `docs/analytics/events.yaml` |
| `workspace_opened` | **Shipped** | Once per AppShell mount |
| `sandbox_seeded` | **Shipped** | `seedDemoWorkspace()` centralizes seed + event |
| `permission_denied_viewed` | **Shipped** | When `PermissionGate` renders denied |

**Gaps:** Full keyboard matrix (drawers/dialogs) not exhaustively audited; not every scaffolded route is exercised under all seven fixtures in CI yet.

---

## Phase 1 — Operations (lists + detail)

| Area | Status | Notes |
|------|--------|------|
| Home command center | **Shipped** | Cards, empty states, quick links when demo seeded |
| Competitions / Matches / Sources lists | **Shipped** | `DataTable`, `FilterBar`, URL-synced filters, filter-empty panel, explicit sort |
| Detail routes | **Shipped** | `/competitions/:id`, `/matches/:id`, `/sources/:id` |
| Breadcrumbs + back links | **Shipped** | List query preserved via `location.state` + `sessionStorage` fallback |
| Demo dataset | **Shipped** | `operational.demo.ts` |
| Detail telemetry | **Shipped** | `competition_viewed`, `match_viewed`, `source_viewed` |
| Source freshness + home summary | **Shipped** | Freshness buckets on home when demo seeded |
| Source pause + impact preview | **Shipped** | Dialog + `source_paused` telemetry + overrides |

---

## Phase 2 — Entities & identity

| Area | Status | Notes |
|------|--------|------|
| `/entities`, `/entities/:entityId` | **Shipped** | List + detail, filters, sort, `RouteViewRoot`, demo fixtures |
| `/identity` | **Shipped** | Link/revoke demo, consent table, telemetry |
| E2E | **Shipped** | `identity-and-skill.spec.ts` covers entities navigation + identity flows |

---

## Phase 3 — Productization

| Area | Status | Notes |
|------|--------|------|
| `/data-products` | **Shipped** | List, filters, new draft dialog, `data_product_created`, demo + `localStorage` drafts |
| `/widgets` | **Shipped** | List, sandbox/live preview toggle, publish confirm, `widget_published` |
| `/developers` | **Shipped** | Keys table, create + reveal-once, masked storage, `api_key_created` |
| E2E | **Partial** | Smoke on list routes; full Phase 3 QA checklist items (webhooks, policy matrix) still future |

---

## Phase 4 — Governance

| Area | Status | Notes |
|------|--------|------|
| `/partners`, `/trust`, `/settings` | **Planned** | Manifest |
| E2E placeholder | **Partial** | `partners-trust-settings.spec.ts` |

---

## Phase 5 — Hardening & rollout

| Area | Status | Notes |
|------|--------|------|
| `/search` | **Planned** | Manifest |
| E2E placeholder | **Partial** | `search-notifications-rollout.spec.ts` |

---

## Suggested next build slices (ordered)

1. **Phase 3 depth:** webhook delivery logs UI, stricter invalid product/source blocking, automated tests for telemetry payloads on Phase 3 actions.
2. **Phase 4 slice 1:** `/partners` list + permission matrix reusing `RouteViewRoot`.
3. **Contract alignment:** OpenAPI examples under `specs/openapi` ↔ first real `fetch` client for one read-only endpoint (when backend exists).

---

## Audit references

- Routes: `docs/routes/route-manifest.json`
- Events: `docs/analytics/events.yaml`
- QA gates: `docs/qa/acceptance-checklists/phase-*.md`
- JSON contracts: `specs/schemas/`, mocks: `specs/mocks/`
