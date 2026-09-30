import { HEALTH_ENDPOINT, HEALTH_TIMEOUT_MS, getApiHealth } from "./health.ts";
import { stubGlobal } from "../test/stubGlobal.ts";

function respond(body: unknown, init: ResponseInit = { status: 200 }): Response {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), init);
}

function stubFetch(implementation: (input: string, init?: RequestInit) => Promise<Response>) {
  const mock = jest.fn(implementation);
  stubGlobal("fetch", mock);
  return mock;
}

afterEach(() => {
  jest.useRealTimers();
});

describe("getApiHealth", () => {
  it("consulta /api/v1/health/ y responde online con {status:ok, database:ok}", async () => {
    const mock = stubFetch(() => Promise.resolve(respond({ status: "ok", database: "ok" })));
    await expect(getApiHealth()).resolves.toBe("online");
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock.mock.calls[0]?.[0]).toBe("/api/v1/health/");
    expect(HEALTH_ENDPOINT).toBe("/api/v1/health/");
  });

  it("responde offline con un 503", async () => {
    stubFetch(() => Promise.resolve(respond({ status: "ok", database: "ok" }, { status: 503 })));
    await expect(getApiHealth()).resolves.toBe("offline");
  });

  it("responde offline si falla la red", async () => {
    stubFetch(() => Promise.reject(new TypeError("Failed to fetch")));
    await expect(getApiHealth()).resolves.toBe("offline");
  });

  it("responde offline si la respuesta no es JSON", async () => {
    stubFetch(() => Promise.resolve(respond("<html>hola</html>")));
    await expect(getApiHealth()).resolves.toBe("offline");
  });

  it.each([
    { status: "ok", database: "error" },
    { status: "error", database: "ok" },
    { status: "ok" },
    [],
    null,
  ])("responde offline si el JSON es %j", async (body) => {
    stubFetch(() => Promise.resolve(respond(body)));
    await expect(getApiHealth()).resolves.toBe("offline");
  });

  it("responde offline si la API no contesta en 4 segundos", async () => {
    jest.useFakeTimers();
    let aborted = false;
    stubFetch(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            aborted = true;
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
    );
    const result = getApiHealth();
    await jest.advanceTimersByTimeAsync(HEALTH_TIMEOUT_MS - 1);
    expect(aborted).toBe(false);
    await jest.advanceTimersByTimeAsync(1);
    await expect(result).resolves.toBe("offline");
    expect(aborted).toBe(true);
    expect(HEALTH_TIMEOUT_MS).toBe(4000);
  });

  it("se cancela desde fuera con una señal", async () => {
    const controller = new AbortController();
    stubFetch(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
    );
    const result = getApiHealth({ signal: controller.signal });
    controller.abort();
    await expect(result).resolves.toBe("offline");
  });
});
