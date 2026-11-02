import { isStageCode } from "../domain/stages.ts";
import { isValidGuideNumber, normalizeGuideNumber } from "../domain/guideNumber.ts";
import type { PublicTrackingResult } from "../domain/types.ts";
import { createApiClient, readJson, record } from "./apiClient.ts";
import { RepositoryError } from "./guideRepository.ts";

export function createPublicTracker(fetchImpl?: typeof fetch) {
  const api = createApiClient(fetchImpl);
  return async (numbers: readonly string[]): Promise<PublicTrackingResult[]> => {
    const normalized = [...new Set(numbers.map(normalizeGuideNumber))];
    if (!normalized.length || normalized.length > 10 || !normalized.every(isValidGuideNumber))
      throw new RepositoryError("rejected", "Escribe de 1 a 10 números de guía válidos.");
    const query = new URLSearchParams({ numbers: normalized.join(",") });
    const data = await readJson(await api.request(`/api/v1/public/track/?${query.toString()}`));
    if (!Array.isArray(data) || data.length !== normalized.length)
      throw new RepositoryError("invalid_response", "El resultado del rastreo no es válido.");
    return normalized.map((trackingNumber) => {
      const item: unknown = data.find(
        (entry: unknown) => record(entry) && entry.trackingNumber === trackingNumber,
      );
      if (!record(item))
        throw new RepositoryError("invalid_response", "Falta una guía en la respuesta del rastreo.");
      if (item.found === false) return { trackingNumber, found: false };
      if (!isStageCode(item.currentStatus) || !Array.isArray(item.history) || !item.history.length)
        throw new RepositoryError("invalid_response", "La etapa del envío no es válida.");
      const history = item.history.map((event: unknown) => {
        if (
          !record(event) ||
          !isStageCode(event.stage) ||
          typeof event.timestamp !== "string" ||
          Number.isNaN(Date.parse(event.timestamp)) ||
          typeof event.location !== "string"
        )
          throw new RepositoryError("invalid_response", "El historial del envío no es válido.");
        return { stage: event.stage, timestamp: event.timestamp, location: event.location };
      });
      if (history.at(-1)?.stage !== item.currentStatus)
        throw new RepositoryError("invalid_response", "El historial y la etapa del envío no coinciden.");
      return { trackingNumber, currentStatus: item.currentStatus, history };
    });
  };
}
export const publicTracker = createPublicTracker();
