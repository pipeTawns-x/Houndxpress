import { RepositoryError } from "./guideRepository.ts";
import { isStageCode } from "../domain/stages.ts";

export async function readJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    throw new RepositoryError("invalid_response", "La API no respondió con JSON válido.");
  }
}
export function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
export async function apiFailure(response: Response): Promise<RepositoryError> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  const code = record(body) ? body.code : undefined;
  const kind =
    response.status === 409
      ? code === "invalid_transition"
        ? "invalid_transition"
        : "duplicate"
      : response.status === 404
        ? "not_found"
        : response.status === 403
          ? "unauthorized"
          : response.status === 400 || response.status === 422
            ? "rejected"
            : "http";
  const current = record(body) && isStageCode(body.currentStatus) ? body.currentStatus : undefined;
  return new RepositoryError(
    kind,
    response.status === 403
      ? "Tu sesión no permite esta acción. Recarga la página o vuelve a iniciar sesión."
      : response.status === 409
        ? kind === "invalid_transition"
          ? "Conflicto (409): la etapa cambió. Actualiza la guía antes de volver a avanzar."
          : "Conflicto (409): ya existe una guía con ese número."
        : response.status === 404
          ? "No encontramos ese recurso. Revisa el número de guía."
          : response.status === 429
            ? "Has realizado muchas consultas. Espera un momento antes de reintentar."
            : response.status === 400 || response.status === 422
              ? "Revisa los datos del formulario e inténtalo de nuevo."
              : "No pudimos completar la operación. Inténtalo de nuevo más tarde.",
    response.status,
    current,
  );
}
export function createApiClient(fetchImpl: typeof fetch = (...args) => fetch(...args)) {
  async function request(url: string, init: RequestInit = {}): Promise<Response> {
    let response: Response;
    try {
      response = await fetchImpl(url, {
        ...init,
        credentials: "same-origin",
        headers: { Accept: "application/json", ...init.headers },
      });
    } catch {
      throw new RepositoryError(
        "network",
        "Sin conexión con la API. Revisa tu conexión e inténtalo de nuevo.",
      );
    }
    if (!response.ok) throw await apiFailure(response);
    return response;
  }
  async function write(url: string, method: string, body?: unknown) {
    // Fetch a fresh body token before each write, including after login rotates CSRF.
    const token = await readJson(await request("/api/v1/auth/csrf/"));
    if (!record(token) || typeof token.csrfToken !== "string" || !token.csrfToken) {
      throw new RepositoryError(
        "invalid_response",
        "No se pudo obtener la protección de sesión. Inténtalo de nuevo.",
      );
    }
    return request(url, {
      method,
      headers: { "Content-Type": "application/json", "X-CSRFToken": token.csrfToken },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  }
  return { request, write };
}
