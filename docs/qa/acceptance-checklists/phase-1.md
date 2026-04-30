# Phase 1 QA checklist (operations)

Use with demo seeded (`hypegamer_demo_seeded=1`) unless testing empty flows.

## Home

- [ ] Command center loads (`view-status` ready) without `?fixture=loading` default.
- [ ] With demo off: each card shows reason + primary (or secondary) CTA; CTAs route or reload as designed.
- [ ] With demo on: quick links reach Competitions / Matches / Sources.

## Lists (Competitions, Matches, Sources)

- [ ] Filters sync to URL; refresh preserves filters.
- [ ] Clear filters / filter-empty empty state restores rows when appropriate.
- [ ] `FilterBar` disabled when route status is loading, error, or global empty (no demo).
- [ ] Row click opens correct detail URL; keyboard (Enter / Space) activates row.
- [ ] `?fixture=loading` shows table skeleton; `?fixture=error` shows `ErrorPanel` with retry.
- [ ] Sources shows a deterministic **Freshness** cue derived from `lastSync` (fresh/stale/old).
- [ ] Sources “Pause” action opens an impact preview dialog and does not navigate the row.

## Detail pages

- [ ] Breadcrumb `aria-label="Breadcrumb"` present; list segment restores URL query after in-app navigation.
- [ ] After full page reload on detail, breadcrumb / “← list” still restores filters (session fallback).
- [ ] Unknown id with demo on: “not found” empty state + back CTA respects stored list query when present.
- [ ] With demo off: “load sandbox” CTA seeds data and reloads.
- [ ] Source detail includes Freshness label derived from `lastSync`.

## Trust / policy

- [ ] `?fixture=partial` shows partial banner + primary content where applicable.
- [ ] `?fixture=restricted` shows restricted copy; hidden fields not implied by counts.
- [ ] `?fixture=denied` shows denied empty state (no privileged data).

## Telemetry (dev console / `__HG_TELEMETRY__`)

- [ ] `filter_applied` on filter changes.
- [ ] `competition_viewed` / `match_viewed` / `source_viewed` once per successful detail view.
- [ ] `sandbox_seeded` includes `source` when loading demo from any entry point.
- [ ] `source_paused` fires on pause confirmation with `impactedProductCount`.

## Not yet in scope for this checklist

- Deterministic column **sort** (beyond filter + search).
- Source pause / downstream “impact preview” UI.
- Live API-backed lists (still mock-driven).
