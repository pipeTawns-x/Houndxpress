import { createFakeRepository, seedGuides } from "../test/fakeRepository.ts";
import { createTestRepository } from "../test/renderApp.tsx";
import { fetchGuides } from "./guidesSlice.ts";
import {
  selectCanResetGuides,
  selectGuides,
  selectGuidesError,
  selectGuidesStatus,
  selectStageCounts,
} from "./selectors.ts";
import type { RootState } from "./store.ts";
import { createAppStore } from "./store.ts";

describe("createAppStore", () => {
  it("entrega el repositorio a los thunks como argumento extra", () => {
    const repository = createFakeRepository();
    const store = createAppStore(repository);
    const extra = store.dispatch((_dispatch, _getState, extraArgument) => extraArgument);
    expect(extra).toBe(repository);
  });

  it("arranca sin guías y sabe si el repositorio se puede restablecer", () => {
    const withoutReset = createAppStore(createFakeRepository()).getState().guides;
    expect(withoutReset).toMatchObject({ items: [], status: "idle", error: null, canReset: false });

    const demo = createAppStore(createTestRepository()).getState().guides;
    expect(demo.canReset).toBe(true);
  });

  it("cada almacén es independiente: leer en uno no carga las guías del otro", async () => {
    const first = createAppStore(createTestRepository());
    const second = createAppStore(createTestRepository());
    await first.dispatch(fetchGuides());
    expect(first.getState().guides.items).toHaveLength(8);
    expect(second.getState().guides).toMatchObject({ items: [], status: "idle" });
  });

  it("el estado se puede serializar: solo hay datos, nunca errores ni funciones", async () => {
    const store = createAppStore(createTestRepository());
    await store.dispatch(fetchGuides());
    const state = store.getState();
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
  });
});

describe("selectores", () => {
  async function loadedState(): Promise<RootState> {
    const store = createAppStore(createTestRepository());
    await store.dispatch(fetchGuides());
    return store.getState();
  }

  it("leen la lista, el estado, el error y si se puede restablecer", async () => {
    const state = await loadedState();
    expect(selectGuides(state)).toHaveLength(8);
    expect(selectGuidesStatus(state)).toBe("succeeded");
    expect(selectGuidesError(state)).toBeNull();
    expect(selectCanResetGuides(state)).toBe(true);
  });

  it("selectStageCounts da el total, las entregadas y las guías de cada etapa", async () => {
    const counts = selectStageCounts(await loadedState());
    expect(counts.total).toBe(8);
    expect(counts.delivered).toBe(2);
    expect(counts.byStage.map(({ stage, count }) => [stage.code, count])).toEqual([
      ["cargo_received", 1],
      ["vehicle_loaded", 2],
      ["vehicle_released", 1],
      ["vehicle_in_transit", 2],
      ["cargo_delivered", 2],
    ]);
  });

  it("selectStageCounts es memoizado: no recalcula si la lista es la misma", async () => {
    const state = await loadedState();
    const first = selectStageCounts(state);
    expect(selectStageCounts(state)).toBe(first);

    // Cambia otra parte del estado (por ejemplo, una lectura en curso), pero la lista es la misma.
    const refreshing: RootState = { ...state, guides: { ...state.guides, status: "loading" } };
    expect(selectStageCounts(refreshing)).toBe(first);

    // Una lista distinta sí se recalcula.
    const [, ...fewer] = seedGuides();
    const changed: RootState = { ...state, guides: { ...state.guides, items: fewer } };
    expect(selectStageCounts(changed)).not.toBe(first);
    expect(selectStageCounts(changed).total).toBe(7);
  });
});
