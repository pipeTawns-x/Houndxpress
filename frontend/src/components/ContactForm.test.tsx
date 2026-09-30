import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ContactForm } from "./ContactForm.tsx";

async function fill(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Nombre"), "Laura Gómez");
  await user.type(screen.getByLabelText("Correo"), "laura@correo.com");
  await user.type(screen.getByLabelText("Teléfono de contacto"), "55 1234 5678");
  await user.type(screen.getByLabelText(/Mensaje/), "Quiero cotizar un envío a Bogotá.");
  await user.click(screen.getByRole("checkbox"));
}

describe("formulario de contacto", () => {
  it("dice antes de enviar que abrirá el correo y que no envía ni guarda nada", () => {
    render(<ContactForm onOpenMail={vi.fn()} />);
    expect(screen.getByText(/este sitio no envía ni guarda tu mensaje/)).toBeInTheDocument();
    expect(screen.getByText("sclientes1@hound-express.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir mi correo con el mensaje" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Enviar/ })).not.toBeInTheDocument();
  });

  it("valida en el cliente, muestra un error por campo y enfoca el primero", async () => {
    const onOpenMail = vi.fn();
    const user = userEvent.setup();
    render(<ContactForm onOpenMail={onOpenMail} />);
    await user.click(screen.getByRole("button", { name: "Abrir mi correo con el mensaje" }));

    expect(onOpenMail).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Nombre")).toHaveFocus();
    expect(screen.getByLabelText("Nombre")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Escribe tu nombre.")).toBeInTheDocument();
    expect(screen.getByText("Escribe tu correo.")).toBeInTheDocument();
    expect(screen.getByText("Escribe un teléfono de contacto.")).toBeInTheDocument();
    expect(screen.getByText(/al menos 10 caracteres/)).toBeInTheDocument();
    expect(screen.getByText("Acepta para poder preparar el correo.")).toBeInTheDocument();
    expect(screen.queryByText(/Preparamos el correo/)).not.toBeInTheDocument();
  });

  it("valida el número de guía solo si se escribió", async () => {
    const user = userEvent.setup();
    render(<ContactForm onOpenMail={vi.fn()} />);
    await fill(user);
    await user.type(screen.getByLabelText(/Número de guía/), "123");
    await user.click(screen.getByRole("button", { name: "Abrir mi correo con el mensaje" }));
    expect(screen.getByText(/Ese número de guía no tiene el formato correcto/)).toBeInTheDocument();
  });

  it("con datos válidos arma el mailto y lo entrega para abrirlo, sin decir que el mensaje se envió", async () => {
    const onOpenMail = vi.fn();
    const user = userEvent.setup();
    render(<ContactForm onOpenMail={onOpenMail} />);
    await fill(user);
    await user.selectOptions(screen.getByLabelText("Asunto"), "Cotización de servicio");
    await user.type(screen.getByLabelText(/Número de guía/), "2148213907650312");
    await user.click(screen.getByRole("button", { name: "Abrir mi correo con el mensaje" }));

    expect(onOpenMail).toHaveBeenCalledTimes(1);
    const url = String(onOpenMail.mock.calls[0]?.[0]);
    expect(url.startsWith("mailto:sclientes1@hound-express.com?subject=")).toBe(true);
    const query = new URLSearchParams(url.slice(url.indexOf("?") + 1).replace(/%20/g, " "));
    expect(query.get("subject")).toBe("Cotización de servicio · Guía 2148 2139 0765 0312");
    expect(query.get("body")).toContain("Quiero cotizar un envío a Bogotá.");
    expect(query.get("body")).toContain("Correo: laura@correo.com");

    const status = screen.getByText(/Preparamos el correo/);
    expect(status).toHaveTextContent("Revísalo y envíalo desde ahí");
    expect(screen.getByRole("link", { name: "ábrelo de nuevo" })).toHaveAttribute("href", url);
    expect(document.body).not.toHaveTextContent(/mensaje (fue )?enviado|se envió|gracias por comunicarte/i);
  });
});
