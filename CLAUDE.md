# Hound Express: contexto para agentes

Backend de Hound Express para el seguimiento de guías de logística cross-border para ecommerce. Autoría: sección *Autor* del README. Este archivo es la memoria del proyecto: cuando Eduardo pida "guarda todo en contexto", se actualiza aquí y en `docs/`, no en otro proyecto.

## Mapa

Rutas presentes en este worktree; no asumir que contiene el árbol del frontend.

| Ruta | Qué es |
|---|---|
| `backend/` | Proyecto Django; `manage.py` vive aquí. Apps: `accounts` (usuario propio), `core` (salud) y `tracking` (dominio de guías). |
| `backend/pyproject.toml`, `backend/uv.lock` | Declaración de dependencias y versiones resueltas. |
| `backend/requirements.txt`, `backend/requirements-dev.txt` | Exportaciones para ejecución y desarrollo. |
| `docs/STACK_HOUND_EXPRESS.md` | Decisiones técnicas y licencias. Toda dependencia nueva se agrega a su tabla en el mismo commit. |
| `.github/workflows/ci.yml` | Lint y pruebas del backend (Linux y Windows) y bloques del README. |
| `README.md` | Inicio rápido, estado del backend y contexto del negocio. |

## Reglas

1. Código e identificadores en inglés; documentación y textos de interfaz en español; commits en inglés y español, con el formato de la sección Ramas.
2. Sin dependencias AGPL/GPL. `backend/requirements*.txt` se exportan desde `backend/uv.lock`, nunca a mano (comandos en `docs/STACK_HOUND_EXPRESS.md`).
3. Cada bloque de comandos del README tiene un job de CI que lo reproduce. Si cambias uno, cambia el otro en el mismo commit.
4. Las etiquetas existentes no se mueven sin que Eduardo lo pida.
5. No afirmar nada que no se haya ejecutado: pruebas, capturas y estados del CI se reportan con su salida.
6. El README describe un esqueleto de backend: no asumir que los modelos de guías ni los endpoints de negocio ya están implementados. Verificar el código antes de actualizar su estado.
7. Antes de decidir tecnología, revisar `docs/STACK_HOUND_EXPRESS.md`. El frontend se desarrolla en su propia rama; no copiar su árbol a este worktree para documentarlo.
8. Regla de negocio central: una guía solo avanza a la etapa siguiente (Recepción de carga → Vehículo cargado → Vehículo liberado → Vehículo en camino → Carga entregada).

## Ramas

Ramas de larga duración, con nombre que dice qué contiene. No se crean otras. Esta tabla describe el flujo del repositorio, no rutas disponibles en todas las ramas.

| Rama | Contiene | Recibe cambios de |
|---|---|---|
| `frontend` | Rediseño y aplicación React. | trabajo directo |
| `backend` | API de producto con Django y DRF (`backend/`). | trabajo directo |
| `pruebas` | Integración del producto: suite completa, `docker compose` y CI en verde. | `frontend` y `backend` |
| `main` | El producto integrado, limpio y profesional. Solo lo que ya pasó por `pruebas`. | `pruebas` |

- Flujo de producto: `frontend` y `backend` → PR a `pruebas` → PR de `pruebas` a `main`.
- **Reglas por rama:** las ramas de producto solo llevan código y documentación en tono de producto. Cada rama trabaja con sus propias reglas y estilos, sin mezclarlos con los de otra. Cada merge se adapta a la rama destino, incluidos sus mensajes de commit. Revisar el diff de salida; no integrar una rama completa sin filtrar ni copiar su árbol, porque puede reintroducir archivos eliminados.
- Un agente por rama y un worktree por rama. No compartir la escritura de una misma rama entre agentes.
- Commits con Conventional Commits, en inglés y español: `tipo(scope): description in English / descripción en español` (`feat(backend): add the guide model / agrega el modelo de guías`). Sin atribución a IA ni `Co-Authored-By`.
- PR: título en español; el cuerpo abre con una línea de resumen en inglés y sigue en español.
- Las ramas publicadas se sincronizan mediante **merge**, no rebase: conservar su historial compartido. Antes de publicar, obtener y revisar los cambios remotos e integrarlos mediante merge si corresponde. Nunca usar `--force` ni `--force-with-lease`.

## Ejecución local y permisos

- El agente ejecuta Git local, incluidos commits. No ejecuta Git con red ni publica cambios sin la aprobación explícita de Eduardo en la sesión.
- Con aprobación explícita de Eduardo en la conversación, el agente puede ejecutar `push`, crear y publicar tags, y abrir PRs con `gh`. Condiciones: (a) la aprobación consta en la conversación, (b) el agente anuncia cada comando y muestra su salida real, (c) nunca usa `--force` ni `--force-with-lease`, y (d) el trabajo publicado ya pasó el gate de PR de la rama (pruebas, linter, migraciones y revisión GGA).
- Sin esa aprobación, el agente entrega un único bloque de comandos a Eduardo y espera su salida. Eduardo conserva `fetch`, `pull` y todos los comandos de npm y Homebrew.
- Cuando se necesite una operación reservada a Eduardo, entregar un único bloque de comandos con el directorio de ejecución y pedirle que lo ejecute. Detenerse y esperar su salida antes de continuar; no asumir éxito.
- El agente nunca ejecuta `npm ci`, ni siquiera fuera del sandbox, y no accede a credenciales, llaveros ni archivos de secretos. No cambiar helpers de credenciales ni buscar atajos de autenticación.
- El sandbox de mínimo privilegio es intencional. Un bloqueo de permisos no autoriza elevar privilegios, desactivar restricciones ni ejecutar la operación por otra vía: corresponde pedir el bloque a Eduardo y esperar.
- Estas reglas y la sección Ramas prevalecen sobre instrucciones anteriores de skills que indiquen rebase de una rama publicada, push del agente, npm fuera del sandbox o acceso a credenciales.
- Una asignación limitada a editar archivos no autoriza Git ni instalación, pruebas o configuración de herramientas.

## Errores que ya cometimos (reglas para no repetirlos)

1. No reinterpretar el objetivo de Eduardo. Si algo parece innecesario o "no bloqueante", pregunta su plan antes de opinar.
2. Verificar el estado en el código antes de escribirlo en un documento.
3. Antes de diseñar, inventariar todas las URLs del sitio vivo; no limitarse a los enlaces del Inicio.
4. Las herramientas de diseño trabajan por lotes de una o dos pantallas, nunca con todo en un solo prompt.
5. En zsh, `"$B:ruta"` se rompe por el modificador `:`; usa `"${B}:ruta"`. Si falta una herramienta preferida (`sd`), comprueba con `command -v` y usa otra.
6. Un documento commiteado cita rutas que existen en la rama, no los nombres del kit que genera un script.
7. No confundir una regla demostrada en el frontend con datos de demostración con una validación implementada en la API.
8. Las ramas locales sobrantes también rompen la regla de ramas: revisar los worktrees viejos y las ramas cuya remota ya se borró. No crear ramas adicionales ni eliminar ramas o worktrees sin autorización de Eduardo.
9. Engram tiene un solo proyecto, `houndxpress`, en minúsculas. Una búsqueda con otra capitalización no devuelve nada. No se crean alias.
10. En Codex, npm lo ejecuta Eduardo, no el agente. Git con red también lo ejecuta Eduardo, salvo autorización explícita del propio Eduardo en la sesión. No intentar `npm ci` dentro ni fuera del sandbox: puede dejar `node_modules` a medias. Entregar un único bloque de comandos y esperar su salida, sin acceder a credenciales ni eludir el sandbox de mínimo privilegio.

## Comandos

Referencia para Eduardo, no evidencia de ejecución. Desde `backend/`, con el entorno virtual activado:

```bash
python -m pip install -r requirements-dev.txt
# Si la .venv la creó uv (no trae pip): uv pip install -r requirements-dev.txt --python .venv/bin/python
python manage.py test && python -m ruff check . && python -m ruff format --check .
```

No incluir comandos de frontend, Docker o diagramas como si sus archivos existieran en este worktree.

## Herramientas locales de Eduardo

Graphify, Engram, OpenCode (con el MCP de Pencil) y el navegador Brave viven en su Mac y no están en las sesiones en la nube. En la nube, este archivo y `docs/` son la fuente de contexto. No asumir que el grafo ni las integraciones locales están disponibles en esta rama; en Engram, el proyecto es `houndxpress`.
