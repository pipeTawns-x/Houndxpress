export type ApiHealth = "online" | "offline";

export const HEALTH_ENDPOINT = "/api/v1/health/";
export const HEALTH_TIMEOUT_MS = 4000;

export interface HealthOptions {
  timeoutMs?: number;
  /** Para cancelar desde un efecto de React al desmontar. */
  signal?: AbortSignal;
}

/**
 * Consulta `GET /api/v1/health/` y espera `{"status": "ok", "database": "ok"}`.
 * Cualquier otra cosa (error de red, código distinto de 2xx, respuesta que no
 * es JSON, tiempo agotado) cuenta como "offline".
 */
export async function getApiHealth(options: HealthOptions = {}): Promise<ApiHealth> {
  const { timeoutMs = HEALTH_TIMEOUT_MS, signal } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  const abortFromOutside = () => {
    controller.abort();
  };
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", abortFromOutside, { once: true });

  try {
    const response = await fetch(HEALTH_ENDPOINT, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return "offline";
    const body = (await response.json()) as unknown;
    if (
      typeof body === "object" &&
      body !== null &&
      "status" in body &&
      "database" in body &&
      body.status === "ok" &&
      body.database === "ok"
    ) {
      return "online";
    }
    return "offline";
  } catch {
    return "offline";
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abortFromOutside);
  }
}
