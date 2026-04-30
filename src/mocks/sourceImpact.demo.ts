export const DEMO_SOURCE_IMPACT: Record<
  string,
  {
    impactedProductCount: number;
    impactedProducts: string[];
  }
> = {
  src_ok_01: {
    impactedProductCount: 3,
    impactedProducts: ["Competitions", "Matches", "Broadcast widgets"],
  },
  src_deg_02: {
    impactedProductCount: 2,
    impactedProducts: ["Competitions", "Matches"],
  },
  src_fail_03: {
    impactedProductCount: 1,
    impactedProducts: ["Competitions"],
  },
};

