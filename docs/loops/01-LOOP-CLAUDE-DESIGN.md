# Loop 1 · Claude Design (Opus 5.5): rediseño de Hound Express

**Para qué:** que Claude Design, con Opus 5.5 razonando, produzca el rediseño completo de la web de Hound Express. La entrega es un `.zip` que después consume el [Loop 2 de Claude Code](02-LOOP-CLAUDE-CODE.md).

**Cómo usarlo:**

1. Abre un proyecto nuevo en Claude Design con Opus 5.5.
2. Adjunta los archivos de "Adjuntos" (abajo).
3. Pega el bloque "Prompt" completo.
4. Contesta solo cuando te pida aprobar al final de cada vuelta.

Para no gastar créditos:

- No le pidas cambios sueltos entre vueltas: junta tus comentarios y dáselos en el paso 6.
- Si una vuelta sale bien, di "aprobado" y sigue.

## Adjuntos (del repositorio `pipeTawns-x/Houndxpress`)

| Archivo | Para qué le sirve |
|---|---|
| `docs/REQUISITOS_EBAC.md` | Lo que el proyecto oficial exige (frontend y backend) |
| `docs/diseno/00-investigacion.md` | Diagnóstico del sitio actual: contenido, paleta, problemas |
| `docs/diseno/04-sistema-de-diseno.md` | Tokens y componentes de la versión 1, para mejorarlos, no para empezar de cero |
| `docs/diseno/capturas/inicio-escritorio.jpg`, `rastreo-resultado-movil.jpg`, `panel-escritorio.jpg` | Cómo se ve hoy la versión 1 |
| `frontend/public/brand/logo-hound-express.svg` | Logotipo oficial |

URLs del sitio actual, para que las visite si puede:

- <https://www.hound-express.com/hx/>
- <https://www.hound-express.com/tracking.html>

---

## Prompt

Eres el equipo de diseño de producto de **Hound Express**, empresa de logística cross-border para ecommerce entre Estados Unidos y Latinoamérica. Tiene hubs en Laredo y Miami, 10 puntos de entrada en LATAM y más de 15,000 m² de almacenes. Vas a rediseñar su web completa y un panel interno de guías. Es el proyecto de graduación de un alumno de EBAC (Full Stack Python), así que el diseño debe poder construirse con **React + TypeScript + Sass con metodología BEM + Redux**. Trabaja en español de México.

### Contexto fijo (no se discute)

1. **Marca:** logotipo del sabueso en marino `#18233E` y aqua `#4CBED8`. El aqua nunca va como texto sobre fondo claro (contraste 2.2:1); sobre claro usa `#167088`. Tipografías: Plus Jakarta Sans para títulos e Inter para texto, sin agregar más.
2. **Proceso de negocio:** cada guía pasa por cinco etapas en orden estricto, cada una con su responsable:
   1. Recepción de carga (Aduana)
   2. Vehículo cargado (Aduana)
   3. Vehículo liberado (Operaciones)
   4. Vehículo en camino (Seguridad)
   5. Carga entregada (KAM)

   **La interfaz solo permite avanzar a la etapa siguiente.** El problema real es que solo 31 de cada 100 guías seguían el orden y los errores costaron 200k MXN.
3. **Funciones obligatorias** (documento oficial): registrar guías con un formulario, actualizar el estado eligiendo la etapa siguiente, y consultar el estado actual y el historial de cambios de una guía.
4. **Número de guía:** 16 dígitos que inician con 21, o 22 caracteres alfanuméricos.
5. **Usuarios:**
   - Vendedor de ecommerce que evalúa el servicio.
   - Destinatario que rastrea desde el celular (75–80% de las compras en México son móviles).
   - Personal de Aduana, Operaciones, Seguridad y KAM que opera el panel.

### Pantallas (cada una en 390 px y 1440 px)

Inicio · Rastreo (vacío, resultado, múltiple, no encontrada, formato inválido) · Servicios · Cobertura · Nosotros · Preguntas frecuentes · Contacto · Panel de operaciones (resumen por etapa, registrar guía, lista con filtros, avanzar etapa, cajón de historial, estados vacío, cargando y error) · Índice de diseños · 404.

### Plus de "web avanzada" (prioriza en este orden y marca cuáles entran)

1. Línea de tiempo de rastreo animada, con enlace para compartir (`?guia=`) y rastreo de hasta 10 guías.
2. Panel con indicadores (total, en tránsito, entregadas, distribución por etapa) e historial que no se edita.
3. Mapa de red propio (SVG) con hubs y rutas.
4. Modo oscuro con los mismos tokens.
5. Microinteracciones con `prefers-reduced-motion` respetado.
6. Versión en inglés (el sitio actual es bilingüe).

### Criterios de aceptación

1. Contraste AA en todo el texto. Ningún estado se comunica solo con color.
2. Sin desplazamiento horizontal desde 360 px. Menú móvil operable con teclado y `Esc`.
3. Buscador de guía visible en la primera pantalla del Inicio, en móvil y escritorio.
4. Ilustraciones propias (rutas, nodos, paquetes); nada de fotos de banco.
5. Cada componente tiene nombre de bloque BEM (`guide-card`, `guide-card__header`, `guide-card--delivered`) para que el código lo copie tal cual.

### Loop de trabajo

Máximo **dos vueltas completas**. Detente antes si en una vuelta el abogado ya no tiene objeciones de confianza alta.

1. **Diagnóstico** (breve): qué conservar y qué corregir del sitio actual y de la versión 1 adjunta. Solo hallazgos, con evidencia.
2. **Propuesta:** dirección visual, arquitectura de información y lista de plus que entran.
3. **Abogado del diablo:** ataca la propuesta. Formato por objeción:
   - supuesto que rompe
   - evidencia (pantalla y elemento)
   - consecuencia
   - confianza (alta, media o baja)

   Revisa sobre todo jerarquía del buscador, línea de tiempo en 390 px, contraste, densidad del panel y si cada componente se puede hacer con Sass + BEM.
4. **Arquitecto:** decide cada objeción (se atiende, se reduce o se descarta) con su razón.
5. **Diseño:** aplica las decisiones y muestra las pantallas.
6. **Mi revisión:** espera mis comentarios y aplícalos todos juntos.
7. **Segunda revisión del abogado** y **versión final del arquitecto**.

### Entregable final (un solo `.zip`)

- `DESIGN.md`: tokens (color con contraste calculado, tipografía, espaciado, radios, sombras, breakpoints 640/768/1024/1280), reglas de uso y el inventario de componentes con su bloque BEM, elementos y modificadores.
- `tokens.json` con los mismos valores.
- Cada pantalla en HTML (o PNG a 1x y 2x), en móvil y escritorio, con los nombres de la lista de pantallas.
- `decisiones.md`: objeciones, veredictos y cambios de cada vuelta.
- `plus.md`: qué plus entraron, en qué pantallas y cómo se ven sus estados.

No escribas código de la aplicación: eso lo hace Claude Code con este paquete.
