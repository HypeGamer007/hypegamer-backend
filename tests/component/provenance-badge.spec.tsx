import { describe, it, expect } from "vitest";

type Tier = "certified" | "publisher_authorized" | "verified_community" | "community";

const tierRank: Record<Tier, number> = {
  certified: 4,
  publisher_authorized: 3,
  verified_community: 2,
  community: 1
};

describe("Provenance tier ordering", () => {
  it("keeps certified above community", () => {
    expect(tierRank.certified).toBeGreaterThan(tierRank.community);
  });

  it("keeps publisher-authorized above verified community", () => {
    expect(tierRank.publisher_authorized).toBeGreaterThan(tierRank.verified_community);
  });
});
