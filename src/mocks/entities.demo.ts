export type EntityType = "team" | "player";

export type EntityStatus = "active" | "inactive" | "flagged";

export interface EntitySummaryRow {
  id: string;
  type: EntityType;
  displayName: string;
  status: EntityStatus;
  primaryGame: string;
  lastUpdatedAt: string;
  provenance: string;
}

export interface MergeSuggestion {
  intoEntityId: string;
  intoDisplayName: string;
  confidenceBand: "high" | "medium" | "low";
  rationale: string;
}

export interface SkillCoverageViewModel {
  band: "high" | "medium" | "low";
  rankedMatchSamples: number;
}

export interface EntityProfile extends EntitySummaryRow {
  aliases: string[];
  notes?: string;
  roster?: Array<{ id: string; displayName: string; role?: string }>;
  linkedAccounts: Array<{ provider: "steam" | "riot" | "twitch" | "epic"; handle: string; status: "linked" | "pending" | "error" }>;
  mergeSuggestion?: MergeSuggestion;
  skillCoverage?: SkillCoverageViewModel;
}

export const DEMO_ENTITIES: EntityProfile[] = [
  {
    id: "team_100",
    type: "team",
    displayName: "Rocket City Crew",
    status: "active",
    primaryGame: "Rocket League",
    lastUpdatedAt: "2026-05-10T09:00:00Z",
    provenance: "Publisher authorized",
    aliases: ["RCC", "Rocket City"],
    notes: "Roster is demo data; identity graph ships later.",
    roster: [
      { id: "player_200", displayName: "Astra", role: "Captain" },
      { id: "player_201", displayName: "Kestrel" },
    ],
    linkedAccounts: [
      { provider: "twitch", handle: "rocketcitycrew", status: "linked" },
      { provider: "steam", handle: "rcc_official", status: "pending" },
    ],
  },
  {
    id: "player_200",
    type: "player",
    displayName: "Astra",
    status: "active",
    primaryGame: "Rocket League",
    lastUpdatedAt: "2026-05-10T07:40:00Z",
    provenance: "Community",
    aliases: ["AstraRL", "Astra_7"],
    linkedAccounts: [{ provider: "steam", handle: "astra-7", status: "linked" }],
    skillCoverage: { band: "high", rankedMatchSamples: 48 },
  },
  {
    id: "player_201",
    type: "player",
    displayName: "Kestrel",
    status: "flagged",
    primaryGame: "Rocket League",
    lastUpdatedAt: "2026-05-09T18:20:00Z",
    provenance: "Publisher authorized",
    aliases: ["Kes", "Kestrel_RL", "k3str3l"],
    notes: "Flagged because multiple aliases map to overlapping identities.",
    linkedAccounts: [
      { provider: "steam", handle: "kestrel", status: "error" },
      { provider: "twitch", handle: "kestrel_live", status: "linked" },
    ],
    skillCoverage: { band: "medium", rankedMatchSamples: 14 },
    mergeSuggestion: {
      intoEntityId: "player_200",
      intoDisplayName: "Astra",
      confidenceBand: "medium",
      rationale:
        "Shared recovery signals on Steam plus overlapping alias timing suggest a single underlying roster identity.",
    },
  },
  {
    id: "team_101",
    type: "team",
    displayName: "Valorant Vanguards",
    status: "inactive",
    primaryGame: "Valorant",
    lastUpdatedAt: "2026-05-01T12:00:00Z",
    provenance: "Community",
    aliases: ["VGV", "Vanguards"],
    roster: [{ id: "player_202", displayName: "Nova" }],
    linkedAccounts: [],
  },
  {
    id: "player_202",
    type: "player",
    displayName: "Nova",
    status: "active",
    primaryGame: "Valorant",
    lastUpdatedAt: "2026-05-02T16:30:00Z",
    provenance: "Community",
    /** Duplicate literal appears twice — UI should surface duplicate-source cues without changing the canonical name. */
    aliases: ["NovaV", "novaaa", "NovaV"],
    linkedAccounts: [{ provider: "riot", handle: "Nova#HG", status: "linked" }],
    skillCoverage: { band: "low", rankedMatchSamples: 3 },
  },
];

export const DEMO_ENTITY_SUMMARIES: EntitySummaryRow[] = DEMO_ENTITIES.map(
  ({ aliases: _aliases, roster: _roster, linkedAccounts: _linked, notes: _notes, ...rest }) => rest,
);

export function getEntityById(id: string) {
  return DEMO_ENTITIES.find((e) => e.id === id);
}

