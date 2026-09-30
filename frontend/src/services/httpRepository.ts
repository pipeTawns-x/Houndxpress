import { isGuide, normalizeGuideNumber } from "../domain/index.ts";
import type { AdvanceInput, Guide, NewGuideInput } from "../domain/index.ts";
import { RepositoryError } from "./guideRepository.ts";
import type { GuideRepository } from "./guideRepository.ts";

export const GUIDES_ENDPOINT = "/api/v1/guides/";

export interface HttpRepositoryOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const entry = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}

async function readDetail(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.json()) as unknown;
    if (typeof body === "object" && body !== null && "detail" in body) {
      const { detail } = body;
      return typeof detail === "string" ? detail : undefined;
    }
  } catch {
    // Sin cuerpo JSON: se usa el mensaje genérico.
  }
  return undefined;
}

/**
 * Repositorio que habla con la API Django (`/api/v1/guides/`), prevista para
 * el módulo M64. Se activa con `VITE_DATA_SOURCE=api`.
 */
export function createHttpRepository(options: HttpRepositoryOptions = {}): GuideRepository {
  const baseUrl = options.baseUrl ?? GUIDES_ENDPOINT;

  function request(path: string, init: RequestInit = {}): Promise<Response> {
    const method = init.method ?? "GET";
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (method !== "GET") {
      headers.set("Content-Type", "application/json");
      // Django exige el token CSRF en las escrituras con sesión.
      const csrf = readCookie("csrftoken");
      if (csrf) headers.set("X-CSRFToken", csrf);
    }
    const fetchImpl = options.fetchImpl ?? fetch;
    return fetchImpl(`${baseUrl}${path}`, { ...init, method, headers, credentials: "same-origin" }).catch(
      () => {
        throw new RepositoryError("network", "No se pudo conectar con la API.");
      },
    );
  }

  async function failure(response: Response, fallback: string): Promise<RepositoryError> {
    const detail = await readDetail(response);
    if (response.status === 404) return new RepositoryError("not_found", detail ?? fallback, 404);
    if (response.status === 409) return new RepositoryError("duplicate", detail ?? fallback, 409);
    if (response.status === 400 || response.status === 422) {
      return new RepositoryError("rejected", detail ?? fallback, response.status);
    }
    return new RepositoryError("http", detail ?? `${fallback} (código ${String(response.status)}).`, response.status);
  }

  async function parseGuide(response: Response): Promise<Guide> {
    const body = await parseJson(response);
    if (!isGuide(body)) {
      throw new RepositoryError("invalid_response", "La API respondió con una guía que no se reconoce.");
    }
    return body;
  }

  async function parseJson(response: Response): Promise<unknown> {
    try {
      return (await response.json()) as unknown;
    } catch {
      throw new RepositoryError("invalid_response", "La API no respondió con JSON.");
    }
  }

  function post(path: string, body: unknown): Promise<Response> {
    return request(path, { method: "POST", body: JSON.stringify(body) });
  }

  return {
    async list() {
      const response = await request("");
      if (!response.ok) throw await failure(response, "No se pudo obtener la lista de guías");
      const body = await parseJson(response);
      // DRF puede paginar: { results: [...] }.
      const items: unknown =
        typeof body === "object" && body !== null && "results" in body ? body.results : body;
      if (!Array.isArray(items) || !items.every(isGuide)) {
        throw new RepositoryError("invalid_response", "La API respondió con una lista que no se reconoce.");
      }
      return items;
    },

    async get(number) {
      const response = await request(`${encodeURIComponent(normalizeGuideNumber(number))}/`);
      if (response.status === 404) return null;
      if (!response.ok) throw await failure(response, "No se pudo consultar la guía");
      return parseGuide(response);
    },

    async create(input: NewGuideInput) {
      const response = await post("", { ...input, number: normalizeGuideNumber(input.number) });
      if (!response.ok) throw await failure(response, "No se pudo registrar la guía");
      return parseGuide(response);
    },

    async advance(number: string, input: AdvanceInput) {
      const path = `${encodeURIComponent(normalizeGuideNumber(number))}/advance/`;
      const response = await post(path, input);
      if (!response.ok) throw await failure(response, "No se pudo avanzar la guía");
      return parseGuide(response);
    },
  };
}
