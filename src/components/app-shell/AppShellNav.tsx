import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { NotificationsMenu } from "@/components/app-shell/NotificationsMenu";
import styles from "./AppShellNav.module.css";
import type { NavLinkProps } from "react-router-dom";

type NavItem = { to: string; label: string };

const pillClass: NavLinkProps["className"] = ({ isActive }) =>
  `${styles.pill} ${isActive ? styles.pillActive : ""}`;

const OPERATIONS: NavItem[] = [
  { to: "/competitions", label: "Competitions" },
  { to: "/matches", label: "Matches" },
  { to: "/sources", label: "Sources" },
];

const PLATFORM: NavItem[] = [
  { to: "/entities", label: "Entities" },
  { to: "/identity", label: "Identity" },
  { to: "/data-products", label: "Data products" },
  { to: "/widgets", label: "Widgets" },
  { to: "/developers", label: "Developers" },
  { to: "/integrator", label: "Integrator hub" },
];

const GOVERNANCE: NavItem[] = [
  { to: "/partners", label: "Partners" },
  { to: "/trust", label: "Trust" },
  { to: "/settings", label: "Settings" },
];

function pathMatchesPrefixes(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function NavDropdown({
  label,
  items,
  prefixes,
}: {
  label: string;
  items: NavItem[];
  prefixes: string[];
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const location = useLocation();
  const active = pathMatchesPrefixes(location.pathname, prefixes);

  useEffect(() => {
    const el = ref.current;
    if (el) el.open = false;
  }, [location.pathname, location.search]);

  return (
    <details ref={ref} className={styles.dropdown}>
      <summary className={`${styles.summary} ${active ? styles.summaryActive : ""}`}>
        {label}
      </summary>
      <div className={styles.panel}>
        <ul className={styles.panelList}>
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `${styles.panelLink} ${isActive ? styles.panelLinkActive : ""}`}
                onClick={() => {
                  if (ref.current) ref.current.open = false;
                }}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

export function AppShellNav() {
  return (
    <div className={styles.headerMain}>
      <nav className={styles.nav} aria-label="Primary">
        <div className={styles.navRow}>
          <NavLink to="/home" className={pillClass} end>
            Home
          </NavLink>

          <NavDropdown
            label="Operations"
            items={OPERATIONS}
            prefixes={["/competitions", "/matches", "/sources"]}
          />
          <NavDropdown
            label="Platform"
            items={PLATFORM}
            prefixes={["/entities", "/identity", "/data-products", "/widgets", "/developers", "/integrator"]}
          />
          <NavDropdown
            label="Governance"
            items={GOVERNANCE}
            prefixes={["/partners", "/trust", "/settings"]}
          />

          <NavLink to="/onboarding" className={pillClass}>
            Setup
          </NavLink>
        </div>
      </nav>
      <div className={styles.toolbar}>
        <NavLink
          to="/search"
          className={({ isActive }) => `${styles.searchLink} ${isActive ? styles.searchLinkActive : ""}`}
          aria-label="Search workspace (mock)"
        >
          <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
            />
          </svg>
        </NavLink>
        <NotificationsMenu />
      </div>
    </div>
  );
}
