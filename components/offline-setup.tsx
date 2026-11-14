"use client";

import { useEffect, useState } from "react";

export function OfflineSetup() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").then(() => navigator.serviceWorker.ready)
        .then((registration) => registration.active?.postMessage({ type: "CACHE_WORKOUTS" }))
        .catch(() => {});
    }
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return offline ? (
    <div role="status" className="mb-3 rounded-xl bg-amber-950 p-3 text-sm text-amber-200">
      Offline. Your workout is saved on this device. Reconnect to finish and save it to your history.
    </div>
  ) : null;
}
