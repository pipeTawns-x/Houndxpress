import { createHttpRepository } from "./httpRepository.ts";
import type { GuideRepository } from "./guideRepository.ts";
export type DataSource = "api";
export function resolveDataSource(_value: string | undefined): DataSource { void _value; return "api"; }
export function createGuideRepository(_source: DataSource): GuideRepository { void _source; return createHttpRepository(); }
export const dataSource: DataSource = "api";
export const isDemoData = false;
export const guideRepository = createHttpRepository();
