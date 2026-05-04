import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  STORAGE_DEMO_SEEDED,
  STORAGE_GOVERNANCE_MODULES_VISITED,
  STORAGE_INTEGRATOR_HUB_VISITED,
  STORAGE_ONBOARDING_COMPLETE,
  STORAGE_SOURCES_VISITED,
} from "@/lib/storageKeys";
import { subscribeSetupChanged } from "@/lib/setupEvents";

export type SetupChecklistItemModel = {
  id: string;
  label: string;
  hint: string;
  done: boolean;
  to: string;
  linkLabel: string;
};

function readProgress() {
  return {
    onboardingDone: localStorage.getItem(STORAGE_ONBOARDING_COMPLETE) === "1",
    demoSeeded: localStorage.getItem(STORAGE_DEMO_SEEDED) === "1",
    sourcesVisited: localStorage.getItem(STORAGE_SOURCES_VISITED) === "1",
    integratorHubVisited: localStorage.getItem(STORAGE_INTEGRATOR_HUB_VISITED) === "1",
    governanceModulesVisited: localStorage.getItem(STORAGE_GOVERNANCE_MODULES_VISITED) === "1",
  };
}

export function useSetupChecklistProgress() {
  const location = useLocation();
  const [p, setP] = useState(readProgress);

  useEffect(() => {
    setP(readProgress());
  }, [location.pathname]);

  useEffect(() => {
    return subscribeSetupChanged(() => setP(readProgress()));
  }, []);

  const items = useMemo((): SetupChecklistItemModel[] => {
    return [
      {
        id: "onboarding",
        label: "Complete guided setup",
        hint: "Workspace context, environment, and connect outline.",
        done: p.onboardingDone,
        to: "/onboarding",
        linkLabel: "Open setup",
      },
      {
        id: "sources",
        label: "Review Sources",
        hint: "Open the Sources module to see how connections appear in health views.",
        done: p.sourcesVisited || p.demoSeeded,
        to: "/sources",
        linkLabel: "Go to Sources",
      },
      {
        id: "demo",
        label: "Load sandbox data (optional)",
        hint: "Unlocks the Ancient Major workspace story on Home plus cross-linked search hints.",
        done: p.demoSeeded,
        to: "/home",
        linkLabel: p.demoSeeded ? "View home" : "Load from Home",
      },
      {
        id: "integrator",
        label: "Preview Integrator hub (optional)",
        hint: "Pipeline log matches the same MOBA fixtures as Home step 7 (warn-level events).",
        done: p.integratorHubVisited,
        to: "/integrator",
        linkLabel: "Open Integrator hub",
      },
      {
        id: "governance",
        label: "Review governance (optional)",
        hint: "Dire Circuit + trust signals are the same rows linked from Home story steps 5–6.",
        done: p.governanceModulesVisited,
        to: "/partners",
        linkLabel: "Open Partners",
      },
    ];
  }, [p]);

  const incompleteCount = useMemo(() => items.filter((i) => !i.done).length, [items]);

  return { items, incompleteCount };
}
