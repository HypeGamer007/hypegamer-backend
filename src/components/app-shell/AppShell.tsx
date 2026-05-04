import { useEffect, useRef } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { AppShellNav } from "@/components/app-shell/AppShellNav";
import { emitSetupChanged } from "@/lib/setupEvents";
import { track } from "@/lib/telemetry";
import { STORAGE_ENVIRONMENT, STORAGE_GOVERNANCE_MODULES_VISITED } from "@/lib/storageKeys";
import styles from "./AppShell.module.css";

export function AppShell() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const openedRef = useRef(false);

  useEffect(() => {
    const path = location.pathname;
    if (path === "/partners" || path === "/trust" || path === "/settings") {
      if (localStorage.getItem(STORAGE_GOVERNANCE_MODULES_VISITED) !== "1") {
        localStorage.setItem(STORAGE_GOVERNANCE_MODULES_VISITED, "1");
        emitSetupChanged();
      }
    }
  }, [location.pathname]);

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
        <div className={styles.brandBlock}>
          <div className={styles.brand}>Hypegamer</div>
          <div className={styles.brandTag}>control plane</div>
        </div>
        <AppShellNav />
      </header>
      <main className={styles.mainCol}>
        <Outlet />
      </main>
    </div>
  );
}
