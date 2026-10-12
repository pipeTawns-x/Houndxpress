import type { AdvanceInput, Guide, NewGuideInput } from "../domain/index.ts";
import { createSeedGuides } from "../services/demoData.ts";
import type { GuideRepository } from "../services/guideRepository.ts";

/** Repositorio falso: cada método es un `jest.fn` que la prueba configura. No tiene `reset`, como el de la API. */
export interface FakeRepository extends GuideRepository {
  list: jest.Mock<Promise<Guide[]>, []>;
  get: jest.Mock<Promise<Guide | null>, [string]>;
  create: jest.Mock<Promise<Guide>, [NewGuideInput]>;
  advance: jest.Mock<Promise<Guide>, [string, AdvanceInput]>;
}

export function createFakeRepository(): FakeRepository {
  return {
    list: jest.fn<Promise<Guide[]>, []>(() => Promise.resolve([])),
    get: jest.fn<Promise<Guide | null>, [string]>(() => Promise.resolve(null)),
    create: jest.fn<Promise<Guide>, [NewGuideInput]>(() => Promise.reject(new Error("create sin configurar"))),
    advance: jest.fn<Promise<Guide>, [string, AdvanceInput]>(() => Promise.reject(new Error("advance sin configurar"))),
  };
}

/** Las guías de ejemplo. Falla si faltan, para que las pruebas no tengan que tratar `undefined` en cada índice. */
export function seedGuides(): [Guide, Guide, ...Guide[]] {
  const [first, second, ...rest] = createSeedGuides();
  if (!first || !second) throw new Error("Sin guías de ejemplo");
  return [first, second, ...rest];
}

/** Promesa que la prueba resuelve o rechaza cuando quiere, para controlar en qué orden llegan las respuestas. */
export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
