# Loop 3 · OpenCode: orquestar, revisar y continuar Hound Express

**Para qué:** que OpenCode, en la Mac de Eduardo, siga el proyecto cuando se acaben los créditos de Claude Code y de Claude Design. Es orquestador y **segunda vista**: verifica por su cuenta lo que dejaron los agentes anteriores, reparte el trabajo por rama y revisa antes de integrar.

## 1. Contexto (30 de septiembre de 2026)

**Alumno y programa.** Eduardo (Felipe Eduardo Torres Aguilar), *Profesión: Desarrollador Full Stack Python v2* de EBAC. Proyecto de empresa aliada: Hound Express. Repositorio: <https://github.com/pipeTawns-x/Houndxpress>.

**Plan de Eduardo, dicho con sus palabras y no reinterpretado.** En el curso de frontend eligió un proyecto externo, así que nunca hubo un frontend de Hound Express. La lección M52 del backend (<https://lms.ebac.mx/lesson/e6efc54e-8bdd-4aa9-ab7b-05d3d9f9bef2>) pide "recuperar el proyecto de Hound Express que hiciste en la parte de Frontend" y crear un proyecto Django vacío. El plan: rediseñar el sitio actual (<https://www.hound-express.com/hx/>) como frontend funcional, no al 100%, en 3 a 5 días con IA, y hacer crecer el backend con cada práctica del curso. Entregar las primeras vistas es parte del plan, no un extra.

**Estado del repositorio.**

| Rama | Qué tiene |
|---|---|
| `main` | Esqueleto Django de M52 (etiqueta `m52`, 13 pruebas), README probado en CI. Rama `backend` idéntica al crearse. |
| `frontend` | Todo lo de `main` más: React 19 + TypeScript + Vite + Redux Toolkit + Jest + Sass con BEM (estructura 7-1), rastreo, panel de guías con datos de demostración, Docker, diagramas Archify, documentos de diseño `docs/diseno/00` a `05` y los loops `docs/loops/`. PR #2 hacia `pruebas` (el #1 se cerró al renombrar la rama). |
| `pruebas` | Creada desde `main`, vacía de trabajo propio. |

**Requisitos oficiales:** `docs/REQUISITOS_EBAC.md` (cita el PDF de 32 páginas del proyecto; el PDF está en `~/Desktop/houndxpress.pdf`, fuera del repositorio). Pendientes según ese archivo: M54 (tablas e historial), M64 (endpoints GET, POST y PUT con DRF), SEO completo (robots, sitemap, Open Graph), publicación estática (módulo 39).

**Diseño.** Los créditos de Claude Design se acabaron antes de empezar los lotes. El diseño sigue con el **MCP de Pencil** en OpenCode, con el mismo material:

- `docs/loops/kit/BRIEF.md`: contexto fijo, marca, etapas, reglas y plus.
- `docs/loops/kit/CONTENIDO-1A1.md`: las 19 páginas del sitio actual mapeadas a 14 plantillas (nuevas: País, Alianza, Medios, Legal).
- `docs/loops/01-LOOP-CLAUDE-DESIGN.md`: los lotes 0 a 5. Se ejecutan igual en Pencil; donde dice "Claude Design", lee "Pencil".
- `docs/loops/02-LOOP-CLAUDE-CODE.md`: del diseño al código, por fases y con puertas.

**Contexto persistente.** Engram, proyecto `houndxpress`, `topic_key` `houndxpress/contexto-opencode` y `houndxpress/loops-claude-design`. Grafo: `graphify update .` genera `graphify-out/` (código; sin LLM).

## 2. Primera tarea: verificación independiente (segunda vista)

No aceptes nada de este documento como cierto sin comprobarlo. Entrega a Eduardo una tabla "afirmación → cómo lo verificaste → confirmado o refutado":

1. **LMS.** Con la skill `ebac-lms-reader` y el navegador de Eduardo, lista las prácticas del curso de backend (M52, M54, M59 si existe, M64, M66 y las que haya), con su entregable literal. Compáralas con `docs/REQUISITOS_EBAC.md` y con la "Hoja de ruta" de `CLAUDE.md`.
2. **Repositorio.** Comprueba en el código lo que dice la tabla de estado de arriba: pruebas que pasan, Sass con BEM sin restos de Tailwind, etiqueta `m52` en `main`, PR #2 y su rama base.
3. **Sitio actual.** Comprueba que las 19 URLs de `CONTENIDO-1A1.md` existen y que no falta ninguna.
4. **Los loops.** Busca contradicciones entre `BRIEF.md`, los loops 1 y 2, `CLAUDE.md` y `REQUISITOS_EBAC.md`. Cada contradicción es una regla nueva o una corrección.

## 3. Trabajo por agente y por rama

| Agente | Rama | Tarea | Puerta para abrir PR a `pruebas` |
|---|---|---|---|
| Diseño y frontend | `frontend` | Lotes 0 a 5 en Pencil con el brief; después, loop 2 fase por fase | `npm ci && npm run lint && npm run typecheck && npm test && npm run build` en verde, capturas en 390 y 1440 px |
| Backend | `backend` | Siguiente práctica del LMS (M54: modelos `Guide` y `StageEvent`, historial que solo crece, migraciones y pruebas). El contrato de datos está en `docs/diseno/03-arquitecto.md` | `python manage.py test && python -m ruff check . && python -m ruff format --check .` en verde |
| Integración | `pruebas` | Une `frontend` y `backend`, corre todas las puertas y `docker compose up --build --detach --wait` con `curl -fsS http://127.0.0.1:8080/api/v1/health/` | Todo en verde; entonces PR de `pruebas` a `main` |
| Revisión (OpenCode orquestador) | todas | Revisión adversarial de cada PR antes de integrarlo. Cada hallazgo se corrige con una prueba que falle sin la corrección | Cero hallazgos abiertos |

Reglas de ramas, commits y PR: sección "Ramas" de `CLAUDE.md`. Un agente por rama a la vez.

## 4. Errores que ya cometimos

| # | Qué pasó | Regla |
|---|---|---|
| 1 | Claude (Opus) afirmó que el rediseño "no bloqueaba" M52 sin preguntar el plan de Eduardo ni saber que no hubo frontend previo | Pregunta el plan antes de opinar si algo es necesario |
| 2 | El loop 2 decía "Sass con BEM" cuando el código seguía en Tailwind | Verifica en el código antes de escribir un estado |
| 3 | La investigación v1 cubrió 5 de las 19 páginas del sitio | Inventaria todas las URLs antes de diseñar |
| 4 | Un solo prompt pidió 12 pantallas × 2 anchos × 7 rondas de debate a Claude Design; gastó créditos y produjo poco | Lotes de una o dos pantallas; el debate se hace fuera de la herramienta de diseño |
| 5 | Un agente en la nube subió commits a la misma rama mientras otro trabajaba en local | `git fetch` y rebase antes de cada push; un agente por rama |
| 6 | Las ramas se llamaban `claude/tender-hawking-9istcy` y `feat/m52-django-skeleton` | Solo las cuatro ramas de `CLAUDE.md` |
| 7 | En zsh, `"$B:frontend/…"` falló por el modificador `:` y `echo ====` por la expansión `=` | `"${B}:ruta"` y texto entre comillas |
| 8 | `CLAUDE.md` global manda usar `sd`, pero no está instalado | `command -v` antes; usa otra herramienta sin detenerte |
| 9 | En la nube, el navegador sin interfaz no confía en el proxy TLS y no pudo capturar el sitio externo | Capturas de sitios externos, en local; en la nube, trabaja sobre el HTML descargado |
| 10 | Un artículo citado como fuente devolvió solo la página del boletín | Cita fuentes primarias y di cuando no pudiste leer una |

### Encontrados en la verificación independiente de OpenCode (1 de octubre de 2026, Engram #767)

| # | Qué pasó | Regla |
|---|---|---|
| 11 | `CONTENIDO-1A1.md` dice 19 páginas y mapea 18. El sitemap de Yoast tiene 26. Faltan, y responden 200: `/hx/alianzas/`, `/hx/tracking/`, `/hx/servicio-cargo/`, `/hx/servicio-customs/`, `/hx/servicio-parcel/`, `/hx/amazonspn/` (y otras 4 obsoletas) | El inventario sale del sitemap |
| 12 | `/hx/en/` se trató como plantilla "plus 6"; es un espejo completo de 18 páginas hecho con Weglot | Mide el alcance real antes de ponerle prioridad |
| 13 | Hay tres URLs de rastreo (`/tracking.html`, `/hx/tracking.html/`, `/hx/tracking/`); el mapa registra una | Cada URL viva tiene su fila en el mapa |
| 14 | `BRIEF.md` y `CONTENIDO-1A1.md` citan `00-BRIEF.md`, `03-sistema-v1.md` y otros nombres del kit generado; desde `docs/loops/kit/` esas rutas no existen | Un documento commiteado cita rutas del repositorio |
| 15 | Quedaron `feat/m52-django-skeleton` (con la remota borrada) y la rama del worktree de Claude; `.atl/` no estaba ignorado | Las ramas locales sobrantes también rompen la regla de cuatro ramas |
| 16 | `REQUISITOS_EBAC.md` marca "Cumple" registrar, actualizar y consultar guías con evidencia solo del frontend; `backend/tracking/models.py` está vacío | "Cumple" exige evidencia en la capa que nombra el requisito |
| 17 | El PDF numera los módulos con la numeración global de la carrera (M52 a M66); el LMS numera M0 a M37 y la lección es la asignación 4.13.11 | En el LMS se busca por título, no por número |
| 18 | Se pidió verificar M59; no aparece ni en el PDF ni en el LMS | No se agregan prácticas sin fuente |
| 19 | El loop 3 pedía la ruta del PDF a Eduardo; estaba en `~/Desktop/houndxpress.pdf` | Busca el archivo antes de pedirlo |
| 20 | `BRIEF.md` citó una oración de la lección como "consigna" separada; el entregable literal es la URL del repositorio, y no consta si ya se envió | Cita completa y en contexto |
| 21 | La p. 21 del PDF describe la API como CRUD con DELETE; la fila de M64 en la p. 22 solo nombra GET, POST y PUT | Anota los plus que tienen fuente |
| 22 | `armar-kit-claude-design.sh` conserva una copia de `frontend/src/index.css`, que ya no existe tras la migración a Sass | Tras una migración, busca las referencias al archivo eliminado |
| 23 | `mem_context` con el proyecto `Houndxpress` no devolvió nada; el proyecto se llama `houndxpress` | Un solo proyecto de Engram, en minúsculas |
