import { afterEach, describe, expect, it, vi } from "vitest";
import { createSeedGuides } from "./demoData.ts";
import { RepositoryError } from "./guideRepository.ts";
import { createHttpRepository } from "./httpRepository.ts";
import { createGuideRepository, resolveDataSource } from "./index.ts";

const [GUIDE] = createSeedGuides();
if (!GUIDE) throw new Error("Sin guías de ejemplo");

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function setup(response: Response | (() => Promise<Response>)) {
  const fetchImpl = vi.fn((...args: [string, RequestInit?]) => {
    void args;
    return typeof response === "function" ? response() : Promise.resolve(response);
  });
  return { fetchImpl, repository: createHttpRepository({ fetchImpl: fetchImpl as unknown as typeof fetch }) };
}

function lastCall(fetchImpl: ReturnType<typeof setup>["fetchImpl"]) {
  const [url, init] = fetchImpl.mock.calls.at(-1) ?? [];
  const headers = new Headers(init?.headers);
  return { url, method: init?.method, headers, body: init?.body };
}

afterEach(() => {
  document.cookie = "csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
});

describe("httpRepository", () => {
  it("list hace GET /api/v1/guides/", async () => {
    const { fetchImpl, repository } = setup(json([GUIDE]));
    await expect(repository.list()).resolves.toEqual([GUIDE]);
    const call = lastCall(fetchImpl);
    expect(call.url).toBe("/api/v1/guides/");
    expect(call.method).toBe("GET");
    expect(call.headers.get("Accept")).toBe("application/json");
  });

  it("list acepta la lista paginada de DRF", async () => {
    const { repository } = setup(json({ count: 1, results: [GUIDE] }));
    await expect(repository.list()).resolves.toEqual([GUIDE]);
  });

  it("get hace GET /api/v1/guides/{numero}/ con el número normalizado", async () => {
    const { fetchImpl, repository } = setup(json(GUIDE));
    await expect(repository.get("2148 2139 0765 0312")).resolves.toEqual(GUIDE);
    expect(lastCall(fetchImpl).url).toBe("/api/v1/guides/2148213907650312/");
    expect(lastCall(fetchImpl).method).toBe("GET");
  });

  it("get devuelve null con un 404", async () => {
    const { repository } = setup(json({ detail: "No encontrada." }, 404));
    await expect(repository.get("2100000000000000")).resolves.toBeNull();
  });

  it("get lanza un error tipado con otro código", async () => {
    const { repository } = setup(json({ detail: "Falla interna" }, 500));
    await expect(repository.get("2148213907650312")).rejects.toMatchObject({
      name: "RepositoryError",
      code: "http",
      status: 500,
    });
  });

  it("create hace POST /api/v1/guides/ con JSON y el token CSRF de la cookie", async () => {
    document.cookie = "csrftoken=abc123";
    const { fetchImpl, repository } = setup(json(GUIDE, 201));
    const input = {
      number: "2148 2139 0765 0312",
      origin: "Miami, FL",
      destination: "Bogotá, Colombia",
      recipient: "Laura Gómez",
      service: "priority",
    } as const;
    await expect(repository.create(input)).resolves.toEqual(GUIDE);
    const call = lastCall(fetchImpl);
    expect(call.url).toBe("/api/v1/guides/");
    expect(call.method).toBe("POST");
    expect(call.headers.get("Content-Type")).toBe("application/json");
    expect(call.headers.get("X-CSRFToken")).toBe("abc123");
    expect(JSON.parse(call.body as string)).toEqual({ ...input, number: "2148213907650312" });
  });

  it("create traduce un 409 en duplicado y un 400 en rechazo con el detalle de la API", async () => {
    const input = { number: "2148213907650312", origin: "a", destination: "b", recipient: "c", service: "standard" } as const;
    await expect(setup(json({ detail: "Ya existe" }, 409)).repository.create(input)).rejects.toMatchObject({
      code: "duplicate",
      message: "Ya existe",
    });
    await expect(setup(json({ detail: "Datos inválidos" }, 400)).repository.create(input)).rejects.toMatchObject({
      code: "rejected",
      message: "Datos inválidos",
    });
  });

  it("advance hace POST /api/v1/guides/{numero}/advance/", async () => {
    const { fetchImpl, repository } = setup(json(GUIDE));
    await repository.advance("2148213907650312", { location: "Miami, FL", note: "ok" });
    const call = lastCall(fetchImpl);
    expect(call.url).toBe("/api/v1/guides/2148213907650312/advance/");
    expect(call.method).toBe("POST");
    expect(JSON.parse(call.body as string)).toEqual({ location: "Miami, FL", note: "ok" });
  });

  it("advance traduce un 404 en not_found y un 422 en rechazo con el detalle", async () => {
    await expect(
      setup(json({ detail: "No existe" }, 404)).repository.advance("2148213907650312", { location: "x" }),
    ).rejects.toMatchObject({ code: "not_found" });
    await expect(
      setup(json({ detail: "Solo la etapa siguiente" }, 422)).repository.advance("2148213907650312", { location: "x" }),
    ).rejects.toMatchObject({ code: "rejected", message: "Solo la etapa siguiente" });
  });

  it("lanza un error de red tipado si fetch falla", async () => {
    const { repository } = setup(() => Promise.reject(new TypeError("Failed to fetch")));
    const error = await repository.list().catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(RepositoryError);
    expect(error).toMatchObject({ code: "network" });
  });

  it("lanza invalid_response si la API responde algo que no es una guía", async () => {
    await expect(setup(json({ hola: "mundo" })).repository.get("2148213907650312")).rejects.toMatchObject({
      code: "invalid_response",
    });
    await expect(setup(new Response("no es json", { status: 200 })).repository.list()).rejects.toMatchObject({
      code: "invalid_response",
    });
  });

  it("no expone reset", () => {
    expect("reset" in setup(json([])).repository).toBe(false);
  });
});

describe("selección del repositorio", () => {
  it("VITE_DATA_SOURCE=api activa la API y cualquier otro valor usa datos de demostración", () => {
    expect(resolveDataSource("api")).toBe("api");
    expect(resolveDataSource("demo")).toBe("demo");
    expect(resolveDataSource(undefined)).toBe("demo");
    expect(resolveDataSource("API")).toBe("demo");
  });

  it("el repositorio de demostración tiene reset y el de la API no", () => {
    expect("reset" in createGuideRepository("demo")).toBe(true);
    expect("reset" in createGuideRepository("api")).toBe(false);
  });

  it("el repositorio de la API llama al fetch global", async () => {
    const mock = vi.fn(() => Promise.resolve(json([])));
    vi.stubGlobal("fetch", mock);
    await createGuideRepository("api").list();
    expect(mock).toHaveBeenCalledTimes(1);
  });
});
