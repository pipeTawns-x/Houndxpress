import { screen, waitFor, within } from "@testing-library/react";
import { scrollToMock } from "./test/mocks.ts";
import { renderApp } from "./test/renderApp.tsx";

const ROUTES: [string, RegExp, string][] = [
  ["/", /Movemos tu ecommerce de local a global/, "Logística cross-border para ecommerce · Hound Express"],
  ["/rastreo", /Rastrea tu paquete/, "Rastrea tu paquete · Hound Express"],
  ["/servicios", /Servicios para que tu ecommerce compita/, "Servicios de logística para ecommerce · Hound Express"],
  ["/cobertura", /Una red que conecta Estados Unidos/, "Cobertura en Estados Unidos y Latinoamérica · Hound Express"],
  ["/nosotros", /Impulsamos el crecimiento del ecommerce/, "Nosotros · Hound Express"],
  ["/preguntas", /Respuestas a las consultas más comunes/, "Preguntas frecuentes · Hound Express"],
  ["/contacto", /Estamos a un mensaje de distancia/, "Contacto · Hound Express"],
  ["/panel", /^Panel de operaciones$/, "Panel de operaciones · Hound Express"],
  ["/disenos", /^Índice de diseños$/, "Índice de diseños · Hound Express"],
  ["/ruta-que-no-existe", /Esta página no está en la ruta/, "Página no encontrada · Hound Express"],
];

describe("rutas", () => {
  it.each(ROUTES)("%s muestra un solo h1 y fija el título de la pestaña", async (route, heading, title) => {
    await renderApp(route);
    expect(await screen.findByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    await waitFor(() => {
      expect(document.title).toBe(title);
    });
  });

  it("todas las pantallas dejan un solo <main id=contenido> y el enlace para saltar apunta a él", async () => {
    await renderApp("/servicios");
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("main")).toHaveAttribute("id", "contenido");
    expect(screen.getByRole("link", { name: "Saltar al contenido" })).toHaveAttribute("href", "#contenido");
  });

  it("el índice de diseños lista todas las pantallas con enlace y descripción", async () => {
    await renderApp("/disenos");
    const list = await screen.findByRole("heading", { level: 2, name: "Pantallas" });
    const section = list.closest("section") as HTMLElement;
    const links = within(section).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/",
      "/rastreo",
      "/servicios",
      "/cobertura",
      "/nosotros",
      "/preguntas",
      "/contacto",
      "/panel",
      "/disenos",
      "/pagina-que-no-existe",
    ]);
  });

  it("la página 404 ofrece volver al inicio y al rastreo", async () => {
    await renderApp("/nada");
    expect(await screen.findByRole("link", { name: "Ir al inicio" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Rastrear un paquete" })).toHaveAttribute("href", "/rastreo");
  });

  it("navegar entre rutas cambia la página, vuelve arriba y mueve el foco al contenido", async () => {
    const { user } = await renderApp("/");
    const nav = screen.getByRole("navigation", { name: "Principal" });
    await user.click(within(nav).getByRole("link", { name: "Servicios" }));
    expect(await screen.findByRole("heading", { level: 1, name: /Servicios para que tu ecommerce/ })).toBeInTheDocument();
    expect(scrollToMock).toHaveBeenCalled();
    expect(screen.getByRole("main")).toHaveFocus();
    expect(within(nav).getByRole("link", { name: "Servicios" })).toHaveAttribute("aria-current", "page");
  });

  it("un enlace con #ancla se desplaza a esa sección en lugar de volver arriba", async () => {
    const scrollIntoView = jest.fn();
    Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: scrollIntoView });
    try {
      const { user } = await renderApp("/");
      await user.click(screen.getByRole("link", { name: /Conocer más.*Almacén/ }));
      expect(await screen.findByRole("heading", { level: 1, name: /Servicios para que tu ecommerce/ })).toBeInTheDocument();
      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      expect(scrollToMock).not.toHaveBeenCalled();
    } finally {
      Reflect.deleteProperty(Element.prototype, "scrollIntoView");
    }
  });

  it("no mueve el foco ni vuelve arriba al cambiar solo la búsqueda (?guia=)", async () => {
    const { user } = await renderApp("/rastreo");
    await user.type(screen.getByLabelText("Número de guía"), "2119875302467781");
    await user.click(screen.getByRole("button", { name: "Rastrear" }));
    await screen.findByRole("heading", { level: 3, name: "2119 8753 0246 7781" });
    expect(scrollToMock).not.toHaveBeenCalled();
  });
});

describe("encabezado", () => {
  it("el botón de menú abre el cajón y Escape lo cierra devolviendo el foco al botón", async () => {
    const { user } = await renderApp("/");
    const toggle = screen.getByRole("button", { name: "Abrir menú" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("navigation", { name: "Menú móvil" })).not.toBeInTheDocument();

    await user.click(toggle);
    const drawer = screen.getByRole("navigation", { name: "Menú móvil" });
    expect(screen.getByRole("button", { name: "Cerrar menú" })).toHaveAttribute("aria-expanded", "true");
    expect(within(drawer).getAllByRole("link").map((link) => link.textContent)).toEqual([
      "Servicios",
      "Cobertura",
      "Rastreo",
      "Nosotros",
      "Preguntas",
      "Contacto",
      "Rastrear",
      "Panel de operaciones",
    ]);
    // Mientras está abierto: la página no se desplaza y el contenido queda inerte.
    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getByRole("main")).toHaveAttribute("inert");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("navigation", { name: "Menú móvil" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir menú" })).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
    expect(screen.getByRole("main")).not.toHaveAttribute("inert");
  });

  it("el botón de menú también cierra el cajón", async () => {
    const { user } = await renderApp("/");
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    await user.click(screen.getByRole("button", { name: "Cerrar menú" }));
    expect(screen.queryByRole("navigation", { name: "Menú móvil" })).not.toBeInTheDocument();
  });

  it("el cajón se cierra al navegar", async () => {
    const { user } = await renderApp("/");
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    await user.click(within(screen.getByRole("navigation", { name: "Menú móvil" })).getByRole("link", { name: "Cobertura" }));
    expect(await screen.findByRole("heading", { level: 1, name: /Una red que conecta/ })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Menú móvil" })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });

  it("los botones Rastrear y Panel llevan a sus rutas", async () => {
    await renderApp("/");
    const header = screen.getByRole("banner");
    expect(within(header).getByRole("link", { name: "Rastrear" })).toHaveAttribute("href", "/rastreo");
    expect(within(header).getByRole("link", { name: "Panel" })).toHaveAttribute("href", "/panel");
    expect(within(header).getByRole("link", { name: "Hound Express, ir al inicio" })).toHaveAttribute("href", "/");
  });
});

describe("pie de página", () => {
  it("muestra el logo blanco, contacto por país, horario y la nota académica", async () => {
    await renderApp("/");
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByRole("img", { name: "Hound Express" })).toHaveAttribute("src", "/brand/logo-hound-express-blanco.svg");
    expect(within(footer).getByText("We move ecommerce globally!")).toBeInTheDocument();
    expect(within(footer).getByRole("link", { name: "+52 55 4000 1920" })).toHaveAttribute("href", "tel:+525540001920");
    expect(within(footer).getByRole("link", { name: "+1 956 568 3443" })).toHaveAttribute("href", "tel:+19565683443");
    expect(within(footer).getByRole("link", { name: "+1 786 528 8261" })).toHaveAttribute("href", "tel:+17865288261");
    expect(within(footer).getByRole("link", { name: "sclientes1@hound-express.com" })).toHaveAttribute(
      "href",
      "mailto:sclientes1@hound-express.com",
    );
    expect(within(footer).getByText("Lunes a viernes")).toBeInTheDocument();
    expect(within(footer).getByText(/09:00 – 18:00/)).toBeInTheDocument();
    expect(within(footer).getByText("Proyecto académico de EBAC para Hound Express. Rediseño no oficial.")).toBeInTheDocument();
  });

  it("el chip de la API dice que no hay conexión cuando el estado no responde", async () => {
    await renderApp("/");
    expect(within(screen.getByRole("contentinfo")).getByRole("status")).toHaveTextContent("API sin conexión");
  });
});

describe("inicio", () => {
  it("el buscador de la portada lleva a /rastreo con la guía", async () => {
    const { user } = await renderApp("/");
    await user.type(screen.getByLabelText("Número de guía"), "2148 2139 0765 0312");
    await user.click(screen.getByRole("button", { name: "Rastrear" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Rastrea tu paquete" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { level: 3, name: "2148 2139 0765 0312" })).toBeInTheDocument();
  });

  it("incluye cifras, servicios, recorrido, cobertura, panel, alianzas, preguntas y contacto", async () => {
    await renderApp("/");
    for (const name of [
      /Todo lo que tu ecommerce necesita/,
      /Cómo viaja tu paquete/,
      /Conectamos a toda Latinoamérica/,
      /Ten el control de tu operación/,
      /Con la confianza de las instituciones/,
      /Respuestas a lo que más nos preguntan/,
      /Estamos a un mensaje de distancia/,
    ]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
    const stats = screen.getByRole("region", { name: "Hound Express en cifras" });
    expect(within(stats).getAllByRole("listitem")).toHaveLength(4);
    expect(within(stats).getByText("m² de almacenes").previousElementSibling).toHaveTextContent("+15,000");
    expect(screen.getByText("¿No tienes tu número? Está en el correo de tu compra.")).toBeInTheDocument();
  });

  it("el mapa de red tiene nombre accesible y una lista de las diez ciudades", async () => {
    await renderApp("/cobertura");
    const map = screen.getByRole("img", { name: "Mapa de la red de Hound Express" });
    expect(map).toBeInTheDocument();
    const list = map.closest("figure")?.querySelector("figcaption ul");
    expect(list?.querySelectorAll("li")).toHaveLength(10);
    expect(list).toHaveTextContent("Miami, Florida");
    expect(list).toHaveTextContent("Buenos Aires, Argentina");
  });
});
