import { describe, it, expect } from "vitest";
import { auditMatchesQuery } from "@/lib/governanceAuditFilter";

const sample = {
  occurredAt: "2026-04-30T14:02:00.000Z",
  actorLabel: "org_admin@demo",
  verb: "partner_access_revoked",
  objectLabel: "Partner grant · Radiant Forge",
  beforeSummary: "status=active",
  afterSummary: "status=revoked",
};

describe("auditMatchesQuery", () => {
  it("matches all rows when query is blank", () => {
    expect(auditMatchesQuery(sample, "")).toBe(true);
    expect(auditMatchesQuery(sample, "   ")).toBe(true);
  });

  it("matches substring on verb", () => {
    expect(auditMatchesQuery(sample, "revoked")).toBe(true);
  });

  it("matches substring on actor", () => {
    expect(auditMatchesQuery(sample, "org_admin")).toBe(true);
  });

  it("returns false when needle missing", () => {
    expect(auditMatchesQuery(sample, "widget_published")).toBe(false);
  });
});
