import { DomainError, isDomainError } from "../domain/index.ts";
import type { Guide, NewGuideInput } from "../domain/index.ts";
import { RepositoryError, isRepositoryError } from "../services/guideRepository.ts";
import { createFakeRepository, deferred, seedGuides } from "../test/fakeRepository.ts";
import { createTestRepository } from "../test/renderApp.tsx";
import {
  advanceGuide,
  createGuide,
  createInitialGuidesState,
  fetchGuides,
  guidesReducer,
  resetGuides,
} from "./guidesSlice.ts";
import type { GuidesState } from "./guidesSlice.ts";
import { createAppStore } from "./store.ts";

const NEW_GUIDE: NewGuideInput = {
  number: "2100000000000001",
  origin: "Laredo, TX",
  destination: "Monterrey, N.L.",
  recipient: "Ana Ruiz",
  service: "standard",
};

/** Estado con la lista ya leída, obtenido con las mismas acciones que produce la aplicación. */
function loadedState(guides: Guide[], requestId = "r1"): GuidesState {
  const loading = guidesReducer(createInitialGuidesState(), fetchGuides.pending(requestId, undefined));
  return guidesReducer(loading, fetchGuides.fulfilled(guides, requestId, undefined));
}

/** Estados por los que pasa el almacén, sin repetir el mismo dos veces seguidas. */
function recordStatuses(store: ReturnType<typeof createAppStore>) {
  const seen = [store.getState().guides.status];
  store.subscribe(() => {
    const { status } = store.getState().guides;
    if (seen.at(-1) !== status) seen.push(status);
  });
  return seen;
}

describe("guidesSlice: reducer", () => {
  it("empieza sin guías, sin leer y sin error", () => {
    expect(guidesReducer(undefined, { type: "@@init" })).toEqual({
      items: [],
      status: "idle",
      error: null,
      canReset: false,
      latestReadId: null,
    });
  });

  it("una lectura que empieza pasa a 'loading', borra el error y anota su identificador", () => {
    const failed = guidesReducer(
      guidesReducer(createInitialGuidesState(), fetchGuides.pending("r1", undefined)),
      fetchGuides.rejected(null, "r1", undefined, new Error("Sin conexión")),
    );
    expect(failed.status).toBe("failed");

    const next = guidesReducer(failed, fetchGuides.pending("r2", undefined));
    expect(next).toMatchObject({ status: "loading", error: null, latestReadId: "r2" });
  });

  it("una lectura en segundo plano no cambia el estado si ya hay una lista que mostrar", () => {
    const loaded = loadedState(seedGuides());
    const next = guidesReducer(loaded, fetchGuides.pending("r2", { background: true }));
    expect(next.status).toBe("succeeded");
    expect(next.items).toBe(loaded.items);
    expect(next.latestReadId).toBe("r2");
  });

  it("una lectura en segundo plano sí pasa a 'loading' si todavía no hay lista o la última falló", () => {
    const first = guidesReducer(createInitialGuidesState(), fetchGuides.pending("r1", { background: true }));
    expect(first.status).toBe("loading");

    const failed = guidesReducer(first, fetchGuides.rejected(null, "r1", { background: true }, new Error("x")));
    const retry = guidesReducer(failed, fetchGuides.pending("r2", { background: true }));
    expect(retry).toMatchObject({ status: "loading", error: null });
  });

  it("guarda exactamente lo que devolvió el repositorio, en su orden, y borra el error", () => {
    const guides = seedGuides();
    const reversed = [...guides].reverse();
    const state = loadedState(reversed);
    expect(state).toMatchObject({ status: "succeeded", error: null });
    expect(state.items.map((guide) => guide.number)).toEqual(reversed.map((guide) => guide.number));
  });

  it("descarta la respuesta de una lectura que ya no es la última", () => {
    const guides = seedGuides();
    const current = guidesReducer(loadedState(guides, "r1"), fetchGuides.pending("r2", undefined));
    const late = guidesReducer(current, fetchGuides.fulfilled([], "r1", undefined));
    expect(late).toBe(current);
    const lateFailure = guidesReducer(current, fetchGuides.rejected(null, "r1", undefined, new Error("tarde")));
    expect(lateFailure).toBe(current);
  });

  it("una lectura fallida pasa a 'failed' con el mensaje del error y conserva la lista anterior", () => {
    const loaded = loadedState(seedGuides());
    const loading = guidesReducer(loaded, fetchGuides.pending("r2", undefined));
    const failed = guidesReducer(loading, fetchGuides.rejected(null, "r2", undefined, new Error("Sin conexión con la API")));
    expect(failed).toMatchObject({ status: "failed", error: "Sin conexión con la API" });
    expect(failed.items).toBe(loaded.items);
  });

  it("si lo que se rechazó no es un Error, el mensaje es genérico", () => {
    const loading = guidesReducer(createInitialGuidesState(), fetchGuides.pending("r1", undefined));
    const failed = guidesReducer(loading, fetchGuides.rejected(null, "r1", undefined, "texto suelto"));
    expect(failed.error).toBe("Ocurrió un error inesperado.");
  });

  it("las escrituras no tocan la lista: solo la lectura que las sigue la actualiza", () => {
    const loaded = loadedState(seedGuides());
    const [first] = loaded.items;
    if (!first) throw new Error("Sin guías de ejemplo");
    expect(guidesReducer(loaded, createGuide.pending("w1", NEW_GUIDE))).toBe(loaded);
    expect(guidesReducer(loaded, createGuide.fulfilled(first, "w1", NEW_GUIDE))).toBe(loaded);
    expect(guidesReducer(loaded, advanceGuide.fulfilled(first, "w2", { number: first.number, input: { location: "x" } }))).toBe(loaded);
    expect(guidesReducer(loaded, resetGuides.fulfilled(undefined, "w3"))).toBe(loaded);
  });
});

describe("guidesSlice: fetchGuides", () => {
  it("lee la lista del repositorio y pasa por 'loading' antes de 'succeeded'", async () => {
    const repository = createFakeRepository();
    const guides = seedGuides();
    repository.list.mockResolvedValue(guides);
    const store = createAppStore(repository);
    const statuses = recordStatuses(store);

    await store.dispatch(fetchGuides());

    expect(statuses).toEqual(["idle", "loading", "succeeded"]);
    expect(store.getState().guides.items).toEqual(guides);
    expect(repository.list).toHaveBeenCalledTimes(1);
  });

  it("si el repositorio falla pasa a 'failed' con su mensaje, y una lectura posterior lo recupera", async () => {
    const repository = createFakeRepository();
    repository.list.mockRejectedValueOnce(new Error("Sin conexión con la API"));
    const store = createAppStore(repository);

    await store.dispatch(fetchGuides());
    expect(store.getState().guides).toMatchObject({ status: "failed", error: "Sin conexión con la API", items: [] });

    repository.list.mockResolvedValueOnce(seedGuides());
    await store.dispatch(fetchGuides());
    expect(store.getState().guides).toMatchObject({ status: "succeeded", error: null });
    expect(store.getState().guides.items).toHaveLength(8);
  });

  it("si una lectura falla cuando ya había lista, conserva las guías y marca el error", async () => {
    const repository = createFakeRepository();
    repository.list.mockResolvedValueOnce(seedGuides()).mockRejectedValueOnce(new Error("Se cayó la API"));
    const store = createAppStore(repository);

    await store.dispatch(fetchGuides());
    await store.dispatch(fetchGuides({ background: true }));

    expect(store.getState().guides).toMatchObject({ status: "failed", error: "Se cayó la API" });
    expect(store.getState().guides.items).toHaveLength(8);
  });

  it("solo cuenta la última lectura aunque la anterior conteste después", async () => {
    const repository = createFakeRepository();
    const older = deferred<Guide[]>();
    const newer = deferred<Guide[]>();
    repository.list.mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
    const store = createAppStore(repository);
    const [first, second] = seedGuides();

    const firstRead = store.dispatch(fetchGuides());
    const secondRead = store.dispatch(fetchGuides());
    newer.resolve([second]);
    await secondRead;
    older.resolve([first]);
    await firstRead;

    expect(store.getState().guides.items.map((guide) => guide.number)).toEqual([second.number]);
  });

  it("una lectura anterior que falla tarde no borra una lectura buena", async () => {
    const repository = createFakeRepository();
    const older = deferred<Guide[]>();
    repository.list.mockReturnValueOnce(older.promise).mockResolvedValueOnce(seedGuides());
    const store = createAppStore(repository);

    const firstRead = store.dispatch(fetchGuides());
    await store.dispatch(fetchGuides());
    older.reject(new Error("tarde"));
    await firstRead;

    expect(store.getState().guides).toMatchObject({ status: "succeeded", error: null });
    expect(store.getState().guides.items).toHaveLength(8);
  });
});

describe("guidesSlice: createGuide", () => {
  it("crea con el repositorio, vuelve a leer la lista y resuelve con la guía creada", async () => {
    const repository = createFakeRepository();
    const seeds = seedGuides();
    const created: Guide = { ...seeds[0], number: NEW_GUIDE.number, recipient: NEW_GUIDE.recipient };
    repository.list.mockResolvedValueOnce(seeds).mockResolvedValueOnce([created, ...seeds]);
    repository.create.mockResolvedValue(created);
    const store = createAppStore(repository);
    await store.dispatch(fetchGuides());
    const statuses = recordStatuses(store);

    const result = await store.dispatch(createGuide(NEW_GUIDE)).unwrap();

    expect(result).toEqual(created);
    expect(repository.create).toHaveBeenCalledWith(NEW_GUIDE);
    expect(repository.list).toHaveBeenCalledTimes(2);
    // El orden de la lista es el que devuelve el repositorio, no el que impondría el reducer.
    expect(store.getState().guides.items.map((guide) => guide.number)).toEqual([created.number, ...seeds.map((guide) => guide.number)]);
    // La lectura que sigue a la escritura no hace parpadear la pantalla con "cargando".
    expect(statuses).toEqual(["succeeded"]);
  });

  it("si el repositorio rechaza, la promesa falla con el error original y no se vuelve a leer", async () => {
    const repository = createFakeRepository();
    repository.list.mockResolvedValue(seedGuides());
    const error = new DomainError("invalid_input", "Revisa los datos.", { number: "Número inválido" });
    repository.create.mockRejectedValue(error);
    const store = createAppStore(repository);
    await store.dispatch(fetchGuides());
    const before = store.getState().guides;

    const failure: unknown = await store.dispatch(createGuide(NEW_GUIDE)).unwrap().catch((caught: unknown) => caught);

    expect(failure).toBe(error);
    expect(isDomainError(failure) && failure.fieldErrors).toEqual({ number: "Número inválido" });
    expect(repository.list).toHaveBeenCalledTimes(1);
    expect(store.getState().guides).toBe(before);
  });

  it("el error viaja en la acción sin avisos de serialización de Redux", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const repository = createFakeRepository();
    repository.create.mockRejectedValue(new RepositoryError("duplicate", "Ya existe una guía con ese número."));
    const store = createAppStore(repository);

    const action = await store.dispatch(createGuide(NEW_GUIDE));

    expect(createGuide.rejected.match(action)).toBe(true);
    expect(consoleError).not.toHaveBeenCalled();
  });
});

describe("guidesSlice: advanceGuide", () => {
  it("avanza con el repositorio, vuelve a leer y resuelve con la guía avanzada", async () => {
    const repository = createFakeRepository();
    const [first, ...others] = seedGuides();
    const advanced: Guide = {
      ...first,
      currentStage: "vehicle_loaded",
      history: [...first.history, { stage: "vehicle_loaded", at: "2026-09-28T16:00:00.000Z", location: "Miami, FL" }],
    };
    repository.list.mockResolvedValueOnce([first, ...others]).mockResolvedValueOnce([advanced, ...others]);
    repository.advance.mockResolvedValue(advanced);
    const store = createAppStore(repository);
    await store.dispatch(fetchGuides());

    const result = await store.dispatch(advanceGuide({ number: first.number, input: { location: "Miami, FL" } })).unwrap();

    expect(result).toEqual(advanced);
    expect(repository.advance).toHaveBeenCalledWith(first.number, { location: "Miami, FL" });
    expect(store.getState().guides.items[0]?.currentStage).toBe("vehicle_loaded");
  });

  it("si el repositorio rechaza, la promesa falla con el mismo RepositoryError", async () => {
    const repository = createFakeRepository();
    const error = new RepositoryError("not_found", "No existe una guía con ese número.", 404);
    repository.advance.mockRejectedValue(error);
    const store = createAppStore(repository);

    const failure: unknown = await store
      .dispatch(advanceGuide({ number: "2100000000000009", input: { location: "Laredo, TX" } }))
      .unwrap()
      .catch((caught: unknown) => caught);

    expect(failure).toBe(error);
    expect(isRepositoryError(failure) && failure.code).toBe("not_found");
  });

  it("el almacén no repite la regla de etapas: guarda lo que devuelve el repositorio", async () => {
    // Un repositorio que (mal) saltara dos etapas se vería tal cual: la regla no vive en los reducers.
    const repository = createFakeRepository();
    const [first, ...others] = seedGuides();
    const jumped: Guide = { ...first, currentStage: "vehicle_released" };
    repository.list.mockResolvedValueOnce([first, ...others]).mockResolvedValueOnce([jumped, ...others]);
    repository.advance.mockResolvedValue(jumped);
    const store = createAppStore(repository);
    await store.dispatch(fetchGuides());

    await store.dispatch(advanceGuide({ number: first.number, input: { location: "Miami, FL" } }));

    expect(store.getState().guides.items[0]?.currentStage).toBe("vehicle_released");
  });

  it("con el repositorio de demostración la regla se aplica en el dominio: solo la etapa siguiente", async () => {
    const store = createAppStore(createTestRepository());
    await store.dispatch(fetchGuides());
    const stageOf = (number: string) => store.getState().guides.items.find((guide) => guide.number === number);

    expect(stageOf("2148213907650312")?.currentStage).toBe("cargo_received");
    await store.dispatch(advanceGuide({ number: "2148213907650312", input: { location: "Miami, FL" } })).unwrap();
    expect(stageOf("2148213907650312")?.currentStage).toBe("vehicle_loaded");

    // "Carga entregada" es la última etapa: no avanza más y la guía queda como estaba.
    const delivered = stageOf("2154302968170435");
    const failure: unknown = await store
      .dispatch(advanceGuide({ number: "2154302968170435", input: { location: "Laredo, TX" } }))
      .unwrap()
      .catch((caught: unknown) => caught);
    expect(isDomainError(failure) && failure.code).toBe("already_delivered");
    expect(stageOf("2154302968170435")).toEqual(delivered);
  });
});

describe("guidesSlice: resetGuides", () => {
  it("con el repositorio de demostración vuelve a las guías de ejemplo", async () => {
    const store = createAppStore(createTestRepository());
    await store.dispatch(fetchGuides());
    await store.dispatch(createGuide(NEW_GUIDE)).unwrap();
    await store.dispatch(advanceGuide({ number: "2148213907650312", input: { location: "Miami, FL" } })).unwrap();
    expect(store.getState().guides.items).toHaveLength(9);

    await store.dispatch(resetGuides()).unwrap();

    const { items } = store.getState().guides;
    expect(items).toHaveLength(8);
    expect(items.find((guide) => guide.number === "2148213907650312")?.currentStage).toBe("cargo_received");
  });

  it("primero restablece y después lee", async () => {
    const reset = jest.fn<Promise<void>, []>(() => Promise.resolve());
    const repository = { ...createFakeRepository(), reset };
    const store = createAppStore(repository);

    await store.dispatch(resetGuides()).unwrap();

    expect(reset).toHaveBeenCalledTimes(1);
    expect(repository.list).toHaveBeenCalledTimes(1);
    expect(reset.mock.invocationCallOrder[0]).toBeLessThan(repository.list.mock.invocationCallOrder[0] ?? 0);
  });

  it("sin reset en el repositorio (la API) se rechaza y no lee nada", async () => {
    const repository = createFakeRepository();
    const store = createAppStore(repository);
    expect(store.getState().guides.canReset).toBe(false);

    await expect(store.dispatch(resetGuides()).unwrap()).rejects.toThrow("no se puede restablecer");

    expect(repository.list).not.toHaveBeenCalled();
  });
});
