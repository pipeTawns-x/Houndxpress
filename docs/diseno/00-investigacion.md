# 00 · Investigación del sitio actual de Hound Express

Fecha: 30 de septiembre de 2026. Fuente: HTML, CSS y SVG descargados con `curl` de `www.hound-express.com` el mismo día. Las páginas no se pudieron renderizar con navegador desde la nube (el navegador sin interfaz no confía en el certificado del proxy de la sesión y no se desactivó TLS para forzarlo), así que esta investigación trabaja sobre el código fuente de cada página, no sobre capturas.

## 1. Dos sitios en uno

El dominio sirve dos aplicaciones distintas que el visitante percibe como una sola:

| Parte | URL | Tecnología | Evidencia |
|---|---|---|---|
| Sitio institucional | `/hx/` y subpáginas | WordPress con Elementor Pro, Revolution Slider, Forminator y Weglot | rutas `wp-content/plugins/elementor-pro`, `revslider`, `forminator`, `weglot` en `home.html` |
| Rastreo de paquetes | `/tracking.html` | Página estática con Bootstrap 4, jQuery 3.4.1 y 12 plugins de jQuery | `<script src="js/jquery-3.4.1.min.js">`, `owl.carousel`, `cubeportfolio`, `revolution` en `tracking.html` |

Consecuencias observables en el código:

- **El menú no coincide.** El sitio institucional ofrece `Ecommerce · USA–LATAM (Argentina, Brasil, Chile, Colombia, México)`; el menú del rastreo (`menu.html`) todavía ofrece `Ecommerce · Cargo · Customs · Parcel`. Quien pasa de una parte a la otra ve dos navegaciones.
- **El rastreo carga código que no usa.** `tracking.html` pesa 4.9 KB, pero pide Revolution Slider, Owl Carousel, Cube Portfolio, Fancybox, Tooltipster, WOW, Parallaxie y countTo, y arma el formulario concatenando cadenas HTML en `js/hound_express_tracking_addon.js`.
- **El encabezado y el pie se inyectan con `$.load()`** (`menu.html`, `footer.html`, `chatsWhatsMessenger.html`): sin JavaScript no hay navegación.
- **La página de inicio pesa 394 KB de HTML** antes de imágenes, con dos contenedores de Google Tag Manager distintos (`GTM-WFHJ6CN` en el sitio y `GTM-MP2GRVN` en el rastreo).

## 2. Contenido que el rediseño debe conservar

Se extrajo el texto de Inicio, Nosotros, Servicio Ecommerce, Cross Border México y Preguntas frecuentes. Lo esencial:

- **Propuesta de valor:** "Expertos en logística y comercio internacional para ecommerce", "We move ecommerce globally!", "Escala tu eCommerce de local a global".
- **Cifras:** 2 puntos estratégicos en USA (Laredo y Miami), 10 puntos de entrada en LATAM, más de 15,000 m² de almacenes, más de 3,000 puntos de recolección en México, más de 200,000 devoluciones procesadas al mes, capacidad para más de 1 millón de paquetes.
- **Servicios:** Cross border, Transporte aéreo (miembro IATA), Logística inversa, Última milla (estándar 6–9 días, priority 3–5 días), Almacén con seguridad 24/7.
- **Cobertura:** Laredo (Texas), Miami (Florida), Nuevo Laredo, Ciudad de México, Monterrey, Guadalajara; operaciones en Argentina, Brasil, Chile, Colombia y México.
- **Ejes de cultura (Nosotros):** Enfocados en el cliente, Innovación continua, Integridad comercial, Dirección al resultado, Soluciones de calidad, El valor de la persona.
- **Preguntas frecuentes:** tiempos (internacional 15–20 días, nacional 5–7 días), formato de guía (16 dígitos que inician con 21, o 22 caracteres), estatus "Detenido en aduana" (48–72 h), "Importación prohibida", entregado sin recibir, extraviado, corrección de datos, recoger en almacén.
- **Contacto:** MX +52 55 4000 1920 (sclientes1@hound-express.com), Laredo +1 956 568 3443 (cslaredo1@hound-express.com), Miami +1 786 528 8261 (sales@hound-express.com). Horario: lunes a viernes 09:00–18:00, sábados 09:00–13:00.
- **Afiliaciones:** IATA, COFOCE, Aftership.

## 3. Identidad visual medida

Colores más repetidos, contados en el CSS y en los estilos en línea:

| Rol | Valor | Dónde aparece |
|---|---|---|
| Azul marino de marca | `#18233E` / `#17233D` | trazo principal del logo `logo-hound.svg`, textos del sitio Elementor |
| Azul marino profundo | `#091E3F` / `#011E41` | clase `azulManrinotxt` del rastreo, fondos oscuros |
| Aqua de marca | `#4CBED8` / `#4EBED8` | segundo color del logo, acentos del sitio |
| Cian brillante | `#23CED5` / `#6AC6DE` | botones y bordes del rastreo (54 y 89 usos en `style.css`) |
| Azul de apoyo | `#5192E1` | enlaces y estados del rastreo (105 usos) |
| Error | `#DC3545` | mensajes de guía no encontrada (`hound_express_tracking_addon.css`) |

Tipografías declaradas: `CocoSharp` (propietaria, en el rastreo), `Open Sans`, `Montserrat 600`, `Inter 500` y `Roboto 400` (en la URL de Google Fonts del sitio). Son cinco familias para una sola marca.

## 4. Lo que funciona y se conserva

1. El logo del sabueso en marino y aqua es reconocible y funciona en fondo claro y oscuro.
2. El mensaje comercial es claro: logística cross-border para ecommerce, con cifras concretas.
3. El rastreo pide un solo dato (número de guía) y admite búsqueda múltiple.
4. Las preguntas frecuentes responden dudas reales de destinatarios, no de vendedores.

## 5. Problemas que el rediseño resuelve

| # | Problema | Evidencia | Qué hace el rediseño |
|---|---|---|---|
| P1 | El rastreo, que es la tarea más frecuente del destinatario, vive fuera del sitio y con otra navegación | `tracking.html` independiente con su propio `menu.html` | Rastreo integrado en la portada y en su propia ruta, con el mismo encabezado |
| P2 | Cinco familias tipográficas | URL de Google Fonts y `style.css` | Dos familias: Plus Jakarta Sans para títulos e Inter para texto |
| P3 | La paleta tiene cuatro azules casi iguales sin rol definido | tabla de la sección 3 | Tokens con rol: `navy`, `aqua`, `sky`, estados |
| P4 | Sin JavaScript no hay menú ni pie | `$('.menuContainer').load('menu.html')` | Encabezado y pie son parte de la aplicación |
| P5 | El resultado del rastreo no muestra en qué etapa del proceso va la guía | `hound_express_tracking_addon.js` pinta una tabla de eventos | Línea de tiempo con las cinco etapas del proceso y la etapa actual resaltada |
| P6 | El personal no tiene una vista de sus guías | no existe interfaz de operadores (README, "Interfaz para operadores: no iniciada") | Panel de operaciones: registrar, listar, buscar, avanzar etapa e historial |

## 6. Lo que no se copia

- El código de WordPress, Elementor y del rastreo legado. El rediseño es una aplicación nueva.
- La llave de socio del servicio de rastreo (`houndExpressPartnerKey` en `hound_express_tracking_addon.js`). El rediseño no llama al servicio real de la empresa; trabaja con datos de demostración hasta que el backend del proyecto exponga sus endpoints (M64).
- Las fotografías e ilustraciones del sitio. El rediseño usa ilustraciones SVG propias.

El único recurso de la empresa que se reutiliza es su logotipo (`frontend/public/brand/`), porque el proyecto se desarrolla para Hound Express como empresa aliada del programa.
