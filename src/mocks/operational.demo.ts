/** Shared deterministic demo rows for Phase 1 list routes. */

export interface CompetitionRow {
  id: string;
  name: string;
  game: string;
  status: string;
  provenance: string;
}

export interface MatchRow {
  id: string;
  /** Optional link target for the parent competition detail route. */
  competitionId?: string;
  competition: string;
  phase: string;
  scheduledAt: string;
  provenance: string;
}

export const DEMO_COMPETITIONS: CompetitionRow[] = [
  {
    id: "cmp_100",
    name: "Spring Invitational",
    game: "Valorant",
    status: "live",
    provenance: "Publisher authorized",
  },
  {
    id: "cmp_101",
    name: "Community Open",
    game: "Valorant",
    status: "upcoming",
    provenance: "Community",
  },
  {
    id: "cmp_102",
    name: "Rocket City Showdown",
    game: "Rocket League",
    status: "completed",
    provenance: "Publisher authorized",
  },
];

export const DEMO_MATCHES: MatchRow[] = [
  {
    id: "m_1001",
    competitionId: "cmp_100",
    competition: "Spring Invitational",
    phase: "Quarterfinal",
    scheduledAt: "2026-06-15T18:00:00Z",
    provenance: "Publisher authorized",
  },
  {
    id: "m_1002",
    competitionId: "cmp_100",
    competition: "Spring Invitational",
    phase: "Quarterfinal",
    scheduledAt: "2026-06-15T20:00:00Z",
    provenance: "Community",
  },
  {
    id: "m_1003",
    competitionId: "cmp_102",
    competition: "Rocket City Showdown",
    phase: "Semifinal",
    scheduledAt: "2026-06-16T19:00:00Z",
    provenance: "Publisher authorized",
  },
];

export function getCompetitionById(id: string) {
  return DEMO_COMPETITIONS.find((c) => c.id === id);
}

export function getMatchById(id: string) {
  return DEMO_MATCHES.find((m) => m.id === id);
}

export interface SourceRow {
  id: string;
  displayName: string;
  status: "healthy" | "degraded" | "failed" | "paused";
  provenance: string;
  lastSync: string;
}

export const DEMO_SOURCES: SourceRow[] = [
  {
    id: "src_ok_01",
    displayName: "Official Event Feed",
    status: "healthy",
    provenance: "Publisher authorized",
    lastSync: "2026-05-10T10:00:00Z",
  },
  {
    id: "src_deg_02",
    displayName: "Partner Bracket API",
    status: "degraded",
    provenance: "Publisher authorized",
    lastSync: "2026-05-10T08:15:00Z",
  },
  {
    id: "src_fail_03",
    displayName: "Community Bracket Import",
    status: "failed",
    provenance: "Community",
    lastSync: "2026-05-09T08:40:00Z",
  },
];

export function getSourceById(id: string) {
  return DEMO_SOURCES.find((s) => s.id === id);
}
