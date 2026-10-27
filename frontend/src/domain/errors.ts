import type { FieldErrors, NewGuideInput } from "./types.ts";

export type DomainErrorCode =
  | "already_delivered"
  | "invalid_input"
  | "invalid_guide_number"
  | "out_of_order";

/** Error de una regla de negocio. Lleva un código estable para poder traducirlo en la interfaz. */
export class DomainError extends Error {
  readonly code: DomainErrorCode;
  readonly fieldErrors: FieldErrors<NewGuideInput>;

  constructor(
    code: DomainErrorCode,
    message: string,
    fieldErrors: FieldErrors<NewGuideInput> = {},
  ) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}
