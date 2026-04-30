import { STORAGE_ENVIRONMENT } from "@/lib/storageKeys";
import styles from "./EnvironmentBadge.module.css";

export function EnvironmentBadge() {
  const env = localStorage.getItem(STORAGE_ENVIRONMENT) ?? "sandbox";
  const label = env === "live" ? "Live" : "Sandbox";
  return (
    <span className={`${styles.badge} ${env === "live" ? styles.live : styles.sandbox}`}>
      {label}
    </span>
  );
}
