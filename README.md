# Hypegamer Control-Plane UX Handoff

This repository is a phase-based UX implementation pack for Cursor-driven delivery.

**Source of truth:** develop from this directory (`hypegamer-control-plane`). If you previously had a parallel copy under `C:\Users\dmill\hypegamerv3`, treat that as a **duplicate** once you have verified this tree (then remove the old folder to avoid drift).

## Run the app

```bash
npm install
npm run dev
```

Open `/onboarding` for the setup wizard, or `/home` after completing onboarding (stored in `localStorage`).

## Contents
- `docs/prd`: narrative phase PRD
- `docs/routes`: route/role/flag manifest
- `docs/analytics`: event taxonomy
- `docs/cursor/tasks`: one implementation pack per phase
- `docs/qa/acceptance-checklists`: phase QA gates
- `specs/openapi`: HTTP contract examples
- `specs/schemas`: JSON schema contracts
- `specs/mocks`: deterministic state fixtures
- `src/ui/contracts`: TypeScript UI contracts
- `tests`: starter e2e/component coverage

## Delivery order
1. Phase 0 foundations
2. Phase 1 operations
3. Phase 2 entities and identity
4. Phase 3 productization
5. Phase 4 governance
6. Phase 5 hardening and rollout

## Implementation status

| Phase | UI in this repo | Detail |
|-------|------------------|--------|
| 0 | **Yes** | Shell, onboarding, setup checklist, fixture-driven states, telemetry shim |
| 1 | **Yes** | Home, three operational lists + URL filters, three detail routes, breadcrumbs, list-origin persistence, sorting, source pause + impact, freshness summary |
| 2 | **Yes** | `/entities` + `/entities/:id`, `/identity`, demo stores, Playwright coverage |
| 3 | **Yes (mock UI)** | `/data-products`, `/widgets`, `/developers` — lists, filters, draft/publish/reveal-once flows, Phase 3 e2e smoke |
| 4–5 | **Planned / smoke** | Manifest + placeholder e2e; no product UI yet beyond smoke specs |

See **`docs/ROADMAP.md`** for a module-by-module audit, known gaps, and suggested next build slices.
