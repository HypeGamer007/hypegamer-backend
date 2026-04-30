# Phase 0 Task Pack

## Goal
Establish shell, state system, sandbox fixtures, and permission baseline.

## Deliverables
- App shell skeleton and nav structure
- Route scaffolds with full state envelopes
- Multi-step onboarding wizard (`src/components/onboarding/OnboardingWizard.tsx`) with explicit connect substeps
- Shared state components (`EmptyState`, `ErrorPanel`, `PermissionGate`, skeleton primitives)
- Route manifest baseline
- Analytics taxonomy baseline
- Demo workspace seed fixtures

## Implementation Tasks
1. Build shell route and global providers.
2. Implement shared `ViewStateEnvelope` handling utility.
3. Scaffold all baseline routes with explicit state-switch rendering.
4. Add denied/restricted templates with role-safe messaging.
5. Add sandbox seed control with deterministic fixture loading.
6. Wire core analytics events.

## Acceptance Gate
- Every scaffolded route supports: loading, ready, empty, partial, error, restricted, denied.
