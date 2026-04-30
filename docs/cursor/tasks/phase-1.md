# Phase 1 Task Pack

## Goal
Ship operational truth for Home, Competitions, Matches, and Sources.

## Deliverables
- Home command center cards with no-data and stale variants
- Competition and match list/detail flows with provenance and freshness
- Sources health dashboard and downstream impact preview
- Filter/sort behavior with deterministic fixtures

## Implementation Tasks
1. Build `MetricCard`, `HealthCard`, `ActivityFeed` with state variants.
2. Build competitions and matches table/detail with lineage slots.
3. Build source health and pause/impact UI (admin scoped).
4. Add list/detail fixture sets for empty/partial/error/restricted scenarios.
5. Add e2e coverage for filters, stale data, denied/restricted state behavior.

## Acceptance Gate
- Operational routes are useful in sandbox and live modes with provenance clarity.
