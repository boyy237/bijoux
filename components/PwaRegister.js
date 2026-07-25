"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // silencieux : l'app fonctionne aussi sans PWA active
      });
    }
  }, []);

  return null;
}
