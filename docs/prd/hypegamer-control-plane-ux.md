# Hypegamer Control-Plane UX PRD (Phase-Based)

## Scope
This PRD defines implementation-ready UX delivery for the control plane using the approved IA:
Home, Competitions, Matches, Teams & Players, Identity & Skill, Sources, Data Products, Widgets & Overlays, Developers, Partners, Trust & Integrity, Audit & Activity, Settings.

Ingestion implementation is out of scope.

## Delivery Model
Every phase ships:
- UX intent docs
- Route + permission metadata
- OpenAPI + JSON Schema contracts
- deterministic fixtures
- component/view contracts
- acceptance tests

## Phases

### Phase 0 - Foundations
- App shell and route scaffolds
- global state model and status components
- sandbox seed workflow
- permission gating baseline
- analytics taxonomy baseline

Exit gate: every major scaffolded route supports `loading/ready/empty/partial/error/restricted/denied`.

### Phase 1 - Operational Core
- Home command center
- competitions and matches operations
- sources observability

Exit gate: operators can evaluate health, provenance, freshness, and next actions with sandbox or live data.

### Phase 2 - Entities and Identity
- teams/players canonical directory
- linked accounts and consent surfaces
- skill profile + merge review workflow

Exit gate: entity and identity review flows are trustworthy and permission-safe.

### Phase 3 - Productization
- data product builder
- widgets and overlays gallery/builder
- developer portal for keys, OAuth, webhooks, logs

Exit gate: productization and integration workflows are operable in sandbox-first mode.

### Phase 4 - Governance Parity
- partner access management
- trust & integrity queue and evidence handling
- audit log and organization settings

Exit gate: governance workflows are policy-explicit and auditable.

### Phase 5 - Hardening and Rollout
- global search and notifications
- accessibility/performance hardening
- rollout controls and launch readiness

Exit gate: GA-ready with regression coverage, observability, and rollback procedures.

## Mandatory State Semantics
- `loading`: skeletons mirror final layout
- `empty`: explain absence + next action CTA
- `partial`: disclose incompleteness and known gaps
- `error`: include text explanation + request ID + retry/support path
- `restricted`: visible container with policy-safe redaction
- `denied`: explicit role mismatch and next step

## Accessibility and Interaction Requirements
- textual errors and status messaging
- keyboard-safe tables, tabs, drawers, dialogs
- focus trap + restore in modal surfaces
- manual activation for tabs with expensive async loads
- read-only preferred over disabled when content should remain perceivable

## Contract-First Handoff
Implementation is considered ready when these exist for a phase:
1. route manifest entries
2. state matrix coverage
3. JSON schemas
4. OpenAPI examples
5. fixtures for all major states
6. TS UI contracts
7. analytics definitions
8. acceptance tests
9. rollout flags and cohort rules
10. microcopy definitions for empty/error/restricted/denied
