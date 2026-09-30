import { env } from "../config/env.ts";
import { createDemoRepository } from "./demoRepository.ts";
import { createHttpRepository } from "./httpRepository.ts";
import type { GuideRepository } from "./guideRepository.ts";

export type DataSource = "demo" | "api";

/** `VITE_DATA_SOURCE=api` activa la API Django; cualquier otro valor usa los datos de demostración. */
export function resolveDataSource(value: string | undefined): DataSource {
  return value === "api" ? "api" : "demo";
}

export function createGuideRepository(source: DataSource): GuideRepository {
  return source === "api" ? createHttpRepository() : createDemoRepository();
}

export const dataSource: DataSource = resolveDataSource(env.dataSource);
export const isDemoData = dataSource === "demo";

/** Repositorio que usa la aplicación. */
export const guideRepository: GuideRepository = createGuideRepository(dataSource);
