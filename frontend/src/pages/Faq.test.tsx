import { screen, within } from "@testing-library/react";
import { FAQ } from "../content/faq.ts";
import { renderApp } from "../test/renderApp.tsx";

function questions() {
  return document.querySelectorAll("main details");
}

describe("preguntas frecuentes", () => {
  it("lista todas las preguntas en un acordeón de details/summary", async () => {
    await renderApp("/preguntas");
    expect(questions()).toHaveLength(FAQ.length);
    expect(screen.getByText(`${String(FAQ.length)} preguntas.`)).toBeInTheDocument();
    expect(screen.getByText("¿Cuánto tarda en llegar mi paquete?").closest("summary")).not.toBeNull();
  });

  it("abre y cierra una respuesta", async () => {
    const { user } = await renderApp("/preguntas");
    const summary = screen.getByText("¿Cuánto tarda en llegar mi paquete?");
    const details = summary.closest("details");
    expect(details).not.toHaveAttribute("open");
    await user.click(summary);
    expect(details).toHaveAttribute("open");
    expect(within(details as HTMLElement).getByText(/15 a 20 días/)).toBeInTheDocument();
    await user.click(summary);
    expect(details).not.toHaveAttribute("open");
  });

  it("el filtro deja solo las preguntas que coinciden, sin distinguir acentos", async () => {
    const { user } = await renderApp("/preguntas");
    await user.type(screen.getByLabelText("Buscar en las preguntas"), "ADUANA 72");
    expect(questions()).toHaveLength(1);
    expect(screen.getByText(/Detenido en aduana/)).toBeInTheDocument();
    expect(screen.getByText(`1 de ${String(FAQ.length)} preguntas coinciden con tu búsqueda.`)).toBeInTheDocument();
  });

  it("sin coincidencias muestra el estado vacío con enlace a contacto y permite limpiar el filtro", async () => {
    const { user } = await renderApp("/preguntas");
    await user.type(screen.getByLabelText("Buscar en las preguntas"), "zzzz");
    expect(questions()).toHaveLength(0);
    expect(screen.getByRole("heading", { level: 2, name: /No encontramos preguntas con “zzzz”/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Escríbenos" })).toHaveAttribute("href", "/contacto");
    await user.click(screen.getByRole("button", { name: "Ver todas las preguntas" }));
    expect(questions()).toHaveLength(FAQ.length);
    expect(screen.getByLabelText("Buscar en las preguntas")).toHaveValue("");
  });

  it("el campo de búsqueda no se anuncia como obligatorio y enlaza el conteo", async () => {
    await renderApp("/preguntas");
    const field = screen.getByLabelText("Buscar en las preguntas");
    expect(field).not.toHaveAttribute("aria-required");
    expect(field).toHaveAccessibleDescription(/preguntas/);
  });
});
