import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary.tsx";

function Broken(): never {
  throw new Error("No se pudo cargar el módulo");
}

describe("ErrorBoundary", () => {
  it("muestra un mensaje con salidas en lugar de una pantalla en blanco cuando una pantalla falla", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <Broken />
        </ErrorBoundary>
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "No pudimos mostrar esta pantalla" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Recargar la página" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir al inicio" })).toHaveAttribute("href", "/");
  });

  it("no cambia nada si no hay error", () => {
    render(
      <MemoryRouter>
        <ErrorBoundary>
          <p>Todo bien</p>
        </ErrorBoundary>
      </MemoryRouter>,
    );
    expect(screen.getByText("Todo bien")).toBeInTheDocument();
  });
});
