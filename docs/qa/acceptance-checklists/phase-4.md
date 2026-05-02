# Phase 4 QA Checklist

## Mock UI (this repo)

- [x] Partner grant **approvals** and **revocations** show **impact previews** in confirm dialogs (copy-only; no backend).
- [x] **Pending** grants expose **Approve grant…**; active grants expose **Renew** / **Revoke**; controls respect `canEdit` from `?role=` / fixtures.
- [x] Grant matrix uses **`RouteViewRoot`** with loading / ready / empty / partial / error / restricted / denied semantics.
- [x] Trust evidence previews stay **policy-redacted** (`[REDACTED` in fixture + table caption).
- [x] Trust **Disposition** confirms and emits **`trust_signal_reviewed`** telemetry (stands in for immutable audit sink until backend).
- [x] **Settings → Recent audit activity**: fixture-backed table with **actor / verb / object / before / after**, local **filter**, **scroll** for larger sets, **Export CSV** disabled with **export safety** copy.
- [x] Settings **retention** distinguishes **read-only vs editable** via `canAdmin` (viewer sees read-only input + hint).
- [x] Settings **Members** (read-only roster + invite disabled with copy) and **Roles & access** capability matrix (fixture-backed).

## Production / backend (out of scope here)

- [ ] Immutable audit storage, signed exports, and HMAC/session elevation for downloads.
- [ ] Revocation **cascade** enforcement (keys, embeds, webhooks) server-side; e2e today asserts **dialog copy** only.
- [ ] Partner/trust/settings **live APIs** per `specs/openapi/control-plane.yaml` when contracts land.

---

## Self-audit traceability

| Artifact | Phase 4 coverage |
|----------|------------------|
| `docs/routes/route-manifest.json` | `/partners`, `/trust`, `/settings` |
| `specs/mocks/governance-demo.json` + `governance-demo.schema.json` | Partners, trust signals, settings copy, **audit activity**, **workspaceMembers**, **roleSummaries** |
| `specs/openapi/control-plane.yaml` | **GET** `/v1/governance/partner-grants`, `/trust-signals`, `/audit-events`, `/workspace-members` (contract stubs) |
| `docs/analytics/events.yaml` | `partner_access_granted` (incl. `grantAction`), `partners_*`, `trust_*`, `settings_*` |
| `tests/e2e/phase-4/partners-trust-settings.spec.ts` | Partners filters, trust redaction, settings **members + roles**, retention + read-only, **audit filter**, approve/revoke copy, **home governance snapshot → Partners** |
| Shell / cross-route | Setup checklist **governance** row + `STORAGE_GOVERNANCE_MODULES_VISITED`; **Home** snapshot card; **Developers** Integrations governance links; **Identity** → Settings audit link; **Widgets** → **Partners** (embed vs grants copy) |
| `tests/e2e/shared/authz-and-state-matrix.spec.ts` | Governance routes in matrix |

## Re-audit (post-implementation sweep)

| Requirement source | Status |
|--------------------|--------|
| Task pack: partner directory + grant matrix | Shipped |
| Task pack: approval/revocation + impact preview | Shipped (dialogs) |
| Task pack: trust queue + redaction | Shipped |
| Task pack: audit table actor/object/before-after | Shipped under **Settings → Recent audit activity** |
| Task pack: settings (retention, notifications, IdP placeholder) | Shipped |
| Task pack: tests for masked evidence | Shipped (e2e) |
| Task pack: tests for revocation cascades | **Partial** — cascade asserted as **UX copy** in e2e; server cascade N/A in mock |
| AGENTS.md: seven view states on heavy routes | Shipped via `RouteViewRoot` + fixtures |
| AGENTS.md: certified vs community copy | Partners table caption + trust copy |
