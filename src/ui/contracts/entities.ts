import type { ViewStateEnvelope } from "./states";

export interface Provenance {
  provenanceTier: "certified" | "publisher_authorized" | "verified_community" | "community";
  sourceSystem: string;
  sourceObjectId: string;
  sourceDisplayName?: string;
  confidenceScore?: number;
  restrictedReason?: string;
}

export interface CompetitionSummary {
  id: string;
  name: string;
  game: string;
  status: "upcoming" | "live" | "completed" | "archived";
  startsAt: string;
  provenance: Provenance;
}

export interface MatchSummary {
  id: string;
  competitionId: string;
  status: "scheduled" | "live" | "paused" | "completed" | "disputed" | "corrected" | "voided";
  scheduledAt: string;
  participants: Array<{ entityId: string; displayName: string; score?: number }>;
  provenance: Provenance;
}

export interface RouteDataEnvelope<T> {
  view: ViewStateEnvelope;
  data?: T;
}
