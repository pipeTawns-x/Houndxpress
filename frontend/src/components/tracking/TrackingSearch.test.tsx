import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrackingSearch } from "./TrackingSearch.tsx";

describe("buscador de guía", () => {
  it("llama a onSearch con el número normalizado", async () => {
    const onSearch = jest.fn();
    const user = userEvent.setup();
    render(<TrackingSearch onSearch={onSearch} />);
    await user.type(screen.getByLabelText("Número de guía"), "2148-2139 0765 0312{Enter}");
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith(["2148213907650312"]);
  });

  it("no llama a onSearch con un formato inválido y enlaza el error con aria-describedby", async () => {
    const onSearch = jest.fn();
    const user = userEvent.setup();
    render(<TrackingSearch onSearch={onSearch} />);
    const field = screen.getByLabelText("Número de guía");
    await user.type(field, "hola");
    await user.click(screen.getByRole("button", { name: "Rastrear" }));
    expect(onSearch).not.toHaveBeenCalled();
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription(/16 dígitos.*formato correcto|formato correcto.*16 dígitos/s);
  });

  it("el error desaparece al volver a buscar con un número válido", async () => {
    const onSearch = jest.fn();
    const user = userEvent.setup();
    render(<TrackingSearch onSearch={onSearch} />);
    const field = screen.getByLabelText("Número de guía");
    await user.type(field, "1");
    await user.click(screen.getByRole("button", { name: "Rastrear" }));
    expect(field).toHaveAttribute("aria-invalid", "true");
    await user.clear(field);
    await user.type(field, "2148213907650312");
    await user.click(screen.getByRole("button", { name: "Rastrear" }));
    expect(field).not.toHaveAttribute("aria-invalid");
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it("el interruptor cambia entre un campo y un área de texto, y conserva solo la primera guía al volver", async () => {
    const user = userEvent.setup();
    render(<TrackingSearch onSearch={jest.fn()} />);
    expect(screen.getByLabelText("Número de guía").tagName).toBe("INPUT");

    await user.click(screen.getByRole("switch", { name: "Rastreo múltiple" }));
    const area = screen.getByLabelText("Números de guía");
    expect(area.tagName).toBe("TEXTAREA");
    expect(screen.getByText(/Máximo 10/)).toBeInTheDocument();
    await user.type(area, "2148213907650312{Enter}2103958472016654");

    await user.click(screen.getByRole("switch", { name: "Rastreo múltiple" }));
    expect(screen.getByLabelText("Número de guía")).toHaveValue("2148213907650312");
  });

  it("en modo múltiple busca todas las guías", async () => {
    const onSearch = jest.fn();
    const user = userEvent.setup();
    render(<TrackingSearch onSearch={onSearch} />);
    await user.click(screen.getByRole("switch", { name: "Rastreo múltiple" }));
    await user.type(screen.getByLabelText("Números de guía"), "2148213907650312, 2103 9584 7201 6654{Enter}2148213907650312");
    await user.click(screen.getByRole("button", { name: "Rastrear guías" }));
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith(["2148213907650312", "2103958472016654"]);
  });

  it("las guías de ejemplo rellenan el campo sin buscar", async () => {
    const onSearch = jest.fn();
    const user = userEvent.setup();
    render(<TrackingSearch onSearch={onSearch} examples={["2148213907650312"]} />);
    await user.click(screen.getByRole("button", { name: "2148 2139 0765 0312" }));
    expect(screen.getByLabelText("Número de guía")).toHaveValue("2148 2139 0765 0312");
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("refleja un valor inicial nuevo sin perder el foco del campo", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TrackingSearch onSearch={jest.fn()} initialValue="2148 2139 0765 0312" />);
    const field = screen.getByLabelText("Número de guía");
    expect(field).toHaveValue("2148 2139 0765 0312");
    await user.click(field);
    rerender(<TrackingSearch onSearch={jest.fn()} initialValue="2103 9584 7201 6654" />);
    expect(screen.getByLabelText("Número de guía")).toHaveValue("2103 9584 7201 6654");
    expect(screen.getByLabelText("Número de guía")).toHaveFocus();
  });
});
