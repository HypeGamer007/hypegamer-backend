/**
 * Single source for onboarding step titles and body copy.
 * Each step renders as one full “window” panel in the wizard.
 */

export type OnboardingStepId =
  | "welcome"
  | "workspace"
  | "environment"
  | "connect_source"
  | "verify_data"
  | "complete";

export interface OnboardingStepDefinition {
  id: OnboardingStepId;
  /** Short label for the progress rail */
  shortLabel: string;
  title: string;
  body: string;
  /** Numbered substeps for connect flow (shown on the connect step only) */
  substeps?: Array<{ title: string; detail: string }>;
}

export const ONBOARDING_STEPS: OnboardingStepDefinition[] = [
  {
    id: "welcome",
    shortLabel: "Start",
    title: "Welcome to your control plane",
    body:
      "You will set up a workspace, choose an environment, outline how data connects, " +
      "and optionally load a demo so every screen teaches itself before live data arrives.",
  },
  {
    id: "workspace",
    shortLabel: "Workspace",
    title: "Confirm your workspace",
    body:
      "Your organization works inside a workspace. You can invite members and manage projects " +
      "after setup. For now, we use a demo workspace name—you can rename it later in settings.",
  },
  {
    id: "environment",
    shortLabel: "Environment",
    title: "Choose where you are working",
    body:
      "Start in Sandbox to preview competitions, matches, and products without affecting production. " +
      "Switch to Live when your sources are certified and you are ready for operational truth.",
  },
  {
    id: "connect_source",
    shortLabel: "Connect",
    title: "Connect a data source",
    body:
      "Sources feed competitions, matches, teams, and players. Follow the steps below. " +
      "You can finish setup now and add credentials later—nothing blocks you from exploring the UI.",
    substeps: [
      {
        title: "Choose a source type",
        detail: "Official feeds, tournament tools, or community imports—each shows provenance clearly.",
      },
      {
        title: "Authorize access",
        detail: "Use the minimum scopes needed. Credentials are never shown again in plain text after save.",
      },
      {
        title: "Test the connection",
        detail: "We validate reachability and sample a small payload so you know the pipe works.",
      },
    ],
  },
  {
    id: "verify_data",
    shortLabel: "Data",
    title: "Load data or continue empty",
    body:
      "Load the demo workspace to see health cards, lists, and provenance labels immediately. " +
      "Or skip and use value-preserving empty states until your first source syncs.",
  },
  {
    id: "complete",
    shortLabel: "Done",
    title: "You are ready",
    body:
      "Open the workspace dashboard to track source health, competitions, and next steps. " +
      "When sandbox data is on, use Partners, Trust, and Settings from the nav for grant matrix, integrity signals, and audit policy (mock until APIs ship). " +
      "You can return to this checklist anytime from the shell if setup is incomplete.",
  },
];

export const DEMO_WORKSPACE_NAME = "Hypegamer Demo Workspace";
export const DEMO_PROJECT_NAME = "Primary project";
