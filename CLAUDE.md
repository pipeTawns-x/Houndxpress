# Hound Express: contexto para agentes

Proyecto final del programa *Profesión: Desarrollador Full Stack Python* de EBAC, con Hound Express (logística cross-border para ecommerce) como empresa aliada. Autoría: sección *Autor* del README. Este archivo es la memoria del proyecto: cuando Eduardo pida "guarda todo en contexto", se actualiza aquí y en `docs/`, no en otro proyecto.

## Mapa

| Ruta | Qué es |
|---|---|
| `backend/` | Django 5.2 LTS + DRF. `manage.py` vive aquí. Apps: `accounts` (usuario propio), `core` (`/api/v1/health/`), `tracking` (guías, vacía hasta M54). |
| `frontend/` | React + TypeScript + Vite + Sass (BEM, estructura 7-1 en `src/styles/`). Sitio público rediseñado, rastreo, panel de operaciones e índice de diseños (`/disenos`). |
| `docs/REQUISITOS_EBAC.md` | Requisitos citados del documento oficial del proyecto (PDF de EBAC) y su estado. Manda sobre cualquier decisión técnica que lo contradiga. |
| `docs/STACK_HOUND_EXPRESS.md` | Decisiones técnicas y licencias. Toda dependencia nueva se agrega a su tabla en el mismo commit. |
| `docs/diseno/` | Proceso de rediseño: investigación → propuesta → abogado del diablo → arquitecto → sistema de diseño → revisión. Incluye el loop para Claude Design. |
| `docs/diagramas/` | Diagramas Archify (HTML autónomo) y sus fuentes JSON en `fuentes/generar.py`. |
| `.claude/skills/archify/` | Skill Archify 3.0.1 (MIT), sin pruebas ni ejemplos renderizados. |
| `docker-compose.yml` | Backend + frontend (nginx en `:8080` reenvía `/api`, `/admin` y `/static` a Django). |
| `.github/workflows/ci.yml` | Lint y pruebas del backend (Linux y Windows), bloques del README, frontend y Docker. |

## Reglas

1. Código e identificadores en inglés; documentación, commits y textos de interfaz en español.
2. Sin dependencias AGPL/GPL. `backend/requirements*.txt` se exportan desde `uv.lock`, nunca a mano (comandos en `docs/STACK_HOUND_EXPRESS.md`).
3. Cada bloque de comandos del README tiene un job de CI que lo reproduce. Si cambias uno, cambia el otro en el mismo commit.
4. Las etiquetas de entrega (`m52`, …) no se mueven sin que Eduardo lo pida.
5. No afirmar nada que no se haya ejecutado: pruebas, capturas y estados del CI se reportan con su salida.
6. El panel y el rastreo usan datos de demostración hasta M64; la interfaz y el README lo dicen explícitamente.
7. Antes de decidir tecnología, revisar `docs/REQUISITOS_EBAC.md`: el frontend debe usar Sass con BEM, React, TypeScript, Redux y Jest porque el documento oficial lo pide.
8. Regla de negocio central: una guía solo avanza a la etapa siguiente (Recepción de carga → Vehículo cargado → Vehículo liberado → Vehículo en camino → Carga entregada).

## Ramas

Cinco ramas, con nombre que dice qué contiene. No se crean otras.

| Rama | Contiene | Recibe cambios de |
|---|---|---|
| `frontend` | Rediseño y aplicación React (`frontend/`, `docs/diseno/`). | trabajo directo |
| `backend` | Django y DRF de cada práctica del LMS (`backend/`). | trabajo directo |
| `practicas-ebac` | Entorno escolar: prácticas del LMS, entregas, documentos de curso y loops. | `frontend`, `backend` y trabajo escolar directo |
| `pruebas` | Integración del producto: suite completa, `docker compose` y CI en verde. | `frontend`, `backend` y producto filtrado de `practicas-ebac` |
| `main` | El producto integrado, limpio y profesional. Solo lo que ya pasó por `pruebas`. | `pruebas` |

- Flujo de producto: `frontend` y `backend` → PR a `pruebas` → PR de `pruebas` a `main`. El código y la documentación de producto de `practicas-ebac` siguen el mismo camino, con el filtro escolar aplicado antes de entrar en `pruebas`.
- **Filtro de salida escolar:** no pasan `docs/loops/`, las entregas y mensajes del LMS, las notas de práctica, los documentos Word, las capturas de práctica ni los prompts. Solo pasan código y documentación en tono de producto. Revisar el diff de salida; no integrar toda la rama escolar sin filtrar ni copiar el árbol completo, porque puede reintroducir archivos eliminados.
- Un agente por rama y un worktree por rama. No compartir la escritura de una misma rama entre agentes.
- Commits con Conventional Commits: tipo en inglés, descripción en español (`feat(backend): agrega el modelo de guías`). Sin atribución a IA ni `Co-Authored-By`.
- PR: título en español; el cuerpo abre con una línea de resumen en inglés y sigue en español.
- La rama escolar publicada se sincroniza mediante **merge**, no rebase: conservar su historial compartido. Antes de publicar, obtener y revisar los cambios remotos e integrarlos mediante merge si corresponde. Nunca usar `--force` ni `--force-with-lease`.

## Ejecución local y permisos

- El agente ejecuta Git local, incluidos commits. No ejecuta Git con red ni publica cambios sin la aprobación explícita de Eduardo en la sesión.
- Con aprobación explícita de Eduardo en la conversación, el agente puede ejecutar `push`, crear y publicar tags, y abrir PRs con `gh`. Condiciones: (a) la aprobación consta en la conversación, (b) el agente anuncia cada comando y muestra su salida real, (c) nunca usa `--force` ni `--force-with-lease`, y (d) el trabajo publicado ya pasó el gate de PR de la rama (pruebas, linter, migraciones y revisión GGA).
- Sin esa aprobación, el agente entrega un único bloque de comandos a Eduardo y espera su salida. Eduardo conserva `fetch`, `pull` y todos los comandos de npm y Homebrew.
- Cuando se necesite una operación reservada a Eduardo, entregar un único bloque de comandos con el directorio de ejecución y pedirle que lo ejecute. Detenerse y esperar su salida antes de continuar; no asumir éxito.
- El agente nunca ejecuta `npm ci`, ni siquiera fuera del sandbox, y no accede a credenciales, llaveros ni archivos de secretos. No cambiar helpers de credenciales ni buscar atajos de autenticación.
- El sandbox de mínimo privilegio es intencional. Un bloqueo de permisos no autoriza elevar privilegios, desactivar restricciones ni ejecutar la operación por otra vía: corresponde pedir el bloque a Eduardo y esperar.
- Estas reglas y la sección Ramas prevalecen sobre instrucciones anteriores de los loops o skills que indiquen rebase de la rama escolar publicada, push del agente, npm fuera del sandbox o acceso a credenciales.

## Errores que ya cometimos (reglas para no repetirlos)

Registro completo en [`docs/loops/03-LOOP-OPENCODE.md`](docs/loops/03-LOOP-OPENCODE.md).

1. No reinterpretar el objetivo de Eduardo. Si algo parece innecesario o "no bloqueante", pregunta su plan antes de opinar.
2. Verificar el estado en el código antes de escribirlo en un documento (el loop 2 decía "Sass con BEM" cuando todavía era Tailwind).
3. Antes de diseñar, inventariar todas las URLs del sitio vivo (la investigación v1 cubrió 5 de 19 páginas).
4. Las herramientas de diseño trabajan por lotes de una o dos pantallas, nunca con todo en un solo prompt.
5. En zsh, `"$B:ruta"` se rompe por el modificador `:`; usa `"${B}:ruta"`. Si falta una herramienta preferida (`sd`), comprueba con `command -v` y usa otra.
6. El inventario del sitio sale del sitemap (`/hx/page-sitemap.xml`, 26 páginas), no de los enlaces del Inicio. `/hx/en/` es un espejo completo hecho con Weglot, no una plantilla. Hay tres URLs de rastreo.
7. Un documento commiteado cita rutas que existen en el repositorio, no los nombres del kit que genera un script.
8. "Cumple" en `REQUISITOS_EBAC.md` exige evidencia en la capa que nombra el requisito. Una regla demostrada en el frontend con datos de demostración no cumple un requisito de API.
9. Los módulos del PDF (M52, M54, M64, M66) no se numeran igual que el LMS (M0 a M37). En el LMS se busca por título de la asignación. M59 no existe.
10. Antes de pedirle un archivo a Eduardo, búscalo en su Mac. El PDF oficial está en `~/Desktop/houndxpress.pdf`.
11. Cita las consignas completas y en su contexto. Anota los plus que tienen fuente, por ejemplo DELETE en la p. 21 del PDF.
12. Las ramas locales sobrantes también rompen la regla de cinco ramas: revisar los worktrees viejos y las ramas cuya remota ya se borró. No crear ramas adicionales ni eliminar ramas o worktrees sin autorización de Eduardo.
13. Engram tiene un solo proyecto, `houndxpress`, en minúsculas. Una búsqueda con otra capitalización no devuelve nada. No se crean alias.
14. En Codex, npm lo ejecuta Eduardo, no el agente. Git con red también lo ejecuta Eduardo, salvo autorización explícita del propio Eduardo en la sesión. No intentar `npm ci` dentro ni fuera del sandbox: puede dejar `node_modules` a medias. Entregar un único bloque de comandos y esperar su salida, sin acceder a credenciales ni eludir el sandbox de mínimo privilegio.

## Comandos

Referencia para Eduardo. Los comandos de npm los ejecuta únicamente él; el agente entrega el bloque necesario y espera la salida antes de reportar resultados.

```bash
# Backend (desde backend/)
python -m pip install -r requirements-dev.txt
# Si la .venv la creó uv (no trae pip): uv pip install -r requirements-dev.txt --python .venv/bin/python
python manage.py test && python -m ruff check . && python -m ruff format --check .

# Frontend (desde frontend/)
npm ci && npm run lint && npm run typecheck && npm test && npm run build

# Todo junto
docker compose up --build     # http://localhost:8080

# Diagramas (desde la raíz)
python3 docs/diagramas/fuentes/generar.py
node .claude/skills/archify/bin/archify.mjs finalize <tipo> docs/diagramas/fuentes/<nombre>.json docs/diagramas/<nombre>.html --quality showcase --json
```

## Hoja de ruta del LMS

Numeración del PDF oficial (p. 22); en el LMS, la lección de M52 es la asignación 4.13.11 "Proyecto Empresa Aliada - M52 Entregable 9". M52 esqueleto Django (etiqueta `m52`; el repositorio no registra si la URL ya se envió en el LMS) · M54 tablas de guías e historial inmutable · M64 endpoints GET/POST/PUT con validación del orden de etapas · M66 entrega final. El contrato de datos que el frontend ya usa está en `docs/diseno/03-arquitecto.md`; M54 lo confirma o lo cambia en ambos lados a la vez.

## Herramientas locales de Eduardo

Graphify, Engram, OpenCode (con el MCP de Pencil) y el navegador Brave viven en su Mac y no están en las sesiones en la nube. En la nube, este archivo y `docs/` son la fuente de contexto. En local, el grafo se regenera con `graphify update .` (sin LLM) en `graphify-out/`, que git ignora; en Engram, el proyecto es `houndxpress`.
