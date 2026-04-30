import { beforeEach, describe, expect, it } from "vitest";
import {
  findMergeResolutionForEntity,
  readMergeAuditLog,
  recordMergeApplied,
} from "@/lib/entityMergeStore";
import { STORAGE_ENTITY_MERGE_AUDIT } from "@/lib/storageKeys";

describe("entityMergeStore", () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_ENTITY_MERGE_AUDIT);
  });

  it("records and resolves merge by source entity id", () => {
    recordMergeApplied({
      fromEntityId: "player_201",
      intoEntityId: "player_200",
      intoDisplayName: "Astra",
      confidenceBand: "medium",
      reviewerId: "integrity_reviewer",
    });
    expect(readMergeAuditLog()).toHaveLength(1);
    expect(findMergeResolutionForEntity("player_201")?.intoEntityId).toBe("player_200");
  });
});
