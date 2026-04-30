import { Navigate } from "react-router-dom";
import { STORAGE_ONBOARDING_COMPLETE } from "@/lib/storageKeys";

export function RootRedirect() {
  const done = localStorage.getItem(STORAGE_ONBOARDING_COMPLETE) === "1";
  return <Navigate to={done ? "/home" : "/onboarding"} replace />;
}
