export type DataProductRow = {
  id: string;
  name: string;
  entityType: "competition" | "match" | "team" | "player";
  status: "draft" | "published" | "archived";
  fieldCount: number;
  updatedAt: string;
};

export type WidgetRow = {
  id: string;
  title: string;
  environment: "sandbox" | "live";
  status: "draft" | "published";
  productName: string;
  updatedAt: string;
};

export type ApiKeyRow = {
  id: string;
  label: string;
  keyType: "server" | "readonly";
  maskedSecret: string;
  lastUsedAt: string | null;
  createdAt: string;
};

export const DEMO_DATA_PRODUCTS: DataProductRow[] = [
  {
    id: "dp_comp_spring",
    name: "Spring leaderboard feed",
    entityType: "competition",
    status: "published",
    fieldCount: 12,
    updatedAt: "2026-04-28T14:00:00.000Z",
  },
  {
    id: "dp_match_odds",
    name: "Match odds snapshot",
    entityType: "match",
    status: "draft",
    fieldCount: 6,
    updatedAt: "2026-04-27T09:30:00.000Z",
  },
];

export const DEMO_WIDGETS: WidgetRow[] = [
  {
    id: "wg_leaderboard_sbx",
    title: "Leaderboard embed",
    environment: "sandbox",
    status: "published",
    productName: "Spring leaderboard feed",
    updatedAt: "2026-04-28T15:10:00.000Z",
  },
  {
    id: "wg_odds_live",
    title: "Odds ticker",
    environment: "live",
    status: "draft",
    productName: "Match odds snapshot",
    updatedAt: "2026-04-26T11:00:00.000Z",
  },
];

export const DEMO_API_KEYS: ApiKeyRow[] = [
  {
    id: "key_ingest_1",
    label: "Ingest worker (eu-west)",
    keyType: "server",
    maskedSecret: "hg_live_••••9f2a",
    lastUsedAt: "2026-04-29T08:00:00.000Z",
    createdAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "key_readonly_qa",
    label: "QA read-only",
    keyType: "readonly",
    maskedSecret: "hg_ro_••••c81d",
    lastUsedAt: null,
    createdAt: "2026-04-10T12:00:00.000Z",
  },
];
