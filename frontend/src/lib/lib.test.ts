import { NETWORK_NODES, NETWORK_ROUTES } from "../content/coverage.ts";
import { FAQ } from "../content/faq.ts";
import { NAV_ITEMS } from "../content/site.ts";
import { validateContact } from "./contactForm.ts";
import { filterFaq } from "./faqSearch.ts";
import { foldText, formatDate, formatDateRange, formatDateTime, telHref } from "./format.ts";
import { buildMailto } from "./mailto.ts";
import { MAP_HEIGHT, MAP_WIDTH, arcPath, project } from "./projection.ts";
import { readGuideParam, trackingPath } from "./routes.ts";

describe("formato de fechas", () => {
  it("usa la zona horaria de Ciudad de México y el idioma es-MX", () => {
    // 2026-09-28T15:00Z son las 9:00 a.m. en la Ciudad de México (UTC-6, sin horario de verano desde 2022).
    const text = formatDateTime("2026-09-28T15:00:00.000Z");
    expect(text).toMatch(/28/);
    expect(text).toMatch(/2026/);
    expect(text).toMatch(/9:00/);
    expect(text.toLowerCase()).toMatch(/sep/);
  });

  it("a medianoche UTC todavía es el día anterior en México", () => {
    expect(formatDate("2026-10-01T03:00:00.000Z")).toMatch(/^30 /);
  });

  it("formatea rangos y tolera fechas inválidas", () => {
    expect(formatDateRange("2026-10-03T15:00:00.000Z", "2026-10-06T15:00:00.000Z")).toMatch(/3 .* – 6 .* 2026/);
    expect(formatDateTime("no es fecha")).toBe("Fecha no disponible");
    expect(formatDateRange("x", "y")).toBe("Fecha no disponible");
  });

  it("foldText quita acentos y mayúsculas; telHref deja solo dígitos y +", () => {
    expect(foldText("Detenido en ADUANA, ¿qué pasó?")).toBe("detenido en aduana, ¿que paso?");
    expect(telHref("+52 55 4000 1920")).toBe("tel:+525540001920");
  });
});

describe("rutas de rastreo", () => {
  it("arma y lee ?guia= con varias guías", () => {
    expect(trackingPath(["2148213907650312", "2103958472016654"])).toBe("/rastreo?guia=2148213907650312,2103958472016654");
    expect(trackingPath([])).toBe("/rastreo");
    expect(readGuideParam("2148 2139 0765 0312, 2103958472016654,2148213907650312")).toEqual({
      numbers: ["2148213907650312", "2103958472016654"],
      total: 2,
    });
    expect(readGuideParam(null)).toEqual({ numbers: [], total: 0 });
  });

  it("lee como máximo 10 guías", () => {
    const many = Array.from({ length: 15 }, (_, index) => `21${String(index).padStart(14, "0")}`).join(",");
    const read = readGuideParam(many);
    expect(read.numbers).toHaveLength(10);
    expect(read.total).toBe(15);
  });
});

describe("búsqueda en preguntas frecuentes", () => {
  it("ignora acentos y mayúsculas y exige todas las palabras", () => {
    expect(filterFaq(FAQ, "ADUANA").map((entry) => entry.id)).toContain("detenido-aduana");
    expect(filterFaq(FAQ, "aduana 72 horas").map((entry) => entry.id)).toEqual(["detenido-aduana"]);
    expect(filterFaq(FAQ, "domicilio").length).toBeGreaterThan(1);
  });

  it("sin texto devuelve todas y sin coincidencias devuelve vacío", () => {
    expect(filterFaq(FAQ, "  ")).toHaveLength(FAQ.length);
    expect(filterFaq(FAQ, "zzzz-no-existe")).toEqual([]);
  });

  it("las preguntas frecuentes no repiten identificadores", () => {
    expect(new Set(FAQ.map((entry) => entry.id)).size).toBe(FAQ.length);
  });
});

describe("mailto", () => {
  const data = {
    name: "Laura Gómez",
    email: "laura@correo.com",
    phone: "55 1234 5678",
    subject: "Seguimiento de paquete",
    guideNumber: "2148 2139 0765 0312",
    message: "¿Dónde está mi paquete?\nGracias & saludos",
  };

  it("arma un enlace mailto: para sclientes1@hound-express.com con asunto y cuerpo codificados", () => {
    const url = buildMailto(data);
    expect(url.startsWith("mailto:sclientes1@hound-express.com?")).toBe(true);
    const query = new URLSearchParams(url.slice(url.indexOf("?") + 1).replace(/%20/g, " "));
    expect(query.get("subject")).toBe("Seguimiento de paquete · Guía 2148 2139 0765 0312");
    const body = query.get("body") ?? "";
    expect(body).toContain("Nombre: Laura Gómez");
    expect(body).toContain("Número de guía: 2148 2139 0765 0312");
    expect(body).toContain("Gracias & saludos");
    expect(url).not.toContain("+");
    expect(url).toContain("%26");
  });

  it("omite el número de guía cuando no se escribió", () => {
    const url = decodeURIComponent(buildMailto({ ...data, guideNumber: "" }));
    expect(url).not.toContain("Número de guía");
    expect(url).toContain("subject=Seguimiento de paquete&");
  });
});

describe("validación del contacto", () => {
  const valid = {
    name: "Laura",
    email: "laura@correo.com",
    phone: "55 4000 1920",
    subject: "Información general",
    guideNumber: "",
    message: "Necesito una cotización.",
    privacy: true,
  };

  it("acepta datos completos con el número de guía opcional vacío", () => {
    expect(validateContact(valid)).toEqual({});
  });

  it("marca cada campo con problema", () => {
    const errors = validateContact({
      name: " ",
      email: "laura@",
      phone: "12",
      subject: "Información general",
      guideNumber: "123",
      message: "corto",
      privacy: false,
    });
    expect(Object.keys(errors).sort()).toEqual(["email", "guideNumber", "message", "name", "phone", "privacy"]);
  });

  it("valida el número de guía solo si se escribió", () => {
    expect(validateContact({ ...valid, guideNumber: "2148 2139 0765 0312" })).toEqual({});
  });
});

describe("mapa de red", () => {
  it("proyecta lat/long de forma equirrectangular: norte arriba y este a la derecha", () => {
    const miami = project(25.7617, -80.1918);
    const bogota = project(4.711, -74.0721);
    const buenosAires = project(-34.6037, -58.3816);
    expect(bogota.y).toBeGreaterThan(miami.y);
    expect(buenosAires.y).toBeGreaterThan(bogota.y);
    expect(bogota.x).toBeGreaterThan(miami.x);
    // Lineal: la diferencia de x entre dos ciudades es proporcional a la diferencia de longitud.
    expect(bogota.x - miami.x).toBeCloseTo((-74.0721 - -80.1918) * 10, 6);
    expect(bogota.y - miami.y).toBeCloseTo((25.7617 - 4.711) * 10, 6);
  });

  it("todos los nodos caen dentro del mapa", () => {
    expect(NETWORK_NODES).toHaveLength(10);
    for (const node of NETWORK_NODES) {
      const { x, y } = project(node.lat, node.lon);
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(MAP_WIDTH);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(MAP_HEIGHT);
    }
  });

  it("las rutas parten de Miami y de Laredo y unen nodos que existen", () => {
    const ids = new Set(NETWORK_NODES.map((node) => node.id));
    for (const [from, to] of NETWORK_ROUTES) {
      expect(["miami", "laredo"]).toContain(from);
      expect(ids.has(from) && ids.has(to)).toBe(true);
    }
  });

  it("dibuja un arco curvo (Bézier cuadrática) abombado hacia arriba", () => {
    const d = arcPath({ x: 0, y: 100 }, { x: 100, y: 100 });
    const match = /^M 0\.0 100\.0 Q ([\d.]+) ([\d.]+) 100\.0 100\.0$/.exec(d);
    expect(match).not.toBeNull();
    expect(Number(match?.[1])).toBeCloseTo(50, 1);
    expect(Number(match?.[2])).toBeLessThan(100);
    expect(arcPath({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe("M 5 5");
  });
});

describe("navegación", () => {
  it("lista Servicios, Cobertura, Rastreo, Nosotros, Preguntas y Contacto", () => {
    expect(NAV_ITEMS.map((item) => item.label)).toEqual([
      "Servicios",
      "Cobertura",
      "Rastreo",
      "Nosotros",
      "Preguntas",
      "Contacto",
    ]);
  });
});
