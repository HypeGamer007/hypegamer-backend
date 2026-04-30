export const STORAGE_ONBOARDING_COMPLETE = "hypegamer_onboarding_complete";
export const STORAGE_DEMO_SEEDED = "hypegamer_demo_seeded";
export const STORAGE_ENVIRONMENT = "hypegamer_environment";
/** User opened Sources at least once (setup checklist progress). */
export const STORAGE_SOURCES_VISITED = "hypegamer_setup_sources_visited";

/** Last list URL query (`URLSearchParams.toString()`, no `?`) for detail back-links after refresh. */
export const SESSION_LIST_ORIGIN_COMPETITIONS = "hypegamer_list_origin_competitions";
export const SESSION_LIST_ORIGIN_MATCHES = "hypegamer_list_origin_matches";
export const SESSION_LIST_ORIGIN_SOURCES = "hypegamer_list_origin_sources";
export const SESSION_LIST_ORIGIN_ENTITIES = "hypegamer_list_origin_entities";

/** User-created data product drafts (merged with `DEMO_DATA_PRODUCTS`). */
export const STORAGE_EXTRA_DATA_PRODUCTS = "hypegamer_extra_data_products";
/** Widget ids the user published in this session (demo persistence). */
export const STORAGE_WIDGET_PUBLISHED_IDS = "hypegamer_widget_published_ids";
/** API keys created after reveal-once flow (masked secrets only). */
export const STORAGE_EXTRA_API_KEYS = "hypegamer_extra_api_keys";

/** Append-only demo log for entity merge confirmations (reviewer actions). */
export const STORAGE_ENTITY_MERGE_AUDIT = "hypegamer_entity_merge_audit_v1";
/** Append-only demo log for identity consent changes (audit trail UI). */
export const STORAGE_IDENTITY_AUDIT = "hypegamer_identity_audit_v1";
