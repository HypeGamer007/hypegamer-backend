import { describe, it, expect } from "vitest";
import { mergeSearchParams } from "@/lib/searchParams";

describe("mergeSearchParams", () => {
  it("preserves unrelated keys and removes cleared keys", () => {
    const base = new URLSearchParams("fixture=loading&game=Valorant&q=hi");
    const next = mergeSearchParams(base, { q: null, game: null });
    expect(next.get("fixture")).toBe("loading");
    expect(next.get("game")).toBeNull();
    expect(next.get("q")).toBeNull();
  });
});
