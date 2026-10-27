# Contenido 1 a 1: sitio actual → rediseño

"1 a 1" quiere decir que **cada página viva del sitio actual tiene su pantalla en el rediseño** y que su contenido llega completo. La forma cambia; el contenido no se pierde.

El inventario sale del **sitemap de Yoast** (`https://www.hound-express.com/hx/page-sitemap.xml`, 26 URLs), con el estado de cada URL comprobado el 9 de octubre de 2026. No sale de los enlaces de la portada: la portada deja fuera páginas que sí responden. Los textos ya extraídos del sitio actual están en `contenido-v1/` (`site.ts`, `services.ts`, `coverage.ts`, `culture.ts`, `faq.ts`): úsalos tal cual, no los reescribas ni inventes cifras.

## Inventario del sitemap

El sitemap trae 26 URLs. Cuatro son versiones anteriores o internas y **no se replican**; las 22 restantes sí.

### Se replican (22)

| Página actual | Estado comprobado |
|---|---|
| `/hx/` | 200 · Inicio - HX |
| `/hx/alianza-amazon-latam/` | 200 |
| `/hx/alianzas/` | 200 · índice de alianzas |
| `/hx/amazonspn/` | 200 · Amazon SPN |
| `/hx/blog/` | 200 |
| `/hx/contactanos/` | 200 |
| `/hx/cross-border-argentina/` | 200 |
| `/hx/cross-border-brasil/` | 200 |
| `/hx/cross-border-chile/` | 200 |
| `/hx/cross-border-colombia/` | 200 |
| `/hx/cross-border-mexico/` | 200 |
| `/hx/nosotros/` | 200 |
| `/hx/noticias/` | 200 |
| `/hx/preguntas-frecuentes/` | 200 |
| `/hx/privacidad/` | 200 |
| `/hx/servicio-cargo/` | 200 |
| `/hx/servicio-customs/` | 200 |
| `/hx/servicio-ecommerce/` | 200 |
| `/hx/servicio-parcel/` | 200 |
| `/hx/terminos-y-condiciones/` | 200 |
| `/hx/tracking/` | 200 |
| `/hx/walmart-marketplace/` | 200 |

### No se replican (4)

| Página actual | Motivo |
|---|---|
| `/hx/inicio/` | "Inicio Anterior": versión vieja de la portada |
| `/hx/nosotros_anterior/` | "Nosotros anterior": versión vieja |
| `/hx/servicio-ecommerce-anterior/` | "Servicio Ecommerce Anterior": versión vieja |
| `/hx/banners/` | "Banners": página interna de recursos, sin equivalente público |

### Rastreo: dos URLs vivas, no tres

| URL | Estado comprobado |
|---|---|
| `https://www.hound-express.com/tracking.html` | 200 · Tracking |
| `https://www.hound-express.com/hx/tracking/` | 200 · Tracking - HX |
| `https://www.hound-express.com/hx/tracking.html/` | **404** · Página no encontrada |

Las dos primeras llevan al mismo buscador y son la fila 2 del mapa. La tercera se había dado por viva y no lo está: **no entra al mapa**.

### Espejo en inglés `/hx/en/`

`/hx/en/` no es una plantilla "plus 6": es un espejo del sitio hecho con **Weglot**. Su portada enlaza 18 rutas (16 páginas de contenido, el propio índice y una ruta propia `/hx/en/Sabueso/`). Se trata como la **versión en inglés completa**, no como un extra menor. Es la fila 14 del mapa, lote 5 y solo si entra.

## Mapa de páginas

| # | Página actual | Ruta nueva | Plantilla | Lote |
|---|---|---|---|---|
| 1 | `/hx/` | `/` | Inicio | 1 |
| 2 | `/tracking.html`, `/hx/tracking/` | `/rastreo` | Rastreo | 2 |
| 3 | — (no existe) | `/panel` | Panel de operaciones | 3 |
| 4 | `/hx/servicio-ecommerce/`, `/hx/servicio-cargo/`, `/hx/servicio-customs/`, `/hx/servicio-parcel/` | `/servicios` | Servicios | 4 |
| 5 | `/hx/cross-border-mexico/`, `-argentina/`, `-brasil/`, `-chile/`, `-colombia/` | `/cobertura` y `/cobertura/:pais` | Cobertura + **País** (una plantilla, cinco instancias) | 4 |
| 6 | `/hx/alianzas/` (índice), `/hx/alianza-amazon-latam/`, `/hx/walmart-marketplace/`, `/hx/amazonspn/` | `/alianzas` y `/alianzas/:marketplace` | **Alianza** (un índice `/alianzas` más tres instancias: Amazon LATAM, Walmart Marketplace y Amazon SPN) | 4 |
| 7 | `/hx/nosotros/` | `/nosotros` | Nosotros | 4 |
| 8 | `/hx/noticias/` (y `/hx/blog/`) | `/noticias` | **Hound Express en medios** | 4 |
| 9 | `/hx/preguntas-frecuentes/` | `/preguntas` | Preguntas frecuentes | 4 |
| 10 | `/hx/contactanos/` | `/contacto` | Contacto | 4 |
| 11 | `/hx/privacidad/`, `/hx/terminos-y-condiciones/` | `/privacidad`, `/terminos` | **Legal** (una plantilla, dos instancias) | 4 |
| 12 | — | `*` | 404 | 5 |
| 13 | — | `/disenos` | Índice de diseños (guía de estilo viva) | 5 |
| 14 | `/hx/en/…` (espejo Weglot, 16 páginas) | `/en/…` | Versión en inglés | 5, solo si entra |

En **negritas**, las plantillas que la versión 1 no tenía. Son las que hacen que el rediseño sea 1 a 1.

## Contenido por plantilla

**Inicio.** Propuesta de valor ("Expertos en logística y comercio internacional para ecommerce", "Escala tu eCommerce de local a global"), buscador de guía, cifras (2 hubs en USA, 10 puntos de entrada en LATAM, +15,000 m², +3,000 puntos de recolección, +200,000 devoluciones al mes, capacidad de +1 millón de paquetes), servicios, cómo viaja tu paquete (las cinco etapas), cobertura, alianzas, afiliaciones (IATA, COFOCE, Aftership), tres preguntas frecuentes, contacto.

**Servicios.** Cross border, Transporte aéreo (miembro IATA), Logística inversa, Última milla (estándar 6–9 días, priority 3–5 días), Almacén con seguridad 24/7. Texto en `contenido-v1/services.ts`. Las páginas `/hx/servicio-cargo/`, `/hx/servicio-customs/` y `/hx/servicio-parcel/` son variantes del mismo servicio: su texto **todavía no está extraído en `contenido-v1/`** — hay que levantarlo antes de diseñar la fila 4.

**Cobertura y País.** Hubs: Laredo (Texas), Miami (Florida), Nuevo Laredo, Ciudad de México, Monterrey, Guadalajara. Países: Argentina, Brasil, Chile, Colombia, México. La plantilla País repite estructura: héroe con el país, ruta desde el hub de USA, tiempos, servicios disponibles y contacto. Datos en `contenido-v1/coverage.ts`.

**Alianza.** Un índice `/alianzas` más tres instancias: Amazon LATAM ("Vende en Amazon LATAM"), Walmart Marketplace ("Vende y envía de México a EE. UU.") y Amazon SPN (`/hx/amazonspn/`). El texto de Amazon SPN no está extraído y su relación con la alianza LATAM está sin confirmar. Qué ofrece cada alianza, a quién le sirve y llamada a contacto. La asignación de cada texto a su marketplace es una inferencia pendiente de confirmar con Hound Express: márcala como tal en `decisiones.md`.

**Hound Express en medios.** El sitio actual enlaza menciones en The Logistic World, Info Mundial, Conexión 360, MSN Noticias, Dinero en Imagen y America Retail. Tarjetas con medio, titular y enlace externo. No inventes titulares: usa "Mención en {medio}" hasta tener el texto real.

**Nosotros.** Filosofía y los seis ejes: Enfocados en el cliente, Innovación continua, Integridad comercial, Dirección al resultado, Soluciones de calidad, El valor de la persona (`contenido-v1/culture.ts`).

**Preguntas frecuentes.** Tiempos (internacional 15–20 días, nacional 5–7 días), formato de guía, "Detenido en aduana" (48–72 h), "Importación prohibida", entregado sin recibir, extraviado, corrección de datos, recoger en almacén. Texto en `contenido-v1/faq.ts`.

**Contacto.** MX +52 55 4000 1920 (sclientes1@hound-express.com), Laredo +1 956 568 3443 (cslaredo1@hound-express.com), Miami +1 786 528 8261 (sales@hound-express.com). Horario: lunes a viernes 09:00–18:00, sábados 09:00–13:00. El sitio actual también dice 08:00–18:00 para la opción 2 de la línea 55: conserva las dos redacciones y márcalo como pendiente de Hound Express.

**Legal.** Plantilla de lectura larga: índice lateral en escritorio, título, fecha de actualización y secciones. El texto legal se copia del sitio actual al implementar; en el diseño basta con encabezados reales y párrafos de muestra marcados como tales.

## Contenido pendiente de extraer

Antes de diseñar la fila 4 y la fila 6 hay que levantar estos textos y agregarlos a `contenido-v1/`:

- `/hx/servicio-cargo/`, `/hx/servicio-customs/`, `/hx/servicio-parcel/` (fila 4)
- `/hx/alianzas/` (índice) y `/hx/amazonspn/` (fila 6)
