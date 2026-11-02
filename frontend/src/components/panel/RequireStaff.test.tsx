import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { RequireStaff } from "./RequireStaff.tsx";
import { stubGlobal } from "../../test/stubGlobal.ts";
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });
function mount(path = "/panel/guides/private") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/acceso" element={<h1>Acceso</h1>} />
        <Route
          path="/panel/*"
          element={
            <RequireStaff>
              <h1>Datos privados</h1>
            </RequireStaff>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}
it("does not mount private routes before a verified staff session", async () => {
  stubGlobal(
    "fetch",
    jest.fn(() => Promise.resolve(json({ detail: "Sin sesión" }, 403))),
  );
  mount();
  expect(screen.queryByText("Datos privados")).not.toBeInTheDocument();
  expect(await screen.findByRole("heading", { name: "Acceso" })).toBeInTheDocument();
});
it("permits a staff session, including nested panel routes", async () => {
  stubGlobal(
    "fetch",
    jest.fn(() => Promise.resolve(json({ username: "ana", isStaff: true }))),
  );
  mount();
  expect(await screen.findByText("Datos privados")).toBeInTheDocument();
});
it("fails closed for a non-staff account and offers retry on network failure", async () => {
  stubGlobal(
    "fetch",
    jest.fn(() => Promise.resolve(json({ username: "ana", isStaff: false }))),
  );
  const view = mount();
  expect(await screen.findByRole("heading", { name: "Acceso" })).toBeInTheDocument();
  view.unmount();
  stubGlobal(
    "fetch",
    jest.fn(() => Promise.reject(new TypeError("offline"))),
  );
  mount();
  expect(await screen.findByRole("button", { name: "Intentar de nuevo" })).toBeInTheDocument();
  expect(screen.queryByText("Datos privados")).not.toBeInTheDocument();
});
