/** Shared deterministic demo rows for Phase 1 list routes (MOBA / Dota-style showcase). */

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
    name: "Ancient Major",
    game: "MOBA",
    status: "live",
    provenance: "Publisher authorized",
  },
  {
    id: "cmp_101",
    name: "Dire Open Qualifiers",
    game: "MOBA",
    status: "upcoming",
    provenance: "Community",
  },
  {
    id: "cmp_102",
    name: "Rosh Pit Open",
    game: "MOBA",
    status: "completed",
    provenance: "Publisher authorized",
  },
];

export const DEMO_MATCHES: MatchRow[] = [
  {
    id: "m_1001",
    competitionId: "cmp_100",
    competition: "Ancient Major",
    phase: "Upper bracket · Game 1",
    scheduledAt: "2026-06-15T18:00:00Z",
    provenance: "Publisher authorized",
  },
  {
    id: "m_1002",
    competitionId: "cmp_100",
    competition: "Ancient Major",
    phase: "Lower bracket · Decider",
    scheduledAt: "2026-06-15T20:00:00Z",
    provenance: "Community",
  },
  {
    id: "m_1003",
    competitionId: "cmp_102",
    competition: "Rosh Pit Open",
    phase: "Semifinal · Game 2",
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
    displayName: "Spectator Match Feed",
    status: "healthy",
    provenance: "Publisher authorized",
    lastSync: "2026-05-10T10:00:00Z",
  },
  {
    id: "src_deg_02",
    displayName: "Partner Pick/Ban API",
    status: "degraded",
    provenance: "Publisher authorized",
    lastSync: "2026-05-10T08:15:00Z",
  },
  {
    id: "src_fail_03",
    displayName: "Open Pub Scrims Import",
    status: "failed",
    provenance: "Community",
    lastSync: "2026-05-09T08:40:00Z",
  },
];

export function getSourceById(id: string) {
  return DEMO_SOURCES.find((s) => s.id === id);
}
