# Phase 3 QA Checklist

## Shipped in mock UI (verify manually / e2e)

- [x] Data products list with URL-synced filters and explicit sort; empty + filter-empty panels; new draft flow with `data_product_created` telemetry.
- [x] Data products **policy matrix** (read-only table) + **conflict banner** when community-tier drafts exist (`ingestionTier` on fixture rows).
- [x] Widgets list with sandbox vs live **preview mode** toggle (copy/banner only; no real network split).
- [x] Widget **sandbox iframe embed preview** (fixture HTML); **restricted** fixture withholds iframe and marker string (`tests/e2e/phase-3/products-widgets-developers.spec.ts`).
- [x] **Live publish policy gate**: community-backed data products block live draft publish with explicit dialog (mock); sandbox publish still succeeds via **Scaffold ticker** row.
- [x] Publish draft widget → confirm dialog → `widget_published` + persisted “published” state (demo `localStorage`).
- [x] Developers: create API key → full secret shown **once** → list stores **masked** secret only + `api_key_created`.
- [x] Developers: tabbed **Keys / Integrations / Logs** with default `tab=integrations`; URL-synced delivery log filters (`deliveryStatus`, `deliveryEvent`, `deliveryEndpoint`).
- [x] Webhook endpoints (local demo persistence) + checkbox event picker (select all / clear all) + signing secret reveal-once + confirm + re-reveal dialog (e2e asserts re-reveal shows full secret).
- [x] Empty webhook endpoints panel uses dedicated empty state + CTA (distinct from header action; e2e covers both).
- [x] Webhook test console fans out to subscribed endpoints; blocks when none subscribe; payload preview redacts `restrictedField`.
- [x] After test send: **Logs** tab shows attention badge + status hint until Logs is opened.
- [x] Delivery logs newest-first; **Retry** simulates fail-then-deliver; retry disabled at max attempts / after delivered; **Copy link to this view** for shareable filtered URLs.
- [x] `docs/routes/route-manifest.json` documents Developers `searchParams` contract (`tab`, keys filters, delivery filters).
- [x] Modal focus: Tab trap + Escape + restore focus for `ConfirmDialog` and Developers custom overlays (`useDialogFocusTrap`).
- [x] OAuth clients panel stub (empty state) under Integrations.
- [x] **Integrator hub** (`/integrator`): Connect → Pipeline log (`logLevel` URL filter) → Field map → Readiness (R/A/G) → Plugins & partners → ROI (demo bands); fixtures `specs/mocks/integrator-demo.json`; cross-link from Developers → Integrations; e2e `integrator-hub.spec.ts`.

## Not yet in mock UI (keep for backend / hardening phases)

- [x] Cross-phase: assert `window.__HG_TELEMETRY__` for key events (`tests/e2e/cross-cutting/telemetry-contract.spec.ts`) + `npm run verify:telemetry` (track ids ⊆ `docs/analytics/events.yaml`).
- [ ] Data-product builder blocks invalid combinations **server-side** (client today: matrix + banner + live widget gate only).
- [ ] Widget preview **live network** / real embed host parity beyond sandbox iframe fixture.
- [ ] Publish/unpublish workflows reflect **live** policy restrictions from API (beyond static product tier mock).
- [ ] Real webhook delivery workers, HMAC signatures, and durable log APIs (UI is mocked only).
- [ ] Redaction **proofs** against real payloads in previews, logs, and OpenAPI examples (restricted fixture test covers demo marker only).

**Planned integrator narrative** (SDK → logs → mapping → plugin matrix → ROI framing) is captured in `docs/ROADMAP.md` under **Integrator success & “network effect” demo**; track new routes and analytics there when implemented.
