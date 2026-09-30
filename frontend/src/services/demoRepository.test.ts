import { DomainError } from "../domain/index.ts";
import type { NewGuideInput } from "../domain/index.ts";
import { DEMO_GUIDE_NUMBERS } from "./demoData.ts";
import { DEMO_STORAGE_KEY, createDemoRepository } from "./demoRepository.ts";
import { RepositoryError } from "./guideRepository.ts";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
}

/** Repositorio con su propio almacenamiento en memoria (uno solo, para que los cambios persistan entre operaciones). */
function repositoryWith(options: { now?: () => Date; initial?: Record<string, string> } = {}) {
  const storage = memoryStorage(options.initial);
  return createDemoRepository({ getStorage: () => storage, ...(options.now ? { now: options.now } : {}) });
}

const NEW_GUIDE: NewGuideInput = {
  number: "2100000000000001",
  origin: "Laredo, TX",
  destination: "Monterrey, N.L.",
  recipient: "Ana Ruiz",
  service: "standard",
};

const NOW = new Date("2026-10-01T12:00:00.000Z");

describe("demoRepository", () => {
  it("arranca con las guías de ejemplo y las guarda en la clave hx.guides.v1", async () => {
    const storage = memoryStorage();
    const repository = createDemoRepository({ getStorage: () => storage });
    const guides = await repository.list();
    expect(guides.map((guide) => guide.number)).toEqual([...DEMO_GUIDE_NUMBERS]);
    expect(DEMO_STORAGE_KEY).toBe("hx.guides.v1");
    expect(JSON.parse(storage.data.get("hx.guides.v1") ?? "null")).toHaveLength(8);
  });

  it("get busca por número con espacios y devuelve null si no existe o el formato no es válido", async () => {
    const repository = repositoryWith();
    expect((await repository.get("2148 2139 0765 0312"))?.recipient).toBe("Laura Gómez");
    expect((await repository.get("hx7q4m9k2b8t5w1n6r3d0c"))?.destination).toBe("Buenos Aires, Argentina");
    expect(await repository.get("2100000000000000")).toBeNull();
    expect(await repository.get("abc")).toBeNull();
  });

  it("create agrega la guía al principio, en Recepción de carga y con un evento", async () => {
    const repository = repositoryWith({ now: () => NOW });
    const created = await repository.create({ ...NEW_GUIDE, number: "2100 0000 0000 0001" });
    expect(created.currentStage).toBe("cargo_received");
    expect(created.history).toEqual([{ stage: "cargo_received", at: NOW.toISOString(), location: "Laredo, TX" }]);
    const guides = await repository.list();
    expect(guides).toHaveLength(9);
    expect(guides[0]?.number).toBe("2100000000000001");
  });

  it("create rechaza un número repetido", async () => {
    const repository = repositoryWith();
    await expect(repository.create({ ...NEW_GUIDE, number: "2148 2139 0765 0312" })).rejects.toMatchObject({
      name: "RepositoryError",
      code: "duplicate",
    });
    await repository.create(NEW_GUIDE);
    await expect(repository.create(NEW_GUIDE)).rejects.toBeInstanceOf(RepositoryError);
  });

  it("create rechaza un número inválido y campos vacíos, sin guardar nada", async () => {
    const repository = repositoryWith();
    await expect(repository.create({ ...NEW_GUIDE, number: "123" })).rejects.toMatchObject({ code: "invalid_guide_number" });
    await expect(repository.create({ ...NEW_GUIDE, recipient: " " })).rejects.toBeInstanceOf(DomainError);
    expect(await repository.list()).toHaveLength(8);
  });

  it("advance mueve la guía exactamente una etapa y lo guarda", async () => {
    const storage = memoryStorage();
    const repository = createDemoRepository({ getStorage: () => storage, now: () => NOW });
    const updated = await repository.advance("2148213907650312", { location: "Miami, FL", note: "Cargado en muelle 3" });
    expect(updated.currentStage).toBe("vehicle_loaded");
    expect(updated.history).toHaveLength(2);
    expect(updated.history[1]).toEqual({
      stage: "vehicle_loaded",
      at: NOW.toISOString(),
      location: "Miami, FL",
      note: "Cargado en muelle 3",
    });

    // Otro repositorio sobre el mismo almacenamiento ve el cambio.
    const other = createDemoRepository({ getStorage: () => storage });
    expect((await other.get("2148213907650312"))?.currentStage).toBe("vehicle_loaded");
  });

  it("advance no mueve una guía entregada ni una que no existe", async () => {
    const repository = repositoryWith({ now: () => NOW });
    await expect(repository.advance("2154302968170435", { location: "Laredo, TX" })).rejects.toMatchObject({
      code: "already_delivered",
    });
    await expect(repository.advance("2100000000000000", { location: "Laredo, TX" })).rejects.toMatchObject({
      code: "not_found",
    });
  });

  it("advance nunca deja una fecha anterior al evento previo, aunque el reloj vaya atrasado", async () => {
    const repository = repositoryWith({ now: () => new Date("2020-01-01T00:00:00.000Z") });
    const updated = await repository.advance("2148213907650312", { location: "Miami, FL" });
    const [first, second] = updated.history;
    expect(Date.parse(second?.at ?? "")).toBeGreaterThanOrEqual(Date.parse(first?.at ?? ""));
  });

  it("reset vuelve a las guías de ejemplo", async () => {
    const repository = repositoryWith({ now: () => NOW });
    await repository.create(NEW_GUIDE);
    await repository.advance("2148213907650312", { location: "Miami, FL" });
    await repository.reset?.();
    const guides = await repository.list();
    expect(guides).toHaveLength(8);
    expect(guides.find((guide) => guide.number === "2148213907650312")?.currentStage).toBe("cargo_received");
  });

  it("si el almacenamiento tiene datos dañados, vuelve a las guías de ejemplo", async () => {
    const repository = repositoryWith({ initial: { [DEMO_STORAGE_KEY]: "{no es json" } });
    expect(await repository.list()).toHaveLength(8);
    const wrongShape = repositoryWith({ initial: { [DEMO_STORAGE_KEY]: JSON.stringify([{ number: 1 }]) } });
    expect(await wrongShape.list()).toHaveLength(8);
  });

  it("devuelve copias: modificar el resultado no cambia lo guardado", async () => {
    const repository = repositoryWith();
    const [first] = await repository.list();
    if (!first) throw new Error("Sin guías");
    first.recipient = "Otra persona";
    first.history.length = 0;
    const [again] = await repository.list();
    expect(again?.recipient).not.toBe("Otra persona");
    expect(again?.history.length).toBeGreaterThan(0);
  });

  describe("cuando localStorage falla", () => {
    it("funciona en memoria si acceder al almacenamiento lanza una excepción", async () => {
      const getStorage = jest.fn(() => {
        throw new DOMException("Acceso denegado", "SecurityError");
      });
      const repository = createDemoRepository({ getStorage, now: () => NOW });
      expect(await repository.list()).toHaveLength(8);
      await repository.create(NEW_GUIDE);
      await repository.advance("2148213907650312", { location: "Miami, FL" });
      const guides = await repository.list();
      expect(guides).toHaveLength(9);
      expect(guides.find((guide) => guide.number === "2148213907650312")?.currentStage).toBe("vehicle_loaded");
      await repository.reset?.();
      expect(await repository.list()).toHaveLength(8);
    });

    it("conserva lo escrito si guardar falla (por ejemplo, almacenamiento lleno)", async () => {
      const storage = {
        getItem: () => null,
        setItem: () => {
          throw new DOMException("Cuota excedida", "QuotaExceededError");
        },
        removeItem: () => undefined,
      };
      const repository = createDemoRepository({ getStorage: () => storage, now: () => NOW });
      await repository.create(NEW_GUIDE);
      const guides = await repository.list();
      expect(guides).toHaveLength(9);
      expect(guides[0]?.number).toBe("2100000000000001");
    });

    it("con el localStorage real de jsdom bloqueado también funciona", async () => {
      jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("bloqueado");
      });
      jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("bloqueado");
      });
      const repository = createDemoRepository();
      expect(await repository.list()).toHaveLength(8);
      await repository.create(NEW_GUIDE);
      expect(await repository.list()).toHaveLength(9);
    });
  });
});
