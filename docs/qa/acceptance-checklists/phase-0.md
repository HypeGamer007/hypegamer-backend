# Phase 0 QA Checklist

Use this list against the **current** mock UI. Items marked **(matrix)** are covered selectively in Playwright (`authz-and-state-matrix`, per-route fixture specs), not necessarily on every route in one run.

- [ ] Shell route resolves for allowed/restricted/denied users **(matrix: `/home`, `/sources`, `/competitions`, `/matches`; extend as new routes gain coverage)**.
- [ ] Scaffolded routes support the seven view states via `?fixture=` where implemented; manifest “supportsStates” is the contract target, not a guarantee that CI hits every combination on every path yet.
- [ ] Onboarding wizard uses one-window-per-step with a visible progress rail.
- [ ] Connect step lists explicit numbered substeps (type → authorize → test).
- [ ] Wizard supports skip and finish; finish lands on `/home`.
- [ ] Empty states include reason + primary CTA (and secondary where designed).
- [ ] Error states include request ID and retry path when `?fixture=error` supplies `requestId` (see `RouteViewRoot`).
- [ ] Keyboard navigation: primary nav and table row activation are covered in e2e; full drawers/dialogs matrix is **not** fully audited—track as follow-up if regressions appear.
- [ ] Sandbox seed (`seedDemoWorkspace` / “Load sandbox data”) sets `hypegamer_demo_seeded` and emits `sandbox_seeded` for deterministic demos.
