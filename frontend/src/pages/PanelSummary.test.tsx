import { act, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Panel from "./Panel.tsx";
import { createProviders, createTestRepository } from "../test/renderApp.tsx";
import { notifySessionLost } from "../services/sessionEvents.ts";

async function renderSummary() {
  const { Providers } = createProviders(createTestRepository());
  render(
    <Providers>
      <MemoryRouter initialEntries={["/panel"]}>
        <Panel />
      </MemoryRouter>
    </Providers>,
  );
  return screen.findByRole("heading", { name: "Sin avance reciente" });
}

describe("resumen del panel", () => {
  it("lista hasta 5 guías activas, con la actualización más antigua primero", async () => {
    const heading = await renderSummary();
    const section = heading.parentElement as HTMLElement;
    const items = within(section).getAllByRole("listitem");
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(5);
    expect(within(section).queryByText("Carga entregada")).not.toBeInTheDocument();
    const dates = items.map((item) =>
      Date.parse(item.querySelector("time")?.getAttribute("datetime") ?? ""),
    );
    expect(dates).toEqual([...dates].sort((a, b) => a - b));
  });

  it("no repite los contadores ni muestra bloques sin datos", async () => {
    await renderSummary();
    expect(screen.queryByText(/No disponible/)).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Resumen global" })).not.toBeInTheDocument();
    expect(screen.getAllByText("Guías en total")).toHaveLength(1);
  });

  it("muestra el logo real en la barra lateral", async () => {
    await renderSummary();
    expect(screen.getByRole("img", { name: "Hound Express" })).toHaveAttribute(
      "src",
      "/brand/logo-hound-express-blanco.svg",
    );
  });

  it("borra las guías en memoria cuando se pierde la sesión", async () => {
    const { store, Providers } = createProviders(createTestRepository());
    render(
      <Providers>
        <MemoryRouter initialEntries={["/panel"]}>
          <Panel />
        </MemoryRouter>
      </Providers>,
    );
    await screen.findByRole("heading", { name: "Sin avance reciente" });
    expect(store.getState().guides.items.length).toBeGreaterThan(0);
    act(() => notifySessionLost());
    await waitFor(() => expect(store.getState().guides.items).toHaveLength(0));
  });
});
