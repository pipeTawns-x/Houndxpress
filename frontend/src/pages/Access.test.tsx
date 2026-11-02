import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import Access from "./Access.tsx";
import { stubGlobal } from "../test/stubGlobal.ts";
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });
it("logs in with CSRF and enters the panel only after me confirms staff", async () => {
  const calls: [string, RequestInit?][] = [];
  stubGlobal(
    "fetch",
    jest.fn((url: string, init?: RequestInit) => {
      calls.push([url, init]);
      if (url.endsWith("csrf/")) return Promise.resolve(json({ csrfToken: "token" }));
      if (url.endsWith("login/")) return Promise.resolve(json({}));
      return Promise.resolve(json({ username: "ana", isStaff: true }));
    }),
  );
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={["/acceso"]}>
      <Routes>
        <Route path="/acceso" element={<Access />} />
        <Route path="/panel" element={<h1>Panel privado</h1>} />
      </Routes>
    </MemoryRouter>,
  );
  await user.type(screen.getByLabelText("Usuario"), "ana");
  await user.type(screen.getByLabelText("Contraseña"), "secret");
  await user.click(screen.getByRole("button", { name: "Entrar al panel" }));
  expect(await screen.findByText("Panel privado")).toBeInTheDocument();
  expect(calls.map(([url]) => url)).toEqual([
    "/api/v1/auth/csrf/",
    "/api/v1/auth/login/",
    "/api/v1/auth/me/",
  ]);
  expect(new Headers(calls[1]?.[1]?.headers).get("X-CSRFToken")).toBe("token");
});
it("shows a login rejection without entering a private screen", async () => {
  stubGlobal(
    "fetch",
    jest.fn((url: string) =>
      Promise.resolve(
        url.endsWith("csrf/")
          ? json({ csrfToken: "token" })
          : json({ detail: "No se pudo iniciar sesión." }, 403),
      ),
    ),
  );
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <Access />
    </MemoryRouter>,
  );
  await user.type(screen.getByLabelText("Usuario"), "ana");
  await user.type(screen.getByLabelText("Contraseña"), "wrong");
  await user.click(screen.getByRole("button", { name: "Entrar al panel" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Recarga la página o vuelve a iniciar sesión.");
  expect(screen.getByRole("button", { name: "Entrar al panel" })).toBeEnabled();
});
