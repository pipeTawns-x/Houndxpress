const originals = new Map<string, PropertyDescriptor | undefined>();

/**
 * Sustituye una variable global durante una prueba (por ejemplo `fetch` o `matchMedia`, que jsdom no
 * implementa). Jest no trae un equivalente de `vi.stubGlobal`: `jest.spyOn` exige que la propiedad ya exista.
 * `src/test/setup.ts` llama a `unstubAllGlobals` al terminar cada prueba.
 */
export function stubGlobal(name: string, value: unknown): void {
  if (!originals.has(name)) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
  }
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true, enumerable: true });
}

/** Devuelve cada global sustituido a su valor original, o lo elimina si antes no existía. */
export function unstubAllGlobals(): void {
  for (const [name, descriptor] of originals) {
    if (descriptor) {
      Object.defineProperty(globalThis, name, descriptor);
    } else {
      Reflect.deleteProperty(globalThis, name);
    }
  }
  originals.clear();
}
