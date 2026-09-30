import { render, screen, within } from "@testing-library/react";
import { STAGES } from "../../domain/index.ts";
import type { StageCode, StageEvent } from "../../domain/index.ts";
import { StageTimeline } from "./StageTimeline.tsx";

function history(upTo: number): StageEvent[] {
  return STAGES.slice(0, upTo + 1).map((stage, index) => ({
    stage: stage.code,
    at: new Date(Date.UTC(2026, 8, 28, 15 + index)).toISOString(),
    location: `Lugar ${String(index + 1)}`,
    note: index === 0 ? "Nota de la primera etapa" : undefined,
  }));
}

function renderAt(stage: StageCode, options: { showDetails?: boolean; layout?: "responsive" | "vertical" } = {}) {
  const index = STAGES.findIndex((entry) => entry.code === stage);
  render(<StageTimeline currentStage={stage} history={history(index)} {...options} />);
  return screen.getAllByRole("listitem");
}

describe("línea de tiempo de etapas", () => {
  it("muestra las cinco etapas con número, nombre y departamento", () => {
    const items = renderAt("vehicle_released");
    expect(items).toHaveLength(5);
    expect(items[0]).toHaveTextContent("Recepción de carga");
    expect(items[0]).toHaveTextContent("Aduana");
    expect(items[2]).toHaveTextContent("Operaciones");
    expect(items[3]).toHaveTextContent("Seguridad");
    expect(items[4]).toHaveTextContent("KAM");
  });

  it("comunica completada, actual y pendiente con texto además del icono", () => {
    const items = renderAt("vehicle_released");
    expect(items.map((item) => within(item).getByText(/Completada|Etapa actual|Pendiente/).textContent)).toEqual([
      "Completada",
      "Completada",
      "Etapa actual",
      "Pendiente",
      "Pendiente",
    ]);
  });

  it("marca solo la etapa actual con aria-current=step", () => {
    const items = renderAt("vehicle_loaded");
    expect(items.filter((item) => item.getAttribute("aria-current") === "step")).toEqual([items[1]]);
  });

  it("las completadas llevan palomita y las pendientes su número", () => {
    const items = renderAt("vehicle_released");
    expect(items[0]?.querySelector("svg.lucide-check")).not.toBeNull();
    expect(items[3]?.querySelector("svg")).toBeNull();
    expect(items[3]).toHaveTextContent("4");
  });

  it("muestra la fecha de las etapas alcanzadas en horario de Ciudad de México", () => {
    const items = renderAt("vehicle_loaded");
    const first = items[0]?.querySelector("time");
    expect(first).toHaveAttribute("datetime", "2026-09-28T15:00:00.000Z");
    expect(first?.textContent).toMatch(/9:00/);
    expect(items[2]?.querySelector("time")).toBeNull();
  });

  it("una guía entregada deja las cinco etapas completadas y ninguna actual", () => {
    const items = renderAt("cargo_delivered");
    expect(items.every((item) => within(item).queryByText("Completada"))).toBe(true);
    expect(items.some((item) => item.hasAttribute("aria-current"))).toBe(false);
  });

  it("muestra ubicación y nota solo con showDetails", () => {
    renderAt("vehicle_loaded", { showDetails: true });
    expect(screen.getByText("Lugar 1")).toBeInTheDocument();
    expect(screen.getByText("Nota de la primera etapa")).toBeInTheDocument();
  });

  it("no muestra ubicación por defecto", () => {
    renderAt("vehicle_loaded");
    expect(screen.queryByText("Lugar 1")).not.toBeInTheDocument();
  });

  it("es horizontal desde 768 px solo en el diseño responsivo", () => {
    renderAt("vehicle_loaded");
    expect(screen.getByRole("list", { name: "Etapas del envío" }).className).toContain("stage-timeline--responsive");
  });

  it("siempre vertical dentro de un cajón", () => {
    renderAt("vehicle_loaded", { layout: "vertical" });
    const list = screen.getByRole("list", { name: "Etapas del envío" });
    expect(list.className).toContain("stage-timeline--vertical");
    expect(list.className).not.toContain("stage-timeline--responsive");
  });
});
