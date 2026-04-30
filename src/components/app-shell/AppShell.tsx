import { useEffect, useRef } from "react";
import { NavLink, Outlet, useSearchParams } from "react-router-dom";
import { SetupChecklist } from "@/components/setup/SetupChecklist";
import { track } from "@/lib/telemetry";
import { STORAGE_ENVIRONMENT } from "@/lib/storageKeys";
import styles from "./AppShell.module.css";

const nav = [
  { to: "/home", label: "Home" },
  { to: "/competitions", label: "Competitions" },
  { to: "/matches", label: "Matches" },
  { to: "/sources", label: "Sources" },
  { to: "/entities", label: "Entities" },
  { to: "/identity", label: "Identity" },
  { to: "/data-products", label: "Data products" },
  { to: "/widgets", label: "Widgets" },
  { to: "/developers", label: "Developers" },
  { to: "/onboarding", label: "Setup" },
];

export function AppShell() {
  const [searchParams] = useSearchParams();
  const openedRef = useRef(false);

  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    const env = localStorage.getItem(STORAGE_ENVIRONMENT) ?? "unspecified";
    track("workspace_opened", {
      workspaceId: "demo_workspace",
      projectId: "demo_project",
      role: searchParams.get("role") ?? "unspecified",
      environment: env,
    });
  }, [searchParams]);

  return (
    <div className={styles.root} data-testid="app-shell">
      <header className={styles.header}>
        <div className={styles.brand}>Hypegamer</div>
        <nav className={styles.nav} aria-label="Primary">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.linkActive : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <div className={styles.shellBody}>
        <aside className={styles.checklistCol}>
          <SetupChecklist />
        </aside>
        <main className={styles.mainCol}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
