import { createSeedGuides } from "./demoData.ts";
import { createHttpRepository } from "./httpRepository.ts";
import { createGuideRepository, resolveDataSource } from "./index.ts";
const [guide] = createSeedGuides();
if (!guide) throw new Error("Sin guía");
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
function setup(...responses: Response[]) {
  const fetchImpl = jest.fn<Promise<Response>, [string, RequestInit?]>(() =>
    Promise.resolve(responses.shift() ?? json({})),
  );
  return { fetchImpl, repository: createHttpRepository({ fetchImpl: fetchImpl as typeof fetch }) };
}
it("reads a blueprint guide and normalizes the lookup number", async () => {
  const { repository, fetchImpl } = setup(json(guide));
  await expect(repository.get("2148 2139 0765 0312")).resolves.toEqual(guide);
  expect(fetchImpl.mock.calls[0]?.[0]).toBe("/api/v1/guides/2148213907650312/");
});
it("reads cursor pages without dropping later guides", async () => {
  const { repository, fetchImpl } = setup(
    json({ results: [guide], next: "/api/v1/guides/?cursor=two" }),
    json({ results: [], next: null }),
  );
  await expect(repository.list()).resolves.toEqual([guide]);
  expect(fetchImpl).toHaveBeenCalledTimes(2);
});
it("reads the archived guides from the API, following its pages", async () => {
  const { repository, fetchImpl } = setup(
    json({ results: [guide], next: "/api/v1/guides/?archived=true&cursor=two" }),
    json({ results: [], next: null }),
  );
  await expect(repository.listArchived?.()).resolves.toEqual([guide]);
  expect(fetchImpl.mock.calls[0]?.[0]).toBe("/api/v1/guides/?archived=true");
  expect(fetchImpl).toHaveBeenCalledTimes(2);
});
it("rejects cross-origin or circular pagination without requesting it", async () => {
  const { repository, fetchImpl } = setup(
    json({ results: [], next: "https://other.invalid/api/v1/guides/" }),
  );
  await expect(repository.list()).rejects.toMatchObject({ code: "invalid_response" });
  expect(fetchImpl).toHaveBeenCalledTimes(1);
});
it("creates a guide with blueprint fields and CSRF from the body", async () => {
  const { repository, fetchImpl } = setup(json({ csrfToken: "body-token" }), json(guide, 201));
  const input = {
    trackingNumber: "2148 2139 0765 0312",
    origin: "Miami",
    destination: "Bogotá",
    recipient: "Laura",
    serviceLevel: "priority",
  } as const;
  await expect(repository.create(input)).resolves.toEqual(guide);
  const [url, init] = fetchImpl.mock.calls[1] ?? [];
  expect(url).toBe("/api/v1/guides/");
  expect(init?.method).toBe("POST");
  expect(new Headers(init?.headers).get("X-CSRFToken")).toBe("body-token");
  expect(JSON.parse(init?.body as string)).toEqual({ ...input, trackingNumber: "2148213907650312" });
});
it("keeps not-found, rejected and network errors distinct", async () => {
  await expect(setup(json({}, 404)).repository.get("2100000000000001")).resolves.toBeNull();
  await expect(setup(json({}, 500)).repository.list()).rejects.toMatchObject({ code: "http", status: 500 });
  await expect(setup(json({ nope: true })).repository.list()).rejects.toMatchObject({
    code: "invalid_response",
  });
});
it("reads the authoritative summary", async () => {
  const summary = { total: 30, active: 25, inTransit: 10, delivered: 5, withAlert: 0 };
  const { repository } = setup(json(summary));
  await expect(repository.summary?.()).resolves.toEqual(summary);
});
it("always selects API and never exposes a reset in the production repository", () => {
  expect(resolveDataSource(undefined)).toBe("api");
  expect(resolveDataSource("demo")).toBe("api");
  expect("reset" in createGuideRepository("api")).toBe(false);
});
