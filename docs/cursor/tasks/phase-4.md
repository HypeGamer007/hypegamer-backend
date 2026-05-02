# Phase 4 Task Pack

## Goal
Bring governance, trust, and settings to operational parity.

## Deliverables
- Partner directory and grant matrix
- Approval and revocation flows with impact preview
- Trust signal queue, evidence panel, and disposition forms
- Audit and settings administration routes

## Shipped in mock UI (control-plane repo)

1. Partner grant matrix with expiry, scope summary, URL filters (`q`, `status`), approve / renew / revoke dialogs + telemetry.
2. Trust queue with filters (`q`, `severity`, `state`), redacted evidence column, disposition dialog + `trust_signal_reviewed`.
3. **Audit activity** table on **Settings** (actor, verb, object, before/after), local filter, scroll region, export gated (disabled + copy).
4. Settings: workspace summary, **members roster** + disabled invite, **roles & access** matrix (fixture), retention (admin-gated save), notifications copy, IdP placeholder `EmptyState`.
5. OpenAPI: `/v1/governance/*` read list shapes (partner grants, trust signals, audit events, workspace members) aligned with UI mocks.
6. E2E: `tests/e2e/phase-4/partners-trust-settings.spec.ts` + governance routes in authz matrix; **Widgets** links to partner grants.
7. Unit: `tests/lib/governanceAuditFilter.spec.ts` for audit table filter helper.

## Still open (backend or deeper mock)

- Server-enforced revocation cascades and expandable audit payloads.
- Dedicated `/audit` route (if product splits settings vs audit); today audit lives under **Settings** per combined manifest id `audit_settings`.
- Optional: dedicated Playwright assertions on `window.__HG_TELEMETRY__` for governance events.

## Acceptance Gate
- Governance actions are explicit, auditable, and role-safe (mock: dialogs + telemetry + read-only audit preview).
