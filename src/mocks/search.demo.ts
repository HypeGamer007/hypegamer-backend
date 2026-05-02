import raw from "../../specs/mocks/search-demo.json";

export type SearchDemoResult = {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  matchTerms: string[];
};

export type SearchDemoModel = {
  version: string;
  hintQueries: string[];
  results: SearchDemoResult[];
};

export const SEARCH_DEMO = raw as SearchDemoModel;
