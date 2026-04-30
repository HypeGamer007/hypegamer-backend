# Phase 2 QA Checklist

## Implemented in mock UI (verify in app + e2e)

- [x] Teams/players profiles handle sparse and duplicate alias data (`EntityDetailPage`: sparse empty copy; duplicate literals flagged).
- [x] Linked-account statuses and provider fallback states render correctly (pending / error / linked helper copy).
- [x] Consent revocation updates UI immediately with audit trail event (`revokeConsent` + `identity-audit-log` table).
- [x] Skill profile confidence text matches available coverage (`skillCoverage` bands + sample counts on player profiles).
- [x] Merge actions respect reviewer roles and produce auditable actions (`?role=` matrix; `merge_applied` + `entityMergeStore` log).
- [x] Owner-only routes deny non-owner non-reviewer access (merge confirmation gated off `canEdit`; `player_user` / `viewer` read-only copy).

## Still backend / production hardening (not mocked end-to-end)

- [ ] Server-enforced merge authorization and immutable audit sink (SIEM / warehouse).
- [ ] Real provider webhooks updating linked-account status (beyond static copy).
