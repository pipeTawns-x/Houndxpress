# Brief de diseño · Hound Express v2

Este archivo es el contexto fijo del proyecto. Léelo completo antes de cada lote y **no lo repitas en tus respuestas**: cítalo por sección (por ejemplo, "Brief §4").

## 1. Cliente

**Hound Express**: logística cross-border para ecommerce entre Estados Unidos y Latinoamérica. Hubs en Laredo (Texas) y Miami (Florida), 10 puntos de entrada en LATAM, más de 15,000 m² de almacenes, más de 3,000 puntos de recolección en México. Lema: "We move ecommerce globally!".

Sitio actual: <https://www.hound-express.com/hx/> y <https://www.hound-express.com/tracking.html>. El contenido que hay que conservar, página por página, está en `01-CONTENIDO-1A1.md`.

## 2. Proyecto

- Proyecto de graduación de EBAC (*Profesión: Desarrollador Full Stack Python*) con Hound Express como empresa aliada.
- Consigna vigente (M52): "Procura atender los comentarios hechos por el tutor y tener el proyecto lo más pulido posible." Ver §9: no hubo entrega de frontend previa de Hound Express.
- El diseño se construye con **React + TypeScript + Sass con metodología BEM + Redux**. Consecuencia: nada que dependa de Tailwind, de una librería de componentes ni de CSS-in-JS. Cada componente es un bloque BEM.
- El panel y el rastreo usan **datos de demostración** hasta que exista la API (módulo 64). La interfaz lo dice con el bloque `demo-notice`.
- Requisitos oficiales citados: `02-REQUISITOS_EBAC.md`.

## 3. Marca (fija)

| Rol | Valor | Regla |
|---|---|---|
| Marino de marca | `#18233E` | Títulos sobre claro (15.6:1 sobre blanco) |
| Aqua de marca | `#4CBED8` | Botón principal con texto `#0B1426`, acentos. **Nunca texto sobre fondo claro** (2.2:1) |
| Aqua para texto sobre claro | `#167088` | 5.7:1 sobre blanco |

Tipografías: **Plus Jakarta Sans** (títulos) e **Inter** (texto). Ninguna otra.

Logotipo: `brand/logo-hound-express.svg` y `brand/logo-hound-express-blanco.svg`. Es el único recurso gráfico de la empresa que se reutiliza; las ilustraciones son propias (rutas, nodos, paquetes, SVG). Sin fotos de banco.

La paleta y tipografía completas de la versión 1 están en `03-sistema-v1.md` y `tokens-v1/`. Mejóralas; no empieces de cero.

## 4. Proceso de negocio (fijo)

Cada guía pasa por cinco etapas en orden estricto:

| # | Etapa | Responsable | Código |
|---|---|---|---|
| 1 | Recepción de carga | Aduana | `cargo_received` |
| 2 | Vehículo cargado | Aduana | `vehicle_loaded` |
| 3 | Vehículo liberado | Operaciones | `vehicle_released` |
| 4 | Vehículo en camino | Seguridad | `vehicle_in_transit` |
| 5 | Carga entregada | KAM | `cargo_delivered` |

- **La interfaz solo permite avanzar a la etapa siguiente.** Nunca un selector libre de etapas.
- El historial solo crece: no se edita ni se borra.
- Por qué importa: solo 31 de cada 100 guías seguían el orden y los errores costaron 200k MXN.
- Número de guía: 16 dígitos que inician con `21`, o 22 caracteres alfanuméricos.

Funciones obligatorias: registrar guías con un formulario; actualizar el estado eligiendo la etapa siguiente; consultar el estado actual y el historial de cambios.

## 5. Usuarios

| Usuario | Tarea principal | Dispositivo |
|---|---|---|
| Destinatario | Rastrear su paquete | Celular (75–80% de las compras en México son móviles) |
| Vendedor de ecommerce | Evaluar el servicio y contactar | Escritorio |
| Aduana, Operaciones, Seguridad, KAM | Registrar y avanzar guías en el panel | Escritorio |

## 6. Decisiones cerradas en la versión 1 (no se vuelven a discutir)

El proceso de diagnóstico, propuesta, abogado del diablo y arquitecto ya se hizo (`04-decisiones-v1.md`). Se mantienen:

1. El rastreo vive dentro del sitio, con la misma navegación, y el buscador está en la primera pantalla del Inicio.
2. El resultado del rastreo es una línea de tiempo con las cinco etapas: horizontal desde 768 px, vertical en móvil.
3. Rastreo múltiple de hasta 10 guías y enlace para compartir con `?guia=`.
4. Panel: resumen por etapa, registrar guía, lista con filtros, botón "Avanzar a {siguiente etapa}" y cajón de historial.
5. Contacto sin backend: el formulario arma un `mailto:` y lo avisa antes de enviar.
6. En móvil, después de buscar, el resultado va primero y el aviso de demostración debajo.

## 7. Reglas de diseño

1. Contraste AA en todo texto (4.5:1 normal, 3:1 grande y componentes). Escribe la razón calculada junto a cada par de color.
2. Ningún estado se comunica solo con color: siempre icono o texto.
3. Sin desplazamiento horizontal desde 360 px. Menú móvil operable con teclado y `Esc`.
4. Foco visible con teclado en todo control.
5. Movimiento de 150 a 250 ms; todo se apaga con `prefers-reduced-motion`.
6. Cada pantalla es **un solo HTML responsivo** que se revisa en 390 y 1440 px. No hagas dos maquetas por pantalla ni exportes PNG.
7. Cada componente lleva su nombre de bloque BEM en inglés, en un atributo `data-block` o en la clase: `guide-card`, `guide-card__header`, `guide-card--delivered`. Ese nombre es el que copiará el código.
8. Los textos de la interfaz van en español de México.

## 8. Plus de web avanzada (orden de prioridad)

1. Línea de tiempo animada, enlace para compartir y rastreo múltiple.
2. Indicadores del panel (total, en tránsito, entregadas, distribución por etapa) e historial inmutable.
3. Mapa de red propio en SVG con hubs y rutas.
4. Modo oscuro con los mismos tokens.
5. Microinteracciones que respetan `prefers-reduced-motion`.
6. Versión en inglés (el sitio actual es bilingüe).

## 9. Comentarios del tutor

No aplica. En el curso de frontend, Eduardo eligió un proyecto externo, así que no existe una entrega previa de Hound Express con comentarios. Este rediseño **es** el frontend que la lección M52 pide "recuperar": funcional, no al 100%, y crece con cada práctica del backend.

## 10. Cómo trabajar (para ahorrar uso)

1. Trabaja solo el lote que se pide en el mensaje. No adelantes pantallas de otros lotes.
2. No regeneres pantallas aprobadas; si un cambio global las afecta, cambia el componente o el token.
3. Respuestas cortas: qué hiciste, qué supuestos tomaste y la autoevaluación del lote (§11). Sin repetir este brief.
4. Si algo del brief se contradice, pregunta una sola vez y espera.

## 11. Autoevaluación al cerrar cada lote

Una tabla con una fila por pantalla del lote y estas columnas: contraste AA, sin color como único indicador, 390 px sin desplazamiento horizontal, bloques BEM nombrados, contenido de `01-CONTENIDO-1A1.md` completo. Marca cada celda con "sí" o con el problema concreto. No declares "sí" sin haberlo revisado.
