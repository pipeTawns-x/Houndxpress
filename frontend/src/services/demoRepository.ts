import {
  advanceGuide,
  createGuide,
  isGuide,
  isValidGuideNumber,
  lastUpdate,
  normalizeGuideNumber,
} from "../domain/index.ts";
import type { AdvanceInput, Guide, NewGuideInput } from "../domain/index.ts";
import { createSeedGuides } from "./demoData.ts";
import { RepositoryError } from "./guideRepository.ts";
import type { GuideRepository } from "./guideRepository.ts";

export const DEMO_STORAGE_KEY = "hx.guides.v1";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export interface DemoRepositoryOptions {
  /**
   * Devuelve el almacenamiento. Se evalúa en cada operación dentro de un
   * try/catch, porque acceder a `window.localStorage` puede lanzar una
   * excepción (modo privado, cookies bloqueadas, cuota llena).
   */
  getStorage?: () => StorageLike;
  /** Reloj inyectable para pruebas. */
  now?: () => Date;
}

function defaultStorage(): StorageLike {
  return window.localStorage;
}

function clone(guides: Guide[]): Guide[] {
  return JSON.parse(JSON.stringify(guides)) as Guide[];
}

/** Ejecuta una operación síncrona y devuelve su resultado como promesa (si lanza, la promesa se rechaza). */
function run<T>(operation: () => T): Promise<T> {
  return new Promise((resolve) => {
    resolve(operation());
  });
}

function parseStored(raw: string | null): Guide[] | null {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(isGuide)) {
      return parsed;
    }
  } catch {
    // JSON dañado: se trata igual que una lista inválida.
  }
  return null;
}

/**
 * Repositorio de demostración: guarda las guías en `localStorage` (clave
 * `hx.guides.v1`) y, si el almacenamiento no está disponible, en memoria.
 */
export function createDemoRepository(options: DemoRepositoryOptions = {}): GuideRepository {
  const getStorage = options.getStorage ?? defaultStorage;
  const now = options.now ?? (() => new Date());

  // Copia en memoria. Es la fuente de verdad cuando el almacenamiento falla.
  let memory: Guide[] | null = null;
  let storageFailed = false;

  function load(): Guide[] {
    if (!storageFailed) {
      try {
        const stored = parseStored(getStorage().getItem(DEMO_STORAGE_KEY));
        if (stored) return stored;
        const seeds = createSeedGuides();
        save(seeds);
        return seeds;
      } catch {
        storageFailed = true;
      }
    }
    memory ??= createSeedGuides();
    return clone(memory);
  }

  function save(guides: Guide[]): void {
    memory = clone(guides);
    if (storageFailed) return;
    try {
      getStorage().setItem(DEMO_STORAGE_KEY, JSON.stringify(guides));
    } catch {
      storageFailed = true;
    }
  }

  /** La hora del reloj, sin quedar antes del último evento de la guía (por si el reloj del equipo va atrasado). */
  function eventTime(guide: Guide): string {
    const current = now().toISOString();
    const previous = lastUpdate(guide);
    return Date.parse(current) < Date.parse(previous) ? previous : current;
  }

  return {
    list: () => run(load),

    get: (number) =>
      run(() => {
        if (!isValidGuideNumber(number)) return null;
        const normalized = normalizeGuideNumber(number);
        return load().find((guide) => guide.number === normalized) ?? null;
      }),

    create: (input: NewGuideInput) =>
      run(() => {
        const guide = createGuide(input, now().toISOString());
        const guides = load();
        if (guides.some((existing) => existing.number === guide.number)) {
          throw new RepositoryError("duplicate", "Ya existe una guía con ese número.");
        }
        save([guide, ...guides]);
        return guide;
      }),

    advance: (number: string, input: AdvanceInput) =>
      run(() => {
        const normalized = normalizeGuideNumber(number);
        const guides = load();
        const index = guides.findIndex((guide) => guide.number === normalized);
        const current = guides[index];
        if (current === undefined) {
          throw new RepositoryError("not_found", "No existe una guía con ese número.");
        }
        const updated = advanceGuide(current, { ...input, at: eventTime(current) });
        guides[index] = updated;
        save(guides);
        return updated;
      }),

    reset: () =>
      run(() => {
        const seeds = createSeedGuides();
        memory = seeds;
        try {
          getStorage().setItem(DEMO_STORAGE_KEY, JSON.stringify(seeds));
          storageFailed = false;
        } catch {
          storageFailed = true;
        }
      }),
  };
}
