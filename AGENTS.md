# Hypegamer Control-Plane Agent Rules

## Objective
Deliver the Hypegamer control-plane UX with an artifact-first model. Each phase must ship:
1. Human-readable UX intent
2. Machine-readable contracts
3. Deterministic mock data
4. Stable component/view APIs
5. Executable acceptance tests

## Global Product Constraints
- Ingestion internals are out of scope for this repository.
- Certified and publisher-authorized records must never be visually conflated with community records.
- All major routes and data-heavy components must support:
  - `loading`, `ready`, `empty`, `partial`, `error`, `restricted`, `denied`
- Provenance and freshness metadata are mandatory where records are externally consumed.
- Permission handling must distinguish:
  - cannot view (`denied`)
  - can view but policy-limited (`restricted`)
  - read-only view with no mutation rights

## Artifact Sources of Truth
- Route/role/flag ownership: `docs/routes/route-manifest.json`
- Analytics contracts: `docs/analytics/events.yaml`
- API dependencies: `specs/openapi/control-plane.yaml`
- View models and invariants: `specs/schemas/*.schema.json`
- Fixtures: `specs/mocks/*.json`
- Shared UI contracts: `src/ui/contracts/*.ts`
- QA gates: `docs/qa/acceptance-checklists/*.md`
- Phase execution packs: `docs/cursor/tasks/*.md`

## Accessibility Baseline
- Accessible names for all interactive controls.
- Textual errors (not color-only); include request IDs where applicable.
- Async status updates announced non-disruptively.
- Dialogs/drawers trap focus and restore focus to trigger.
- Prefer read-only instead of disabled for perceivable but non-editable data.

## Testing Baseline
- Route-level e2e tests cover permission + state matrix.
- Component tests cover all supported statuses.
- Favor role/name/label selectors over brittle structural selectors.
- Add fixture-backed tests for empty, partial, restricted, denied, and error flows.

## Definition of Done (Per Epic)
- Route manifest updated.
- Schemas updated with examples and validation constraints.
- OpenAPI dependency shape updated (if API contract changed).
- Fixtures added/updated for happy and degraded states.
- Analytics events documented.
- E2E + component tests added/updated.
