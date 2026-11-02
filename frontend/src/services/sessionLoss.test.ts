import { createApiClient } from "./apiClient.ts";
import { onSessionLost } from "./sessionEvents.ts";

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status });

async function failingRequest(url: string, response: Response) {
  const listener = jest.fn();
  const stop = onSessionLost(listener);
  const client = createApiClient(
    jest.fn(() => Promise.resolve(response)),
  );
  await expect(client.request(url)).rejects.toBeDefined();
  stop();
  return listener;
}

it("notifies a lost session on 401", async () => {
  const listener = await failingRequest("/api/v1/guides/", json({ detail: "Sin sesión" }, 401));
  expect(listener).toHaveBeenCalledTimes(1);
});

it("notifies a lost session on 403 from a private endpoint", async () => {
  const listener = await failingRequest("/api/v1/guides/", json({ code: "not_authenticated" }, 403));
  expect(listener).toHaveBeenCalledTimes(1);
});

it("does not treat a CSRF rejection as a lost session", async () => {
  const listener = await failingRequest("/api/v1/guides/", json({ detail: "CSRF Failed: x" }, 403));
  expect(listener).not.toHaveBeenCalled();
});

it("does not treat other errors as a lost session", async () => {
  const listener = await failingRequest("/api/v1/guides/", json({ detail: "fallo" }, 500));
  expect(listener).not.toHaveBeenCalled();
});

it("leaves the auth endpoints to the access flow", async () => {
  const listener = await failingRequest("/api/v1/auth/me/", json({ detail: "Sin sesión" }, 403));
  expect(listener).not.toHaveBeenCalled();
});
