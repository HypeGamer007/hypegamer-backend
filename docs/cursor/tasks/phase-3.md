# Phase 3 Task Pack

## Goal
Productize data via products, widgets, and developer workflows.

## Deliverables
- Data product builder with policy conflict handling
- Widget/overlay gallery, preview, and publish lifecycle
- Developer portal (keys, OAuth clients, webhooks, delivery logs) + **Integrator hub** (`/integrator`) for partner journey demos
- Contract-aligned examples for integrators

## Implementation Tasks
1. Implement field selector + policy matrix with conflict banners.
2. Implement widget template cards, theme panel, preview mode toggles.
3. Build secure key creation flow (reveal once), webhook endpoints + signing secret flows, test console, delivery logs with retry (mock/local persistence); OAuth clients stub panel.
4. Add sandbox/live preview parity fixtures.
5. Add tests for secret redaction and restricted field leakage (e2e covers webhook payload preview redaction + API key reveal-once).

## Acceptance Gate
- Product and developer flows are complete with deterministic preview and safe secret handling.
