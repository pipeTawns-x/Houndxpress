import type { AdvanceInput, Guide, NewGuideInput } from "../domain/index.ts";

/**
 * Acceso a datos de guías. La interfaz tiene dos implementaciones:
 * `demoRepository` (localStorage) y `httpRepository` (API Django, módulo M64).
 */
export interface GuideRepository {
  list(): Promise<Guide[]>;
  /** Devuelve `null` si la guía no existe. */
  get(number: string): Promise<Guide | null>;
  create(input: NewGuideInput): Promise<Guide>;
  advance(number: string, input: AdvanceInput): Promise<Guide>;
  /** Solo existe en la implementación de demostración. */
  reset?(): Promise<void>;
}

export type RepositoryErrorCode =
  | "not_found"
  | "duplicate"
  /** La API rechazó la operación (por ejemplo, saltar una etapa). */
  | "rejected"
  | "network"
  | "http"
  | "invalid_response";

export class RepositoryError extends Error {
  readonly code: RepositoryErrorCode;
  readonly status: number | undefined;

  constructor(code: RepositoryErrorCode, message: string, status?: number) {
    super(message);
    this.name = "RepositoryError";
    this.code = code;
    this.status = status;
  }
}

export function isRepositoryError(error: unknown): error is RepositoryError {
  return error instanceof RepositoryError;
}
