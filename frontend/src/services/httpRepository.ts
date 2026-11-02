import { isGuide, normalizeGuideNumber } from "../domain/index.ts";
import type { Guide, ApiGuideSummary } from "../domain/types.ts";
import { RepositoryError } from "./guideRepository.ts";
import type { GuideRepository } from "./guideRepository.ts";
import { createApiClient, readJson, record } from "./apiClient.ts";

export const GUIDES_ENDPOINT = "/api/v1/guides/";
export interface HttpRepositoryOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}
export function createHttpRepository(options: HttpRepositoryOptions = {}): GuideRepository {
  const base = options.baseUrl ?? GUIDES_ENDPOINT;
  const api = createApiClient(options.fetchImpl);
  const path = (number: string) => `${base}${encodeURIComponent(normalizeGuideNumber(number))}/`;
  async function guide(response: Response): Promise<Guide> {
    const data = await readJson(response);
    if (!isGuide(data))
      throw new RepositoryError("invalid_response", "La API respondió con una guía que no se reconoce.");
    return data;
  }
  return {
    async list() {
      const items: Guide[] = [];
      let url: string | null = base;
      const visited = new Set<string>();
      while (url) {
        const parsed = new URL(url, window.location.origin);
        const expected = new URL(base, window.location.origin);
        if (
          parsed.origin !== expected.origin ||
          parsed.pathname !== expected.pathname ||
          visited.has(parsed.href)
        ) {
          throw new RepositoryError("invalid_response", "La paginación de la API no es válida.");
        }
        visited.add(parsed.href);
        const data = await readJson(await api.request(url));
        const results = record(data) ? data.results : data;
        if (!Array.isArray(results) || !results.every(isGuide))
          throw new RepositoryError("invalid_response", "La API respondió con una lista que no se reconoce.");
        items.push(...results);
        url = record(data) && typeof data.next === "string" ? data.next : null;
      }
      return items;
    },
    async get(number) {
      try {
        return await guide(await api.request(path(number)));
      } catch (error) {
        if (error instanceof RepositoryError && error.status === 404) return null;
        throw error;
      }
    },
    async create(input) {
      return guide(
        await api.write(base, "POST", {
          ...input,
          trackingNumber: normalizeGuideNumber(input.trackingNumber),
        }),
      );
    },
    async advance(number, input) {
      if (!input.stage) throw new RepositoryError("rejected", "Indica la siguiente etapa de la guía.");
      return guide(await api.write(path(number), "PUT", { stage: input.stage, location: input.location }));
    },
    async archive(number) {
      await api.write(path(number), "DELETE");
    },
    listArchived() {
      return Promise.reject(
        new RepositoryError(
          "rejected",
          "La API todavía no permite consultar el archivo. Las guías archivadas conservan su historial en el servidor.",
        ),
      );
    },
    async summary() {
      const data = await readJson(await api.request(`${base}summary/`));
      const fields = ["total", "active", "inTransit", "delivered", "withAlert"] as const;
      if (
        !record(data) ||
        !fields.every((key) => typeof data[key] === "number" && Number.isInteger(data[key]) && data[key] >= 0)
      )
        throw new RepositoryError("invalid_response", "El resumen de la API no es válido.");
      return data as unknown as ApiGuideSummary;
    },
  };
}
