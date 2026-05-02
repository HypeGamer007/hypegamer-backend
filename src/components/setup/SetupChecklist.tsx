import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { runFullDemoTour } from "@/lib/runFullDemoTour";
import {
  STORAGE_DEMO_SEEDED,
  STORAGE_GOVERNANCE_MODULES_VISITED,
  STORAGE_INTEGRATOR_HUB_VISITED,
  STORAGE_ONBOARDING_COMPLETE,
  STORAGE_SOURCES_VISITED,
} from "@/lib/storageKeys";
import { subscribeSetupChanged } from "@/lib/setupEvents";
import styles from "./SetupChecklist.module.css";

function readProgress() {
  return {
    onboardingDone: localStorage.getItem(STORAGE_ONBOARDING_COMPLETE) === "1",
    demoSeeded: localStorage.getItem(STORAGE_DEMO_SEEDED) === "1",
    sourcesVisited: localStorage.getItem(STORAGE_SOURCES_VISITED) === "1",
    integratorHubVisited: localStorage.getItem(STORAGE_INTEGRATOR_HUB_VISITED) === "1",
    governanceModulesVisited: localStorage.getItem(STORAGE_GOVERNANCE_MODULES_VISITED) === "1",
  };
}

export function SetupChecklist() {
  const location = useLocation();
  const navigate = useNavigate();
  const [p, setP] = useState(readProgress);

  useEffect(() => {
    setP(readProgress());
  }, [location.pathname]);

  useEffect(() => {
    return subscribeSetupChanged(() => setP(readProgress()));
  }, []);

  const items = useMemo(
    () => [
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
        hint: "Preview lists, provenance labels, and empty-state alternatives.",
        done: p.demoSeeded,
        to: "/home",
        linkLabel: p.demoSeeded ? "View home" : "Load from Home",
      },
      {
        id: "integrator",
        label: "Preview Integrator hub (optional)",
        hint: "Pipeline log, field map, plugin readiness, and demo ROI — after sandbox is loaded.",
        done: p.integratorHubVisited,
        to: "/integrator",
        linkLabel: "Open Integrator hub",
      },
      {
        id: "governance",
        label: "Review governance (optional)",
        hint: "Partner grants, trust signals, workspace audit feed — mock fixtures until APIs ship.",
        done: p.governanceModulesVisited,
        to: "/partners",
        linkLabel: "Open Partners",
      },
    ],
    [p]
  );

  return (
    <aside className={styles.root} aria-label="Setup checklist" data-testid="setup-checklist">
      <h2 className={styles.title}>Setup checklist</h2>
      <div className={styles.tourBlock}>
        <p className={styles.tourLead}>
          <strong>MOBA demo tour</strong> — seeds sandbox data, marks checklist progress, and adds a sample webhook
          delivery so Developers and Integrator feel “live” without backends.
        </p>
        <button
          type="button"
          className={styles.tourBtn}
          data-testid="setup-run-full-demo-tour"
          onClick={() => {
            runFullDemoTour();
            navigate("/home");
          }}
        >
          Run full MOBA demo tour
        </button>
      </div>
      <ol className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <span
              className={`${styles.check} ${item.done ? styles.checkDone : ""}`}
              aria-hidden
            >
              {item.done ? "✓" : ""}
            </span>
            <div>
              <p className={styles.label}>{item.label}</p>
              <p className={styles.hint}>{item.hint}</p>
              <Link className={styles.link} to={item.to}>
                {item.linkLabel}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
