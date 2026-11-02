import type { AdvanceInput, Guide, NewGuideInput, StageCode, ApiGuideSummary } from "../domain/index.ts";

/**
 * Acceso a datos de guías. La interfaz tiene dos implementaciones:
 * `httpRepository` (producción) y `demoRepository` (pruebas).
 */
export interface GuideRepository {
  list(): Promise<Guide[]>;
  archive?(number: string): Promise<void>;
  listArchived?(): Promise<Guide[]>;
  summary?(): Promise<ApiGuideSummary>;
  /** Devuelve `null` si la guía no existe. */
  get(number: string): Promise<Guide | null>;
  create(input: NewGuideInput): Promise<Guide>;
  advance(number: string, input: AdvanceInput): Promise<Guide>;
  /** Solo existe en la implementación de demostración. */
  reset?(): Promise<void>;
}

export type RepositoryErrorCode =
  | "invalid_transition"
  | "unauthorized"
  | "not_found"
  | "duplicate"
  /** La API rechazó la operación (por ejemplo, saltar una etapa). */
  | "rejected"
  | "network"
  | "http"
  | "invalid_response";

export class RepositoryError extends Error {
  readonly code: RepositoryErrorCode;
  readonly currentStatus: StageCode | undefined;
  readonly status: number | undefined;

  constructor(code: RepositoryErrorCode, message: string, status?: number, currentStatus?: StageCode) {
    super(message);
    this.name = "RepositoryError";
    this.code = code;
    this.status = status;
    this.currentStatus = currentStatus;
  }
}

export function isRepositoryError(error: unknown): error is RepositoryError {
  return error instanceof RepositoryError;
}
