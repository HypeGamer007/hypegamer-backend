# Phase 1 QA checklist (operations)

Use with demo seeded (`hypegamer_demo_seeded=1`) unless testing empty flows. Items marked **(matrix)** are exercised selectively in Playwright (`authz-and-state-matrix`, list/detail specs), not necessarily every fixture on every route each run.

## Implemented in mock UI (verify in app + e2e)

- [x] Home command center: `view-status` ready without forcing `?fixture=loading`; cards + CTAs for demo off/on; quick links to Competitions / Matches / Sources when demo is on.
- [x] Competitions / Matches / Sources lists: filters sync to URL and survive refresh; clear / filter-empty restores rows; `FilterBar` disabled when route is loading, error, or global empty (no demo).
- [x] Row navigation: click opens correct detail URL; keyboard (Enter / Space) activates row where `DataTable` supports it.
- [x] `?fixture=loading` table skeleton; `?fixture=error` shows `ErrorPanel` with retry + request id when supplied **(matrix)**.
- [x] Sources list: deterministic **Freshness** cue from `lastSync` (fresh / stale / old).
- [x] Sources **Pause**: impact preview dialog; row does not navigate on pause action; `source_paused` telemetry with `impactedProductCount` on confirm.
- [x] List columns: explicit **sort** on operational lists where implemented (beyond filter + search).
- [x] Detail pages: breadcrumb `aria-label="Breadcrumb"`; list segment restores URL query after in-app navigation; session fallback for list query after full reload on detail **(matrix)**.
- [x] Unknown id (demo on): not-found empty state + back CTA respects stored list query when present **(matrix)**.
- [x] Demo off: load sandbox CTA seeds and reloads as designed.
- [x] Source detail: Freshness label from `lastSync`.
- [x] Trust / policy: `?fixture=partial` partial banner; `?fixture=restricted` restricted copy; `?fixture=denied` denied empty state **(matrix)**.
- [x] Telemetry (`track` / `window.__HG_TELEMETRY__`): `filter_applied` on filter changes; `competition_viewed` / `match_viewed` / `source_viewed` on successful detail views; `sandbox_seeded` includes `source` when seeding from supported entry points.

## Still mock-only / out of repo scope

- [ ] **Live API-backed** lists and detail (replace fixtures + `localStorage` with real `fetch` when backend is available).
- [ ] Expand **fixture × route** Playwright coverage so more combinations of the seven view states are asserted per path (see `docs/ROADMAP.md` Phase 0 gaps).
