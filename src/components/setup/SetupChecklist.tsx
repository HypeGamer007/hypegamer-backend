import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  STORAGE_DEMO_SEEDED,
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
  };
}

export function SetupChecklist() {
  const location = useLocation();
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
    ],
    [p]
  );

  return (
    <aside className={styles.root} aria-label="Setup checklist" data-testid="setup-checklist">
      <h2 className={styles.title}>Setup checklist</h2>
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
