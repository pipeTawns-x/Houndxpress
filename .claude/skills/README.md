# Skills del proyecto

Claude Code descubre estas carpetas al abrir el repositorio.

| Skill | Versión | Origen | Licencia | Para qué |
|---|---|---|---|---|
| `archify/` | 3.0.1 (commit `5ca9c12`) | <https://github.com/tt-a1i/archify> | MIT, aviso en `archify/LICENSE` | Diagramas interactivos de arquitectura, flujos, secuencias y ciclos de vida. Uso en [`docs/diagramas/`](../../docs/diagramas/README.md). |

`archify/` es una copia de la carpeta `archify/` del repositorio original sin `test/` ni los ejemplos ya renderizados (`examples/*.html`), que el skill no necesita para generar diagramas. `node archify/bin/archify.mjs doctor` confirma que está completo.

Para actualizarla: clona el repositorio original, copia su carpeta `archify/` aquí con las mismas exclusiones, ejecuta `doctor`, regenera los diagramas y actualiza esta tabla.
