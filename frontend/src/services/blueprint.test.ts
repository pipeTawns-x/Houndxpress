import { createHttpRepository } from "./httpRepository.ts";
import { createAuthClient } from "./auth.ts";
import { createPublicTracker } from "./publicTracking.ts";
import { resolveDataSource } from "./index.ts";

const guide = {
  trackingNumber: "2100000000000001",
  origin: "Laredo",
  destination: "México",
  recipient: "Ana",
  serviceLevel: "standard",
  createdAt: "2026-11-01T12:00:00Z",
  currentStatus: "cargo_received",
  history: [{ stage: "cargo_received", timestamp: "2026-11-01T12:00:00Z", location: "Laredo" }],
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
function fetcher(...responses: Response[]) {
  return jest
    .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
    .mockImplementation(() => Promise.resolve(responses.shift() ?? json({})));
}

it("defaults to the API even for an unknown source", () => {
  expect(resolveDataSource(undefined)).toBe("api");
  expect(resolveDataSource("typo")).toBe("api");
});
it("gets CSRF from the response body and sends same-origin credentials on login and logout", async () => {
  const fetchImpl = fetcher(
    json({ csrfToken: "before" }),
    json({}),
    json({ username: "ana", isStaff: true }),
    json({ csrfToken: "rotated" }),
    json({}),
  );
  const auth = createAuthClient(fetchImpl);
  await auth.login("ana", "password");
  await auth.logout();
  expect(fetchImpl.mock.calls.map(([url]) => url)).toEqual([
    "/api/v1/auth/csrf/",
    "/api/v1/auth/login/",
    "/api/v1/auth/me/",
    "/api/v1/auth/csrf/",
    "/api/v1/auth/logout/",
  ]);
  for (const index of [1, 4]) {
    const init = fetchImpl.mock.calls[index]?.[1];
    expect(init?.credentials).toBe("same-origin");
    expect(new Headers(init?.headers).get("X-CSRFToken")).toBe(index === 1 ? "before" : "rotated");
  }
});
it("fails closed when CSRF is missing and does not send credentials", async () => {
  const fetchImpl = fetcher(json({}));
  await expect(createAuthClient(fetchImpl).login("ana", "password")).rejects.toMatchObject({
    code: "invalid_response",
  });
  expect(fetchImpl).toHaveBeenCalledTimes(1);
});
it("uses blueprint fields and PUT with the explicit next stage", async () => {
  const fetchImpl = fetcher(json({ csrfToken: "token" }), json(guide));
  const repository = createHttpRepository({ fetchImpl });
  await repository.advance(guide.trackingNumber, { stage: "vehicle_loaded", location: "Laredo" });
  const [url, init] = fetchImpl.mock.calls[1] ?? [];
  expect(url).toBe("/api/v1/guides/2100000000000001/");
  expect(init?.method).toBe("PUT");
  expect(JSON.parse(init?.body as string)).toEqual({ stage: "vehicle_loaded", location: "Laredo" });
  expect(new Headers(init?.headers).get("X-CSRFToken")).toBe("token");
});
it("distinguishes a conflicting transition from a duplicate guide", async () => {
  const fetchImpl = fetcher(
    json({ csrfToken: "token" }),
    json(
      { detail: "Etapa desactualizada", code: "invalid_transition", currentStatus: "vehicle_loaded" },
      409,
    ),
  );
  await expect(
    createHttpRepository({ fetchImpl }).advance(guide.trackingNumber, {
      stage: "vehicle_loaded",
      location: "Laredo",
    }),
  ).rejects.toMatchObject({ code: "invalid_transition", status: 409, currentStatus: "vehicle_loaded" });
});
it("tracks several numbers in a single public request without private guide calls", async () => {
  const publicGuide = {
    trackingNumber: guide.trackingNumber,
    currentStatus: guide.currentStatus,
    history: guide.history,
  };
  const fetchImpl = fetcher(json([publicGuide, { trackingNumber: "2100000000000002", found: false }]));
  const result = await createPublicTracker(fetchImpl)([guide.trackingNumber, "2100000000000002"]);
  expect(result).toHaveLength(2);
  expect(fetchImpl).toHaveBeenCalledTimes(1);
  expect(fetchImpl.mock.calls[0]?.[0]).toBe(
    "/api/v1/public/track/?numbers=2100000000000001%2C2100000000000002",
  );
  expect(result[0]).not.toHaveProperty("recipient");
});
it("reports offline and invalid payloads rather than falling back to demo data", async () => {
  const fetchImpl = jest
    .fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
    .mockRejectedValue(new TypeError("offline"));
  await expect(createPublicTracker(fetchImpl)([guide.trackingNumber])).rejects.toMatchObject({
    code: "network",
  });
  await expect(
    createPublicTracker(fetcher(json([{ ...guide, currentStatus: "unknown" }])))([guide.trackingNumber]),
  ).rejects.toMatchObject({ code: "invalid_response" });
});
