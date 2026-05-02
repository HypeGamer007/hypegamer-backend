import { emitSetupChanged } from "@/lib/setupEvents";
import { STORAGE_DEMO_SEEDED } from "@/lib/storageKeys";
import { track } from "@/lib/telemetry";

/** Where the user chose to load deterministic sandbox rows. */
export type SandboxSeedSource =
  | "onboarding"
  | "home_empty_state"
  | "competitions_empty"
  | "matches_empty"
  | "sources_empty_secondary"
  | "competition_detail_empty"
  | "match_detail_empty"
  | "source_detail_empty"
  | "entities_empty"
  | "entity_detail_empty"
  | "identity_empty"
  | "data_products_empty"
  | "widgets_empty"
  | "developers_empty"
  | "integrator_empty"
  | "partners_empty"
  | "trust_empty"
  | "audit_settings_empty"
  /** One-click: checklist flags + sandbox + sample webhook delivery for Developers. */
  | "full_demo_tour";

export function seedDemoWorkspace(source: SandboxSeedSource) {
  localStorage.setItem(STORAGE_DEMO_SEEDED, "1");
  emitSetupChanged();
  track("sandbox_seeded", {
    source,
    fixtureSet: "operational.demo",
    workspaceId: "demo_workspace",
    projectId: "demo_project",
  });
}
