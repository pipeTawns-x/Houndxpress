import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { Accordion, AccordionItem } from "./Accordion.tsx";
import { ApiStatus } from "./ApiStatus.tsx";
import { Button } from "./Button.tsx";
import { DemoNotice } from "./DemoNotice.tsx";
import { Checkbox, Select, TextArea, TextField } from "./fields.tsx";
import { StageBadge } from "./StageBadge.tsx";

describe("ApiStatus", () => {
  it.each([
    ["checking", "Comprobando API…"],
    ["online", "API en línea · BD ok"],
    ["offline", "API sin conexión"],
  ] as const)("estado %s: %s", (status, text) => {
    render(<ApiStatus status={status} />);
    expect(screen.getByRole("status")).toHaveTextContent(text);
  });
});

describe("StageBadge", () => {
  it("muestra el nombre corto de la etapa y la entregada con palomita", () => {
    const { container, rerender } = render(<StageBadge code="vehicle_in_transit" />);
    expect(screen.getByText("En camino")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeNull();
    rerender(<StageBadge code="cargo_delivered" />);
    expect(screen.getByText("Entregada")).toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeNull();
  });
});

describe("DemoNotice", () => {
  it("avisa que los datos son de demostración y lista las 8 guías de ejemplo", () => {
    render(
      <MemoryRouter>
        <DemoNotice demo />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Datos de demostración:/)).toBeInTheDocument();
    expect(screen.getByText(/se guardan solo en este navegador/)).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(8);
    expect(screen.getAllByRole("link")[0]).toHaveAttribute("href", "/rastreo?guia=2148213907650312");
  });

  it("no se muestra cuando la aplicación usa la API", () => {
    const { container } = render(
      <MemoryRouter>
        <DemoNotice demo={false} />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("Button", () => {
  it("es type=button por defecto y no se dispara si está cargando", async () => {
    let clicks = 0;
    const user = userEvent.setup();
    const { rerender } = render(
      <Button
        onClick={() => {
          clicks += 1;
        }}
      >
        Guardar
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Guardar" })).toHaveAttribute("type", "button");
    await user.click(screen.getByRole("button", { name: "Guardar" }));
    expect(clicks).toBe(1);

    rerender(
      <Button
        loading
        onClick={() => {
          clicks += 1;
        }}
      >
        Guardar
      </Button>,
    );
    const busy = screen.getByRole("button", { name: "Guardar" });
    expect(busy).toBeDisabled();
    expect(busy).toHaveAttribute("aria-busy", "true");
    await user.click(busy);
    expect(clicks).toBe(1);
  });

  it("el botón principal es aqua con texto navy-950", () => {
    render(<Button>Rastrear</Button>);
    const classes = screen.getByRole("button").className;
    expect(classes).toContain("bg-aqua-500");
    expect(classes).toContain("text-navy-950");
  });
});

describe("campos", () => {
  it("TextField enlaza etiqueta, ayuda y error con aria-describedby y aria-invalid", () => {
    render(<TextField label="Correo" hint="Usa tu correo de trabajo." error="Revisa tu correo." />);
    const input = screen.getByLabelText("Correo");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAccessibleDescription("Usa tu correo de trabajo. Revisa tu correo.");
  });

  it("sin error no se marca como inválido y un campo opcional no es obligatorio", () => {
    render(<TextField label="Teléfono" optional />);
    const input = screen.getByLabelText(/Teléfono/);
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-required");
    expect(screen.getByText("(opcional)")).toBeInTheDocument();
  });

  it("conserva un aria-describedby propio junto al de la ayuda", () => {
    render(<TextField label="Nombre" hint="Ayuda" aria-describedby="externo" />);
    expect(screen.getByLabelText("Nombre").getAttribute("aria-describedby")).toMatch(/-hint externo$/);
  });

  it("TextArea, Select y Checkbox también enlazan su error", () => {
    render(
      <>
        <TextArea label="Mensaje" error="Falta el mensaje." />
        <Select label="Asunto" error="Elige un asunto.">
          <option>Uno</option>
        </Select>
        <Checkbox label="Acepto" error="Debes aceptar." />
      </>,
    );
    expect(screen.getByLabelText("Mensaje")).toHaveAccessibleDescription("Falta el mensaje.");
    expect(screen.getByLabelText("Asunto")).toHaveAccessibleDescription("Elige un asunto.");
    expect(screen.getByRole("checkbox", { name: "Acepto" })).toHaveAccessibleDescription("Debes aceptar.");
    expect(screen.getByRole("checkbox", { name: "Acepto" })).toHaveAttribute("aria-invalid", "true");
  });

  it("dos campos con la misma etiqueta no comparten ids", () => {
    render(
      <>
        <TextField label="Uno" />
        <TextField label="Dos" />
      </>,
    );
    expect(screen.getByLabelText("Uno").id).not.toBe(screen.getByLabelText("Dos").id);
  });
});

describe("Accordion", () => {
  it("usa details/summary y se abre al activar la pregunta", async () => {
    const user = userEvent.setup();
    render(
      <Accordion>
        <AccordionItem question="¿Primera?">Respuesta uno</AccordionItem>
        <AccordionItem question="¿Segunda?" defaultOpen>
          Respuesta dos
        </AccordionItem>
      </Accordion>,
    );
    const first = screen.getByText("¿Primera?").closest("details");
    expect(first).not.toHaveAttribute("open");
    expect(screen.getByText("¿Segunda?").closest("details")).toHaveAttribute("open");
    await user.click(screen.getByText("¿Primera?"));
    expect(first).toHaveAttribute("open");
  });
});
