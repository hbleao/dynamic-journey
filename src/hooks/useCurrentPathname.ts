"use client";

import { useEffect, useState } from "react";

export const NAVIGATE_EVENT = "app:navigate";

export function dispatchNavigate() {
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
}

export function useCurrentPathname() {
  const [pathname, setPathname] = useState(() =>
    typeof window !== "undefined" ? window.location.pathname : "/",
  );

  useEffect(() => {
    function sync() {
      setPathname(window.location.pathname);
    }
    window.addEventListener("popstate", sync);
    window.addEventListener(NAVIGATE_EVENT, sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener(NAVIGATE_EVENT, sync);
    };
  }, []);

  return pathname;
}
