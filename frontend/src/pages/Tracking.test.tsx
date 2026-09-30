import { screen, within } from "@testing-library/react";
import { renderApp } from "../test/renderApp.tsx";

const IN_TRANSIT = "2119875302467781"; // Vehículo en camino
const DELIVERED = "2154302968170435";

async function currentStep() {
  const timelines = await screen.findAllByRole("list", { name: "Etapas del envío" });
  const first = timelines[0];
  if (!first) throw new Error("Sin línea de tiempo");
  return first.querySelector('[aria-current="step"]');
}

describe("rastreo", () => {
  it("buscar una guía de ejemplo muestra su etapa actual en la línea de tiempo", async () => {
    const { user } = await renderApp("/rastreo");
    await user.type(screen.getByLabelText("Número de guía"), "2119 8753 0246 7781");
    await user.click(screen.getByRole("button", { name: "Rastrear" }));

    expect(await screen.findByRole("heading", { level: 3, name: "2119 8753 0246 7781" })).toBeInTheDocument();
    const step = await currentStep();
    expect(step).toHaveTextContent("Vehículo en camino");
    expect(step).toHaveTextContent("Etapa actual");
    expect(screen.getByText(/Tu paquete está en/)).toHaveTextContent("Vehículo en camino");
  });

  it("escribe la búsqueda en la dirección (?guia=) y deja el número con formato", async () => {
    const { user } = await renderApp("/rastreo");
    await user.type(screen.getByLabelText("Número de guía"), IN_TRANSIT);
    await user.click(screen.getByRole("button", { name: "Rastrear" }));
    await screen.findByRole("heading", { level: 3, name: "2119 8753 0246 7781" });
    expect(screen.getByLabelText("Número de guía")).toHaveValue("2119 8753 0246 7781");
  });

  it("una guía con formato válido que no existe muestra el estado de no encontrada", async () => {
    const { user } = await renderApp("/rastreo");
    await user.type(screen.getByLabelText("Número de guía"), "2100000000000000");
    await user.click(screen.getByRole("button", { name: "Rastrear" }));

    expect(await screen.findByText(/No encontramos la guía 2100 0000 0000 0000/)).toBeInTheDocument();
    expect(screen.getByText("Guía no encontrada")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "escríbenos" })).toHaveAttribute("href", "/contacto");
    expect(screen.queryByRole("list", { name: "Etapas del envío" })).not.toBeInTheDocument();
  });

  it("un formato inválido muestra el error del campo y no busca", async () => {
    const { user } = await renderApp("/rastreo");
    const field = screen.getByLabelText("Número de guía");
    await user.type(field, "12345");
    await user.click(screen.getByRole("button", { name: "Rastrear" }));

    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveFocus();
    const error = screen.getByText(/no tiene el formato correcto/);
    expect(field.getAttribute("aria-describedby")).toContain(error.closest("p")?.id ?? "no-id");
    expect(screen.getByText("Aquí verás el resultado")).toBeInTheDocument();
  });

  it("no busca con el campo vacío", async () => {
    const { user } = await renderApp("/rastreo");
    await user.click(screen.getByRole("button", { name: "Rastrear" }));
    expect(screen.getByText("Escribe el número de tu guía.")).toBeInTheDocument();
  });

  it("el rastreo múltiple busca varias guías, una por línea", async () => {
    const { user } = await renderApp("/rastreo");
    await user.click(screen.getByRole("switch", { name: "Rastreo múltiple" }));
    expect(screen.getByRole("switch", { name: "Rastreo múltiple" })).toBeChecked();

    await user.type(screen.getByLabelText("Números de guía"), `${IN_TRANSIT}{Enter}${DELIVERED}{Enter}2100000000000000`);
    await user.click(screen.getByRole("button", { name: "Rastrear guías" }));

    expect(await screen.findByText("Encontramos 2 de 3 guías.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "2119 8753 0246 7781" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "2154 3029 6817 0435" })).toBeInTheDocument();
    expect(screen.getByText(/No encontramos la guía 2100 0000 0000 0000/)).toBeInTheDocument();
    const timelines = screen.getAllByRole("list", { name: "Etapas del envío" });
    expect(timelines).toHaveLength(2);
  });

  it("el rastreo múltiple valida el formato de cada línea", async () => {
    const { user } = await renderApp("/rastreo");
    await user.click(screen.getByRole("switch", { name: "Rastreo múltiple" }));
    await user.type(screen.getByLabelText("Números de guía"), `${IN_TRANSIT}{Enter}abc`);
    await user.click(screen.getByRole("button", { name: "Rastrear guías" }));
    expect(screen.getByText(/Guías con error: ABC/)).toBeInTheDocument();
    expect(screen.queryByText(/Encontramos/)).not.toBeInTheDocument();
  });

  it("rechaza más de 10 guías", async () => {
    const { user } = await renderApp("/rastreo");
    await user.click(screen.getByRole("switch", { name: "Rastreo múltiple" }));
    const eleven = Array.from({ length: 11 }, (_, index) => `21${String(index).padStart(14, "0")}`).join("\n");
    await user.click(screen.getByLabelText("Números de guía"));
    await user.paste(eleven);
    await user.click(screen.getByRole("button", { name: "Rastrear guías" }));
    expect(screen.getByText(/hasta 10 guías a la vez y escribiste 11/)).toBeInTheDocument();
  });

  it("/rastreo?guia= carga el resultado sin escribir nada", async () => {
    await renderApp(`/rastreo?guia=${DELIVERED}`);
    expect(await screen.findByRole("heading", { level: 3, name: "2154 3029 6817 0435" })).toBeInTheDocument();
    expect(screen.getByLabelText("Número de guía")).toHaveValue("2154 3029 6817 0435");
    const step = await currentStep();
    expect(step).toBeNull(); // entregada: todas las etapas quedan completadas
    expect(screen.getAllByText("Completada")).toHaveLength(5);
    expect(screen.getByText(/Entregada el/)).toBeInTheDocument();
  });

  it("/rastreo?guia= acepta varias guías separadas por coma", async () => {
    await renderApp(`/rastreo?guia=${IN_TRANSIT},${DELIVERED}`);
    expect(await screen.findByText("Encontramos 2 de 2 guías.")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Rastreo múltiple" })).toBeChecked();
    expect(screen.getByLabelText("Números de guía")).toHaveValue("2119 8753 0246 7781\n2154 3029 6817 0435");
  });

  it("avisa si la dirección trae más de 10 guías", async () => {
    const twelve = Array.from({ length: 12 }, (_, index) => `21${String(index).padStart(14, "0")}`).join(",");
    await renderApp(`/rastreo?guia=${twelve}`);
    expect(await screen.findByText(/La dirección traía 12 guías y solo se buscan las primeras 10/)).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(10);
  });

  it("una guía inválida en la dirección se marca sin consultarla", async () => {
    await renderApp("/rastreo?guia=abc");
    expect(await screen.findByText(/Este número no tiene el formato correcto/)).toBeInTheDocument();
  });

  it("la región de resultados avisa los cambios con aria-live=polite", async () => {
    await renderApp(`/rastreo?guia=${IN_TRANSIT}`);
    await screen.findByRole("heading", { level: 3, name: "2119 8753 0246 7781" });
    const region = screen.getByRole("heading", { level: 2, name: /Resultado/ }).closest("[aria-live]");
    expect(region).toHaveAttribute("aria-live", "polite");
  });

  it("muestra el aviso de datos de demostración con las guías de ejemplo", async () => {
    await renderApp("/rastreo");
    const notice = screen.getByRole("complementary", { name: "Aviso de datos de demostración" });
    expect(within(notice).getByText(/Datos de demostración:/)).toBeInTheDocument();
    expect(within(notice).getAllByRole("link")).toHaveLength(8);
  });

  it("la tarjeta de resultado muestra ruta, servicio, entrega estimada y eventos del más reciente al más antiguo", async () => {
    await renderApp(`/rastreo?guia=${IN_TRANSIT}`);
    const card = await screen.findByRole("article", { name: "Guía 2119 8753 0246 7781" });
    expect(within(card).getByText("Ruta").nextElementSibling).toHaveTextContent(/Laredo, TX.*Monterrey, N\.L\./);
    expect(within(card).getByText("Priority")).toBeInTheDocument();
    expect(within(card).getByText("Entrega estimada")).toBeInTheDocument();
    const events = within(within(card).getByRole("heading", { level: 4, name: "Eventos" }).closest("section") as HTMLElement).getAllByRole("listitem");
    expect(events.map((item) => item.textContent)).toEqual([
      expect.stringContaining("Vehículo en camino"),
      expect.stringContaining("Vehículo liberado"),
      expect.stringContaining("Vehículo cargado"),
      expect.stringContaining("Recepción de carga"),
    ]);
  });

  it("copia el número de la guía", async () => {
    const { user } = await renderApp(`/rastreo?guia=${IN_TRANSIT}`);
    await user.click(await screen.findByRole("button", { name: "Copiar número" }));
    expect(await screen.findByText("Copiado")).toBeInTheDocument();
    expect(await navigator.clipboard.readText()).toBe(IN_TRANSIT);
  });

  it("fija el título de la pestaña", async () => {
    await renderApp("/rastreo");
    expect(document.title).toBe("Rastrea tu paquete · Hound Express");
  });
});
