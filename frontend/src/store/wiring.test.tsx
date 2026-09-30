import { act, screen, waitFor, within } from "@testing-library/react";
import { createTestRepository, renderApp } from "../test/renderApp.tsx";
import { advanceGuide, createGuide, fetchGuides } from "./guidesSlice.ts";

const FIRST_STAGE_ROW = /2148 2139 0765 0312/;

async function openPanel() {
  const utils = await renderApp("/panel");
  await screen.findByRole("heading", { level: 2, name: "Guías" });
  return utils;
}

describe("la aplicación con su almacén de Redux", () => {
  it("el panel lee las guías del almacén que se creó con el repositorio de la prueba", async () => {
    const { store } = await openPanel();
    const { guides } = store.getState();
    expect(guides.status).toBe("succeeded");
    expect(guides.items).toHaveLength(8);
    expect(screen.getByText("8 guías, de la más reciente a la más antigua.")).toBeInTheDocument();
  });

  it("una acción despachada desde fuera de los componentes se refleja en la pantalla", async () => {
    const { store } = await openPanel();
    expect(within(screen.getByRole("row", { name: FIRST_STAGE_ROW })).getByText("Recepción")).toBeInTheDocument();

    await act(async () => {
      await store.dispatch(advanceGuide({ number: "2148213907650312", input: { location: "Miami, FL" } })).unwrap();
    });

    expect(within(screen.getByRole("row", { name: FIRST_STAGE_ROW })).getByText("Cargado")).toBeInTheDocument();
    const summary = screen.getByRole("region", { name: "Resumen" });
    expect(within(summary).getByText(/Recepción de carga:/)).toHaveTextContent("Recepción de carga: 0");
    expect(within(summary).getByText(/Vehículo cargado:/)).toHaveTextContent("Vehículo cargado: 3");
  });

  it("una guía creada con el almacén aparece al principio de la lista de la pantalla", async () => {
    const { store } = await openPanel();
    await act(async () => {
      await store
        .dispatch(
          createGuide({
            number: "2100000000000001",
            origin: "Laredo, TX",
            destination: "Monterrey, N.L.",
            recipient: "Ana Ruiz",
            service: "standard",
          }),
        )
        .unwrap();
    });
    expect(screen.getByText("9 guías, de la más reciente a la más antigua.")).toBeInTheDocument();
    expect(store.getState().guides.items[0]?.number).toBe("2100000000000001");
  });

  it("avanzar con el botón del panel actualiza el almacén", async () => {
    const { store, user } = await openPanel();
    await user.click(within(screen.getByRole("row", { name: FIRST_STAGE_ROW })).getByRole("button", { name: /Avanzar a Cargado/ }));
    await waitFor(() => {
      const guide = store.getState().guides.items.find((item) => item.number === "2148213907650312");
      expect(guide?.currentStage).toBe("vehicle_loaded");
    });
  });

  it("cada montaje tiene su propio almacén y su propio repositorio", async () => {
    const first = await openPanel();
    await act(async () => {
      await first.store.dispatch(advanceGuide({ number: "2148213907650312", input: { location: "Miami, FL" } })).unwrap();
    });
    first.unmount();

    const second = await openPanel();
    expect(second.store).not.toBe(first.store);
    const guide = second.store.getState().guides.items.find((item) => item.number === "2148213907650312");
    expect(guide?.currentStage).toBe("cargo_received");
  });

  it("las guías se leen cuando una pantalla las necesita, no al arrancar la aplicación", async () => {
    const { store } = await renderApp("/servicios");
    expect(store.getState().guides.status).toBe("idle");
    await act(async () => {
      await store.dispatch(fetchGuides());
    });
    expect(store.getState().guides.status).toBe("succeeded");
  });

  it("al volver al panel muestra enseguida la lista que el almacén ya tenía, sin pasar por 'cargando'", async () => {
    const repository = createTestRepository();
    const list = jest.spyOn(repository, "list");
    const { user } = await renderApp("/panel", repository);
    await screen.findByRole("heading", { level: 2, name: "Guías" });
    expect(list).toHaveBeenCalledTimes(1);

    await user.click(within(screen.getByRole("navigation", { name: "Principal" })).getByRole("link", { name: "Servicios" }));
    await screen.findByRole("heading", { level: 1, name: /Servicios para que tu ecommerce/ });

    await user.click(within(screen.getByRole("contentinfo")).getByRole("link", { name: "Panel de operaciones" }));
    expect(screen.queryByText("Cargando guías…")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Guías" })).toBeInTheDocument();
    // La lista se actualiza en segundo plano.
    await waitFor(() => {
      expect(list).toHaveBeenCalledTimes(2);
    });
  });
});
