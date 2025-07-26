import { useState, useEffect, useCallback } from "react";
import { healthAPI } from "../services/api";

interface HealthStatus {
  status: "ok" | "error" | "checking";
  message?: string;
  timestamp?: string;
  service?: string;
}

export const useHealthCheck = (intervalMs: number = 30000) => {
  const [health, setHealth] = useState<HealthStatus>({ status: "checking" });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const checkHealth = useCallback(async () => {
    try {
      if (!navigator.onLine) {
        setHealth({ status: "error", message: "No internet connection" });
        return;
      }

      const response = await healthAPI.check();
      setHealth({
        status: response.status === "ok" ? "ok" : "error",
        message:
          response.status === "ok" ? "Backend connected" : "Backend error",
        timestamp: response.timestamp,
        service: response.service,
      });
    } catch (error) {
      setHealth({
        status: "error",
        message: "Backend unavailable",
      });
    }
  }, []);

  useEffect(() => {
    // Check immediately
    checkHealth();

    // Set up periodic health checks
    const interval = setInterval(checkHealth, intervalMs);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      checkHealth();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHealth({ status: "error", message: "No internet connection" });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [checkHealth, intervalMs]);

  return { health, isOnline, checkHealth };
};
