import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { STORAGE_DEMO_SEEDED } from "@/lib/storageKeys";
import { subscribeSetupChanged } from "@/lib/setupEvents";

function read(): boolean {
  return localStorage.getItem(STORAGE_DEMO_SEEDED) === "1";
}

export function useDemoSeeded(): boolean {
  const location = useLocation();
  const [seeded, setSeeded] = useState(() => read());

  useEffect(() => {
    setSeeded(read());
  }, [location.pathname, location.search]);

  useEffect(() => {
    return subscribeSetupChanged(() => setSeeded(read()));
  }, []);

  return seeded;
}
