# Phase 3 QA Checklist

## Shipped in mock UI (verify manually / e2e)

- [x] Data products list with URL-synced filters and explicit sort; empty + filter-empty panels; new draft flow with `data_product_created` telemetry.
- [x] Widgets list with sandbox vs live **preview mode** toggle (copy/banner only; no real network split).
- [x] Publish draft widget → confirm dialog → `widget_published` + persisted “published” state (demo `localStorage`).
- [x] Developers: create API key → full secret shown **once** → list stores **masked** secret only + `api_key_created`.

## Not yet in mock UI (keep for backend / hardening phases)

- [ ] Data-product builder blocks invalid source/policy combinations server-side (UI shows policy note for player extracts only).
- [ ] Widget preview iframe / live embed parity beyond banner copy.
- [ ] Publish/unpublish workflows reflect **live** policy restrictions from API.
- [ ] Webhook testing and delivery logs with retry/error states.
- [ ] Restricted data never appears in preview payloads or docs examples (needs real payloads + redaction tests).
