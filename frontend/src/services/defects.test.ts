import { apiFailure } from "./apiClient.ts";
import { createHttpRepository } from "./httpRepository.ts";
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
it("translates CSRF and other 403 details into safe recovery instructions", async () => {
  const error = await apiFailure(json({ detail: "CSRF Failed: CSRF cookie not set." }, 403));
  expect(error.message).not.toContain("CSRF");
  expect(error.message).toMatch(/recarga|vuelve a iniciar sesión/i);
  const other = await apiFailure(json({ detail: "Internal permission reason private@example.test" }, 403));
  expect(other.message).not.toContain("private@example.test");
});
it("does not display raw server text for any failure", async () => {
  const error = await apiFailure(json({ detail: "<internal traceback>" }, 500));
  expect(error.message).not.toContain("traceback");
});
it("archives with DELETE and body CSRF, accepting an empty 204 response", async () => {
  const fetchImpl = jest
    .fn<Promise<Response>, [string, RequestInit?]>()
    .mockResolvedValueOnce(json({ csrfToken: "token" }))
    .mockResolvedValueOnce(new Response(null, { status: 204 }));
  await createHttpRepository({ fetchImpl: fetchImpl as typeof fetch }).archive?.("2100000000000001");
  expect(fetchImpl.mock.calls[1]?.[0]).toBe("/api/v1/guides/2100000000000001/");
  expect(fetchImpl.mock.calls[1]?.[1]?.method).toBe("DELETE");
  expect(new Headers(fetchImpl.mock.calls[1]?.[1]?.headers).get("X-CSRFToken")).toBe("token");
});
