import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  isDetailListOriginState,
  listSearchFromState,
  persistDetailListSearch,
  resolveDetailListLocationSearch,
  resolveDetailListSearchRaw,
} from "@/lib/detailListOrigin";
import {
  SESSION_LIST_ORIGIN_COMPETITIONS,
  SESSION_LIST_ORIGIN_MATCHES,
} from "@/lib/storageKeys";

describe("detailListOrigin", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("rejects invalid state", () => {
    expect(isDetailListOriginState(null)).toBe(false);
    expect(isDetailListOriginState({})).toBe(false);
    expect(isDetailListOriginState({ listSearch: 1 })).toBe(false);
    expect(listSearchFromState(undefined)).toBe("");
    expect(resolveDetailListLocationSearch("competitions", undefined)).toBe("");
  });

  it("reads listSearch from state and builds location search", () => {
    const state = { listSearch: "game=Valorant" };
    expect(isDetailListOriginState(state)).toBe(true);
    expect(listSearchFromState(state)).toBe("game=Valorant");
    expect(resolveDetailListLocationSearch("competitions", state)).toBe("?game=Valorant");
  });

  it("does not double the question mark in state", () => {
    expect(resolveDetailListLocationSearch("competitions", { listSearch: "?q=1" })).toBe("?q=1");
  });

  it("state wins over sessionStorage", () => {
    sessionStorage.setItem(SESSION_LIST_ORIGIN_COMPETITIONS, "game=Rocket+League");
    expect(resolveDetailListSearchRaw("competitions", { listSearch: "game=Valorant" })).toBe(
      "game=Valorant",
    );
  });

  it("falls back to sessionStorage when state is empty", () => {
    persistDetailListSearch("matches", "competition=Spring+Invitational");
    expect(resolveDetailListSearchRaw("matches", {})).toBe("competition=Spring+Invitational");
    expect(resolveDetailListLocationSearch("matches", {})).toBe("?competition=Spring+Invitational");
  });

  it("persist removes key when query is empty", () => {
    sessionStorage.setItem(SESSION_LIST_ORIGIN_MATCHES, "x=1");
    persistDetailListSearch("matches", "");
    expect(sessionStorage.getItem(SESSION_LIST_ORIGIN_MATCHES)).toBeNull();
  });
});
