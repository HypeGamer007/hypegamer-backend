export const DEMO_SOURCE_IMPACT: Record<
  string,
  {
    impactedProductCount: number;
    impactedProducts: string[];
  }
> = {
  src_ok_01: {
    impactedProductCount: 3,
    impactedProducts: ["Tournament brackets", "Lane match feed", "Spectator widgets"],
  },
  src_deg_02: {
    impactedProductCount: 2,
    impactedProducts: ["Tournament brackets", "Lane match feed"],
  },
  src_fail_03: {
    impactedProductCount: 1,
    impactedProducts: ["Tournament brackets"],
  },
};
