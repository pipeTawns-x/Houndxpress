import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createTestRepository, renderApp } from "../test/renderApp.tsx";
import type { GuideRepository } from "../services/guideRepository.ts";

const IN_TRANSIT_ROW = /2119 8753 0246 7781/;
const FIRST_STAGE_ROW = /2148 2139 0765 0312/;
const DELIVERED_ROW = /2154 3029 6817 0435/;

async function openPanel(repository?: GuideRepository) {
  const utils = await renderApp("/panel", repository);
  await screen.findByRole("heading", { level: 2, name: "Guías" });
  return utils;
}

function row(name: RegExp) {
  return screen.getByRole("row", { name });
}

async function fillForm(user: Awaited<ReturnType<typeof openPanel>>["user"], values: Partial<Record<string, string>> = {}) {
  const data = {
    number: "2199 9999 9999 9999",
    origin: "Laredo, TX",
    destination: "Monterrey, N.L.",
    recipient: "Ana Ruiz",
    ...values,
  };
  const form = screen.getByRole("form", { name: "Registrar guía" });
  const number = within(form).getByLabelText("Número de guía");
  await user.clear(number);
  if (data.number) await user.type(number, data.number);
  await user.type(within(form).getByLabelText("Origen"), data.origin);
  await user.type(within(form).getByLabelText("Destino"), data.destination);
  await user.type(within(form).getByLabelText("Destinatario"), data.recipient);
  return form;
}

describe("panel de operaciones", () => {
  it("muestra el resumen con total, en tránsito y entregadas, y la distribución por etapa", async () => {
    await openPanel();
    const summary = screen.getByRole("region", { name: "Resumen" });
    expect(within(summary).getByText("Guías en total").previousElementSibling).toHaveTextContent("8");
    expect(within(summary).getByText("En tránsito").previousElementSibling).toHaveTextContent("6");
    expect(within(summary).getByText("Entregadas").previousElementSibling).toHaveTextContent("2");
    expect(within(summary).getByText(/Recepción de carga:/)).toHaveTextContent("Recepción de carga: 1");
    expect(within(summary).getByText(/Vehículo cargado:/)).toHaveTextContent("Vehículo cargado: 2");
    expect(within(summary).getByText(/Carga entregada:/)).toHaveTextContent("Carga entregada: 2");
  });

  it("registrar una guía la agrega a la lista en Recepción de carga", async () => {
    const { user } = await openPanel();
    const form = await fillForm(user);
    await user.click(within(form).getByRole("button", { name: "Registrar guía" }));

    const message = await screen.findByText(/quedó en/);
    expect(message).toHaveTextContent("2199 9999 9999 9999");
    expect(message).toHaveTextContent("Recepción de carga");

    const created = row(/2199 9999 9999 9999/);
    expect(within(created).getByText("Ana Ruiz")).toBeInTheDocument();
    expect(within(created).getByText("Recepción")).toBeInTheDocument();
    expect(within(created).getByRole("button", { name: /Avanzar a Cargado/ })).toBeEnabled();
    expect(screen.getByText("9 guías, de la más reciente a la más antigua.")).toBeInTheDocument();
    // La primera fila es la guía nueva y el formulario queda limpio.
    expect(screen.getAllByRole("row")[1]).toBe(created);
    expect(within(form).getByLabelText("Número de guía")).toHaveValue("");
  });

  it("'Generar' propone un número válido", async () => {
    const { user } = await openPanel();
    const form = screen.getByRole("form", { name: "Registrar guía" });
    await user.click(within(form).getByRole("button", { name: /Generar/ }));
    expect(within(form).getByLabelText<HTMLInputElement>("Número de guía").value).toMatch(/^21\d{2} \d{4} \d{4} \d{4}$/);
    await user.type(within(form).getByLabelText("Origen"), "Miami, FL");
    await user.type(within(form).getByLabelText("Destino"), "Bogotá, Colombia");
    await user.type(within(form).getByLabelText("Destinatario"), "Luz Díaz");
    await user.click(within(form).getByRole("button", { name: "Registrar guía" }));
    expect(await screen.findByText(/quedó en/)).toBeInTheDocument();
    expect(screen.getByText("9 guías, de la más reciente a la más antigua.")).toBeInTheDocument();
  });

  it("muestra los errores de cada campo, enfoca el primero y no registra nada", async () => {
    const { user } = await openPanel();
    const form = screen.getByRole("form", { name: "Registrar guía" });
    await user.type(within(form).getByLabelText("Número de guía"), "123");
    await user.click(within(form).getByRole("button", { name: "Registrar guía" }));

    const number = within(form).getByLabelText("Número de guía");
    await waitFor(() => {
      expect(number).toHaveAttribute("aria-invalid", "true");
    });
    expect(number).toHaveFocus();
    expect(within(form).getByText(/Escribe un número válido/)).toBeInTheDocument();
    expect(within(form).getByText("Escribe el origen.")).toBeInTheDocument();
    expect(within(form).getByText("Escribe el destino.")).toBeInTheDocument();
    expect(within(form).getByText("Escribe el nombre del destinatario.")).toBeInTheDocument();
    expect(screen.getByText("8 guías, de la más reciente a la más antigua.")).toBeInTheDocument();
  });

  it("rechaza un número que ya existe", async () => {
    const { user } = await openPanel();
    const form = await fillForm(user, { number: "2148213907650312" });
    await user.click(within(form).getByRole("button", { name: "Registrar guía" }));
    expect(await within(form).findByText(/Ya existe una guía con ese número/)).toBeInTheDocument();
    expect(within(form).getByLabelText("Número de guía")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("8 guías, de la más reciente a la más antigua.")).toBeInTheDocument();
  });

  it("avanzar mueve la guía exactamente una etapa y el botón pasa a ofrecer la siguiente", async () => {
    const { user } = await openPanel();
    expect(within(row(FIRST_STAGE_ROW)).getByText("Recepción")).toBeInTheDocument();

    await user.click(within(row(FIRST_STAGE_ROW)).getByRole("button", { name: /Avanzar a Cargado/ }));
    expect(await screen.findByText(/avanzó a “Vehículo cargado”/)).toBeInTheDocument();
    expect(within(row(FIRST_STAGE_ROW)).getByText("Cargado")).toBeInTheDocument();
    expect(within(row(FIRST_STAGE_ROW)).queryByRole("button", { name: /Avanzar a Cargado/ })).not.toBeInTheDocument();

    await user.click(within(row(FIRST_STAGE_ROW)).getByRole("button", { name: /Avanzar a Liberado/ }));
    await waitFor(() => {
      expect(within(row(FIRST_STAGE_ROW)).getByText("Liberado")).toBeInTheDocument();
    });
    expect(within(row(FIRST_STAGE_ROW)).getByRole("button", { name: /Avanzar a En camino/ })).toBeEnabled();
  });

  it("al avanzar, la fila sube (orden por última actualización) y el foco vuelve a su botón", async () => {
    const { user } = await openPanel();
    await user.click(within(row(IN_TRANSIT_ROW)).getByRole("button", { name: /Avanzar a Entregada/ }));
    await waitFor(() => {
      expect(screen.getAllByRole("row")[1]).toBe(row(IN_TRANSIT_ROW));
    });
    await waitFor(() => {
      expect(within(row(IN_TRANSIT_ROW)).getByRole("button", { name: /Historial/ })).toHaveFocus();
    });
  });

  it("una guía entregada no puede avanzar y explica por qué", async () => {
    await openPanel();
    const delivered = row(DELIVERED_ROW);
    const button = within(delivered).getByRole("button", { name: /Avanzar etapa/ });
    expect(button).toBeDisabled();
    expect(button).toHaveAccessibleDescription("Ya se entregó: no hay una etapa siguiente.");
    expect(within(delivered).getByText("Entregada")).toBeInTheDocument();
  });

  it("una guía que se avanza hasta el final queda sin acción de avance", async () => {
    const { user } = await openPanel();
    await user.click(within(row(IN_TRANSIT_ROW)).getByRole("button", { name: /Avanzar a Entregada/ }));
    await waitFor(() => {
      expect(within(row(IN_TRANSIT_ROW)).getByRole("button", { name: /Avanzar etapa/ })).toBeDisabled();
    });
  });

  it("anota en el historial la ubicación elegida", async () => {
    const { user } = await openPanel();
    await user.selectOptions(screen.getByLabelText("Ubicación del avance"), "Monterrey, N.L.");
    await user.click(within(row(FIRST_STAGE_ROW)).getByRole("button", { name: /Avanzar a Cargado/ }));
    await user.click(await within(row(FIRST_STAGE_ROW)).findByRole("button", { name: /Historial/ }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getAllByText("Monterrey, N.L.")).toHaveLength(1);
  });

  it("el cajón de historial se abre con la línea de tiempo y se cierra con Escape devolviendo el foco", async () => {
    const { user } = await openPanel();
    const opener = within(row(IN_TRANSIT_ROW)).getByRole("button", { name: /Historial/ });
    await user.click(opener);

    const dialog = await screen.findByRole("dialog", { name: /2119 8753 0246 7781/ });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    expect(within(dialog).getByRole("list", { name: "Etapas del envío" })).toBeInTheDocument();
    expect(within(dialog).getByText("Diego Herrera")).toBeInTheDocument();
    expect(within(dialog).getByText("Salida hacia Monterrey.")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(opener).toHaveFocus();
  });

  it("el cajón se cierra con el botón y con un clic fuera, y atrapa el foco con Tab", async () => {
    const { user } = await openPanel();
    await user.click(within(row(IN_TRANSIT_ROW)).getByRole("button", { name: /Historial/ }));
    const dialog = await screen.findByRole("dialog");
    const close = within(dialog).getByRole("button", { name: "Cerrar historial" });
    expect(close).toHaveFocus();

    // Solo hay un elemento enfocable: Tab y Mayús+Tab se quedan dentro.
    await user.tab();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    await user.tab({ shift: true });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);

    await user.click(close);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(within(row(IN_TRANSIT_ROW)).getByRole("button", { name: /Historial/ }));
    const overlay = (await screen.findByRole("dialog")).previousElementSibling as HTMLElement;
    await user.click(overlay);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("bloquea el desplazamiento de la página mientras el cajón está abierto", async () => {
    const { user } = await openPanel();
    await user.click(within(row(IN_TRANSIT_ROW)).getByRole("button", { name: /Historial/ }));
    await screen.findByRole("dialog");
    expect(document.body.style.overflow).toBe("hidden");
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(document.body.style.overflow).toBe("");
    });
  });

  it("busca por número o por destinatario", async () => {
    const { user } = await openPanel();
    const search = screen.getByLabelText("Buscar por número o destinatario");
    await user.type(search, "laura");
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getByText("1 de 8 guías, de la más reciente a la más antigua.")).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "2103 9584");
    expect(within(screen.getAllByRole("row")[1] as HTMLElement).getByText("Andrés Ramírez")).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "nadie");
    expect(screen.getByRole("heading", { name: "Ninguna guía coincide" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Quitar filtros" }));
    expect(screen.getAllByRole("row")).toHaveLength(9);
  });

  it("filtra por etapa", async () => {
    const { user } = await openPanel();
    await user.selectOptions(screen.getByLabelText("Filtrar por etapa"), "cargo_delivered");
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText("2 de 8 guías, de la más reciente a la más antigua.")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Filtrar por etapa"), "all");
    expect(screen.getAllByRole("row")).toHaveLength(9);
  });

  it("restablece los datos de ejemplo después de confirmar", async () => {
    const { user } = await openPanel();
    const form = await fillForm(user);
    await user.click(within(form).getByRole("button", { name: "Registrar guía" }));
    await screen.findByText("9 guías, de la más reciente a la más antigua.");

    await user.click(screen.getByRole("button", { name: "Restablecer datos de ejemplo" }));
    expect(screen.getByText(/Se borrarán las guías que registraste/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.getByText("9 guías, de la más reciente a la más antigua.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Restablecer datos de ejemplo" }));
    await user.click(screen.getByRole("button", { name: "Sí, restablecer" }));
    expect(await screen.findByText("8 guías, de la más reciente a la más antigua.")).toBeInTheDocument();
  });

  it("muestra el aviso de demostración y el estado de la API", async () => {
    await openPanel();
    expect(screen.getByRole("complementary", { name: "Aviso de datos de demostración" })).toHaveTextContent(
      "se guardan solo en este navegador",
    );
    const statuses = screen.getAllByRole("status").map((element) => element.textContent);
    expect(statuses).toContain("API sin conexión");
  });

  it("usa tarjetas en pantallas angostas", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    await openPanel();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    const advance = screen.getAllByRole("button", { name: /Avanzar a/ });
    expect(advance).toHaveLength(6);
    const card = advance[0]?.closest("li");
    expect(card).not.toBeNull();
    expect(within(card as HTMLElement).getByRole("button", { name: /Historial/ })).toBeInTheDocument();
    expect(within(card as HTMLElement).getByText("Ruta")).toBeInTheDocument();
  });

  it("muestra un error con opción de reintentar si no se pueden leer las guías", async () => {
    const failing = {
      list: vi.fn().mockRejectedValueOnce(new Error("La API no respondió")).mockResolvedValue([]),
      get: vi.fn(),
      create: vi.fn(),
      advance: vi.fn(),
    };
    const { user } = await renderApp("/panel", failing);
    expect(await screen.findByText("La API no respondió")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Intentar de nuevo" }));
    expect(await screen.findByRole("heading", { name: "Todavía no hay guías" })).toBeInTheDocument();
    expect(screen.queryByRole("complementary", { name: "Aviso de datos de demostración" })).toBeInTheDocument();
  });

  it("no llama al repositorio cuando el formulario tiene errores", async () => {
    const base = createTestRepository();
    const create = vi.fn<GuideRepository["create"]>((input) => base.create(input));
    const { user } = await openPanel({ ...base, create });
    const form = await fillForm(user, { number: "123" });
    await user.click(within(form).getByRole("button", { name: "Registrar guía" }));

    expect(create).not.toHaveBeenCalled();
    expect(within(form).getByLabelText("Número de guía")).toHaveFocus();
    expect(within(form).getByLabelText("Número de guía")).toHaveAttribute("aria-invalid", "true");
  });

  it("terminar el avance de una guía no reactiva el botón de otra que sigue esperando", async () => {
    const base = createTestRepository();
    const release = new Map<string, () => void>();
    const advance: GuideRepository["advance"] = (number, input) =>
      new Promise((resolve, reject) => {
        release.set(number, () => {
          base.advance(number, input).then(resolve, reject);
        });
      });
    const { user } = await openPanel({ ...base, advance });

    await user.click(within(row(FIRST_STAGE_ROW)).getByRole("button", { name: /Avanzar a Cargado/ }));
    await user.click(within(row(IN_TRANSIT_ROW)).getByRole("button", { name: /Avanzar a Entregada/ }));
    expect(within(row(IN_TRANSIT_ROW)).getByRole("button", { name: /Avanzar a Entregada/ })).toBeDisabled();

    release.get("2148213907650312")?.();
    await screen.findByText(/avanzó a “Vehículo cargado”/);
    expect(within(row(IN_TRANSIT_ROW)).getByRole("button", { name: /Avanzar a Entregada/ })).toBeDisabled();

    release.get("2119875302467781")?.();
    await screen.findByText(/avanzó a “Carga entregada”/);
    expect(within(row(IN_TRANSIT_ROW)).queryByRole("button", { name: /Avanzar a Entregada/ })).not.toBeInTheDocument();
  });

  it("fija el título de la pestaña", async () => {
    await openPanel();
    expect(document.title).toBe("Panel de operaciones · Hound Express");
  });
});
