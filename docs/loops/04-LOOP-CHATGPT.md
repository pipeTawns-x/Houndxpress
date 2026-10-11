# Loop 4 · ChatGPT y Codex: rediseño moderno, seguro y con IA

**Para qué:** que las herramientas de ChatGPT hagan el trabajo pesado del rediseño (investigar, proponer la dirección visual, construir y probar) sobre la base que ya existe, con tres prioridades en este orden:

1. **Ciberseguridad.**
2. **Diseño móvil, responsivo y moderno.**
3. **Supera con creces al sitio actual** (<https://www.hound-express.com/tracking.html> y `/hx/`), con IA para enrutar casos y atender clientes.

El rediseño **se migra en sitio**: se adapta el frontend que ya existe, pantalla por pantalla. No se construye otro proyecto al lado.

## Quién hace qué

| Rol | Herramienta | Modelo | Hace |
|---|---|---|---|
| Orquestador | Codex (app, sobre las carpetas locales) | `gpt-6-astra`, esfuerzo alto | Plan, modelo de amenazas, reparto, revisión de cada pieza |
| Implementación | Sub-agentes de Codex | `gpt-6.1-sol`, esfuerzo medio | Una pieza por iteración: componente, pantalla o comportamiento |
| Tareas mecánicas | Sub-agentes de Codex | `gpt-6-luna`, esfuerzo bajo | Renombrar clases, capturas, inventarios |
| Investigación | ChatGPT web, Deep Research | `gpt-6-astra` | Fase 1, con fuentes |
| Dirección visual | ChatGPT web, generación de imágenes | — | Fase 3: referencias, no código |
| Backend de las prácticas | OpenCode | el suyo | M54 y M64 en la rama `backend` |
| Auditoría | Claudia (Claude Code) | Opus | Revisa cada PR antes de integrarlo a `pruebas` o `main` |

El reparto de modelos sale de la propuesta que Codex guardó en Engram (#830). Esa nota advierte que tener el archivo de configuración no prueba que la delegación use el modelo pedido. La fase 0 lo comprueba.

## Estado de partida (11 de octubre de 2026)

| Pieza | Estado | Dónde |
|---|---|---|
| Frontend v1 | React 19 + TypeScript + Vite + Redux Toolkit + Jest + Sass con BEM; rastreo, panel con datos de demostración y 278 pruebas | rama `frontend`, PR #2 a `pruebas` |
| Backend | Esqueleto Django de M52, 13 pruebas, `/api/v1/health/` | ramas `main`, `backend` y `pruebas` |
| M52 | Enviada en el LMS el 9 de octubre, pendiente de calificación | Engram, `houndxpress/entrega-m52` |
| Correcciones de OpenCode | `CONTENIDO-1A1.md` (sitemap: 22 páginas que se replican, 2 URLs de rastreo vivas), `BRIEF.md`, `armar-kit-claude-design.sh` y `03-arquitecto.md` | **Sin commitear** en `~/Desktop/houndxpress` |
| M54 | Sin empezar | `~/Desktop/houndxpress-backend` |

Carpetas por rama: `~/Desktop/houndxpress` (`frontend`), `~/Desktop/houndxpress-backend` (`backend`) y `~/Desktop/houndxpress-pruebas` (`pruebas`).

## Reglas (no se negocian)

1. Antes de trabajar, lee `CLAUDE.md`, sobre todo "Ramas" y "Errores que ya cometimos".
2. **Migración en sitio:** se extiende o reemplaza el módulo que ya existe. Antes de crear un archivo, busca si ya hay uno con `rg` o `graphify query`. Nada de carpetas paralelas ni de proyectos nuevos.
3. **Una pieza por commit** (una pantalla, un componente o un comportamiento), con Conventional Commits: tipo en inglés y descripción en español. El revert de un solo commit tiene que deshacer la pieza completa.
4. **Un agente por rama.** Codex trabaja en `frontend`. En `backend` entra solo cuando Eduardo lo diga y OpenCode no esté trabajando ahí.
5. Stack obligatorio por `docs/REQUISITOS_EBAC.md`: React, TypeScript, Sass con BEM, Redux y Jest en el frontend; Django y DRF en el backend. Nada de Tailwind, CSS-in-JS ni otra librería de estado.
6. Una guía solo avanza a la etapa siguiente. La regla vive en `frontend/src/domain/` y, desde M54, también en el modelo de Django.
7. **Ninguna llave ni secreto llega al navegador.** Toda llamada a un modelo de IA pasa por el backend.
8. Nada se da por hecho sin la salida del comando. Puertas por pieza: `npx jest <archivos> && npm run lint && npm run typecheck`. Puertas completas al cerrar cada fase: las de la sección "Comandos" de `CLAUDE.md`.
9. Datos de demostración hasta que exista la API (M64), y la interfaz lo dice.
10. Una pregunta a la vez.

---

## Fase 0 · Arranque (Codex, `gpt-6-astra`)

1. En `~/Desktop/houndxpress`, revisa el diff que dejó OpenCode (4 archivos). Si está bien, commitéalo como `docs: corrige el inventario del sitio y las rutas del kit tras la migración a Sass`.
2. `git fetch` y `git pull --ff-only`. Regenera el grafo con `graphify update .`.
3. Lanza un sub-agente de prueba con `gpt-6-luna` y confirma en su salida qué modelo usó. Si no es el pedido, avísale a Eduardo antes de seguir.
4. Entrega en cinco líneas: estado de las ramas, pruebas en verde y qué falta para la fase 1.

## Fase 1 · Investigación (ChatGPT web, Deep Research)

Prompt para ChatGPT (adjunta `docs/loops/kit/BRIEF.md`, `docs/loops/kit/CONTENIDO-1A1.md` y `docs/REQUISITOS_EBAC.md`):

```text
Investiga para el rediseño del sitio de Hound Express (logística cross-border de ecommerce entre EE. UU. y Latinoamérica: https://www.hound-express.com/hx/ y https://www.hound-express.com/tracking.html). Adjunto el brief, el mapa de contenido y los requisitos del proyecto. Es un proyecto académico de EBAC con stack fijo: React, TypeScript, Sass con BEM, Redux y Jest, más Django y DRF.

Entrega un informe en español de México con fuentes enlazadas en cada afirmación:
1. Benchmark de rastreo y atención: DHL, FedEx, Estafeta, 99minutos, Skydropx y Mercado Envíos. Qué hacen bien en móvil, qué datos muestran y cómo explican los retrasos.
2. IA en logística que ya funciona en producción: asistentes de atención con consulta de guías, clasificación y enrutamiento de casos, predicción de entrega y detección de envíos atorados. Por cada caso: empresa, qué hace y qué resultado publicó.
3. Seguridad de sitios de rastreo: enumeración de números de guía, exposición de datos personales del destinatario, abuso de formularios y ataques a asistentes con LLM (OWASP Top 10 para LLM). Por cada riesgo, la mitigación concreta.
4. Accesibilidad y rendimiento en móvil: lo mínimo para cumplir WCAG 2.2 AA y Core Web Vitals en verde.
5. Diez ideas que harían que este sitio supere con creces al actual. Ordénalas por impacto para el destinatario y el vendedor, esfuerzo, riesgo y si encajan en el stack fijo.

No inventes cifras. Si no encuentras fuente, dilo.
```

Guarda el informe en `docs/diseno/chatgpt/01-investigacion.md`.

## Fase 2 · Decisión de alcance (Codex `gpt-6-astra`, Claudia y Eduardo)

1. Codex cruza el informe con el backlog de ideas de abajo y propone `docs/diseno/chatgpt/02-alcance.md`: qué entra en esta entrega, qué queda para después y por qué. Cada idea lleva impacto, esfuerzo, riesgo, dependencia del backend y prueba de aceptación.
2. Claudia lo ataca con la skill `abogado-del-diablo` y devuelve una lista de objeciones.
3. Eduardo decide. Sin su "aprobado" no se pasa a la fase 3.

## Fase 3 · Dirección visual (ChatGPT web, imágenes, y Codex)

1. En ChatGPT, genera dos direcciones del Inicio, A y B, en 390 y 1440 px, con el brief adjunto. Son **referencias**: no se copian píxeles, se copian decisiones (jerarquía, ritmo, composición del héroe).
2. Eduardo elige una dirección. Codex la traduce a tokens en `frontend/src/styles/abstracts/` y a bloques BEM, y documenta cada decisión en `docs/diseno/chatgpt/03-direccion-visual.md`.
3. Reglas del brief que no cambian: marino `#18233E`, aqua `#4CBED8` (nunca como texto sobre fondo claro; ahí va `#167088`), Plus Jakarta Sans e Inter, contraste AA, ilustraciones propias y nada de fotos de banco.

## Fase 4 · Modelo de amenazas antes del código (Codex, `gpt-6-astra`)

Escribe `docs/seguridad/MODELO-DE-AMENAZAS.md`, con STRIDE por superficie:

| Superficie | Riesgos mínimos a cubrir |
|---|---|
| Rastreo público | Enumeración de guías, datos personales del destinatario a la vista (muestra solo iniciales y ciudad), abuso por volumen |
| Panel de operaciones | Acceso sin autenticación, cambios de etapa por un rol que no corresponde, historial alterable |
| Formulario de contacto | Spam, inyección de cabeceras en `mailto:`, datos personales sin aviso |
| Asistente con IA | Inyección de prompt, fuga del prompt de sistema, respuestas inventadas sobre una guía, costo descontrolado, llave expuesta |
| Cadena de suministro | Dependencias con vulnerabilidades o con licencia GPL o AGPL |

Por cada riesgo: mitigación, archivo donde vive y prueba que la demuestra. Controles base que entran sí o sí:

- Cabeceras en nginx: CSP estricta sin `unsafe-inline`, HSTS, `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy`.
- Django: `SECURE_*`, cookies `Secure` y `HttpOnly`, CSRF, `ALLOWED_HOSTS` desde el entorno y límite de peticiones en el rastreo y en el asistente.
- Validación del número de guía en el cliente y en el servidor, con el mismo formato.
- CI: `npm audit --audit-level=high`, `pip-audit` y `bandit`, más Dependabot.

## Fase 5 · Construcción por piezas (Codex: `gpt-6.1-sol` implementa, `gpt-6-astra` revisa)

Sigue el orden del [Loop 2](02-LOOP-CLAUDE-CODE.md) (tokens → componentes → pantallas → plus → accesibilidad y SEO), con el mapa de `docs/loops/kit/CONTENIDO-1A1.md`. Por pieza:

1. Busca qué existe y qué se reutiliza. Nombra ese archivo en el cuerpo del commit.
2. Primero el comportamiento, después el aspecto.
3. Puertas de la pieza y capturas en 390 y 1440 px.
4. `gpt-6-astra` la revisa contra el mapa y el modelo de amenazas antes del commit.
5. Guarda el avance en Engram (proyecto `houndxpress`) y en `docs/diseno/chatgpt/AVANCE.md`.

Al cerrar la fase: puertas completas, PR `frontend` → `pruebas` y aviso a Eduardo para que Claudia lo audite.

## Fase 6 · IA (después de M54; el backend solo con autorización de Eduardo)

| Función | Cómo | Sin llave de API |
|---|---|---|
| **Asistente de atención** | Chat en el sitio. El backend llama al modelo con dos herramientas: `consultar_guia` (lee del modelo `Guide`) y `buscar_en_preguntas` (preguntas frecuentes). Responde solo con datos de esas herramientas y, si no sabe, ofrece contacto humano | Respuestas por reglas sobre las preguntas frecuentes |
| **Enrutamiento de casos** | Clasifica cada mensaje de contacto (aduana, entrega, devolución, comercial) y lo asigna al área responsable de la etapa: Aduana, Operaciones, Seguridad o KAM | Clasificación por palabras clave |
| **Guías atoradas** | Alerta en el panel cuando una guía lleva en su etapa más tiempo del normal | Umbral fijo por etapa |

Reglas de la IA: la llave vive solo en el backend; límite de peticiones y de costo; el prompt de sistema no se expone; se registra cada respuesta sin datos personales; el proveedor y el modelo se deciden en la fase 2 y se registran en `docs/STACK_HOUND_EXPRESS.md`. Pruebas: Jest para la interfaz y el slice de Redux; pruebas de Django con el modelo simulado, incluidas las de inyección de prompt.

## Fase 7 · Verificación y entrega

1. Codex: puertas completas, Lighthouse móvil (rendimiento, accesibilidad y buenas prácticas en 90 o más), axe sin errores y capturas de todas las pantallas en 390 y 1440 px.
2. Claudia: auditoría del PR con `/code-review high` y revisión de seguridad contra el modelo de amenazas.
3. Integración a `pruebas` y, ya en verde, PR de `pruebas` a `main`.

---

## Backlog de ideas (hipótesis para la fase 2, no decisiones)

| # | Idea | Para quién | Por qué supera al sitio actual |
|---|---|---|---|
| 1 | Asistente de atención con consulta de guía | Destinatario | Hoy hay que leer las preguntas frecuentes o llamar |
| 2 | Enrutamiento de casos al área responsable | Hound Express | Ataca el problema real: guías que saltan etapas y casos que nadie atiende |
| 3 | Permisos por rol y etapa en el panel (Aduana solo avanza las etapas 1 y 2, y así cada área) | Operación | Lleva la regla de negocio a la seguridad |
| 4 | Escanear el código de barras de la guía con la cámara del celular | Destinatario | Sin teclear 16 o 22 caracteres |
| 5 | Notificación de cambio de etapa por correo o web push | Destinatario | El usuario no tiene que volver a consultar |
| 6 | PWA instalable que recuerde las últimas guías | Destinatario | Uso repetido desde el celular |
| 7 | Alerta de guías atoradas y entrega estimada | Operación y destinatario | Explica los retrasos antes de que pregunten |
| 8 | Mapa de red animado con hubs y rutas | Vendedor | Muestra cobertura sin fotos de banco |
| 9 | Versión en inglés completa | Vendedor de EE. UU. | El sitio actual ya es bilingüe |
| 10 | Datos personales enmascarados en el rastreo | Destinatario | Privacidad que el sitio actual no ofrece |
