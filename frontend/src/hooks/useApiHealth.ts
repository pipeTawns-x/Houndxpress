import { useEffect, useState } from "react";
import { getApiHealth } from "../services/health.ts";

export type ApiHealthStatus = "checking" | "online" | "offline";

/** Consulta `/api/v1/health/` una vez al montar. */
export function useApiHealth(): ApiHealthStatus {
  const [status, setStatus] = useState<ApiHealthStatus>("checking");

  useEffect(() => {
    const controller = new AbortController();
    void getApiHealth({ signal: controller.signal }).then((result) => {
      if (!controller.signal.aborted) setStatus(result);
    });
    return () => {
      controller.abort();
    };
  }, []);

  return status;
}
