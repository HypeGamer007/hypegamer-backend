import { describe, it, expect } from "vitest";

type GateState = "ready" | "restricted" | "denied";

const resolveGateState = (canView: boolean, isPolicyRestricted: boolean): GateState => {
  if (!canView) return "denied";
  if (isPolicyRestricted) return "restricted";
  return "ready";
};

describe("Permission gate state resolution", () => {
  it("returns denied when canView is false", () => {
    expect(resolveGateState(false, false)).toBe("denied");
  });

  it("returns restricted when policy-limited", () => {
    expect(resolveGateState(true, true)).toBe("restricted");
  });

  it("returns ready when view allowed and unrestricted", () => {
    expect(resolveGateState(true, false)).toBe("ready");
  });
});
