/**
 * Single “Ancient Major” demo arc: copy and deep links are derived from seeded fixtures
 * (operational, productization, governance) so Home, Search, and notifications stay aligned.
 */

/** DOM id + URL hash for post–demo-tour focus (`/home#workspace-story`). */
export const WORKSPACE_STORY_ELEMENT_ID = "workspace-story";
import { GOVERNANCE_DEMO } from "@/mocks/governance.demo";
import { DEMO_COMPETITIONS, DEMO_SOURCES } from "@/mocks/operational.demo";
import { DEMO_DATA_PRODUCTS, DEMO_WIDGETS } from "@/mocks/productization.demo";

/** Matches em dash in `governance-demo.json` trust titles. */
const TITLE_DASH = "\u2014";

export type WorkspaceStoryChapter = {
  step: number;
  title: string;
  body: string;
  to: string;
  cta: string;
};

export type WorkspaceStoryRun = {
  headline: string;
  subline: string;
  chapters: WorkspaceStoryChapter[];
};

function firstCompetition() {
  return DEMO_COMPETITIONS[0]!;
}

function primarySource() {
  return DEMO_SOURCES[0]!;
}

function certifiedProduct() {
  return DEMO_DATA_PRODUCTS.find((p) => p.ingestionTier === "certified") ?? DEMO_DATA_PRODUCTS[0]!;
}

function communityProduct() {
  return DEMO_DATA_PRODUCTS.find((p) => p.ingestionTier === "community") ?? DEMO_DATA_PRODUCTS[0]!;
}

function sandboxPublishedWidget() {
  return (
    DEMO_WIDGETS.find((w) => w.status === "published" && w.environment === "sandbox") ?? DEMO_WIDGETS[0]!
  );
}

function liveCommunityWidget() {
  const comm = communityProduct();
  return DEMO_WIDGETS.find((w) => w.environment === "live" && w.productName === comm.name) ?? DEMO_WIDGETS[DEMO_WIDGETS.length - 1]!;
}

function leadTrustSignal() {
  return GOVERNANCE_DEMO.trustSignals[0]!;
}

function pendingPartner() {
  return GOVERNANCE_DEMO.partners.find((p) => p.status === "pending") ?? GOVERNANCE_DEMO.partners[1]!;
}

/** Deterministic chapters; safe to render whenever demo fixtures are loaded. */
export function buildWorkspaceStoryRun(): WorkspaceStoryRun {
  const comp = firstCompetition();
  const src = primarySource();
  const certDp = certifiedProduct();
  const commDp = communityProduct();
  const sbWidget = sandboxPublishedWidget();
  const liveWidget = liveCommunityWidget();
  const trust = leadTrustSignal();
  const partner = pendingPartner();
  const trustTeaser = trust.title.split(TITLE_DASH)[0]?.trim() ?? "Integrity signal";
  const dataProductQuery = encodeURIComponent(certDp.name.split(" ")[0] ?? "Ancient");

  return {
    headline: `${comp.name} · workspace story`,
    subline: `One mocked arc: ${src.displayName} feeds ${comp.name}; ${certDp.name} stays certified while ${commDp.name} stays community; widgets inherit that split; ${trustTeaser} is the headline trust review; ${partner.orgName} is still pending; the Integrator pipeline echoes the same warnings you see in widgets and trust.`,
    chapters: [
      {
        step: 1,
        title: "Ingest",
        body: `${src.displayName} is the healthy publisher-authorized lane into ${comp.name} (provenance + freshness on the Sources detail).`,
        to: `/sources/${src.id}`,
        cta: `Open ${src.displayName}`,
      },
      {
        step: 2,
        title: "Operate",
        body: `Bracket and match rows for ${comp.name} stay labeled by provenance so community shards never masquerade as certified.`,
        to: `/competitions/${comp.id}`,
        cta: `Open ${comp.name}`,
      },
      {
        step: 3,
        title: "Productize",
        body: `Compare ${certDp.name} (certified) with ${commDp.name} (community) — the policy matrix on Data products is where mixed-tier drafts collide.`,
        to: `/data-products?q=${dataProductQuery}`,
        cta: "Open data products",
      },
      {
        step: 4,
        title: "Publish",
        body: `${sbWidget.title} is already published in sandbox while ${liveWidget.title} stays draft on live because it backs onto ${commDp.name}.`,
        to: `/widgets?q=GPM&preview=live`,
        cta: "Review widgets",
      },
      {
        step: 5,
        title: "Trust",
        body: `${trust.title}: redacted evidence preview shows how integrity treats book-feed signals without dumping raw payloads.`,
        to: `/trust?q=${encodeURIComponent(trustTeaser)}`,
        cta: "Open trust queue",
      },
      {
        step: 6,
        title: "Partners",
        body: `${partner.orgName} (${partner.partnerType.toLowerCase()}) is still pending approval while scopes promise certified-only writes.`,
        to: `/partners?status=pending`,
        cta: "Review partner grants",
      },
      {
        step: 7,
        title: "Integrator",
        body: "Pipeline log, mapping gaps, and ROI bands reuse the same MOBA sandbox numbers — jump to warn-level events to see the cautionary tale.",
        to: "/integrator?tab=pipeline&logLevel=warn",
        cta: "Open pipeline (warn)",
      },
    ],
  };
}
