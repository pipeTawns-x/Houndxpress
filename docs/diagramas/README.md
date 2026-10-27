# Diagramas del proyecto

Diagramas interactivos generados con [Archify](https://github.com/tt-a1i/archify) 3.0.1 (licencia MIT), instalado como skill del proyecto en [`.claude/skills/archify/`](../../.claude/skills/archify/). Cada archivo `.html` es autónomo: se abre con doble clic en cualquier navegador, sin instalar nada, y permite acercar, seguir rutas, cambiar a tema oscuro y exportar a PNG, SVG o WebP desde el botón **Exportar**.

| Diagrama | Qué muestra | Archivo |
|---|---|---|
| Arquitectura | Navegador, frontend React, proxy `/api`, API Django, SQLite y lo planeado para M54 | [`arquitectura.html`](arquitectura.html) |
| Modelo de datos | `Guide`, `StatusHistory` y `User` con sus restricciones y relaciones, los QuerySet que vigilan las escrituras, el UPDATE condicional y lo planeado (`Incident`). Anotado con los patrones que el código usa y su `archivo:línea` | [`modelo-de-datos.html`](modelo-de-datos.html) |
| Ciclo de vida de una guía | Las cinco etapas en orden estricto, su responsable y la regla de avance, con la evidencia de cada etapa en el código. Debajo, los estados del rastreo del sitio actual de Hound según REA, sin equivalencia inventada con nuestras etapas | [`ciclo-de-vida-guia.html`](ciclo-de-vida-guia.html) |
| Secuencia de consultas | Estado de la API (real desde M52), rastreo con datos de demostración y rastreo contra la API (M64) | [`secuencia-consultas.html`](secuencia-consultas.html) |

Los cuatro pasaron las cuatro compuertas de `archify finalize` en modo `showcase`: validación del esquema, entrega, revisión estricta del HTML y revisión en un navegador real.

## Patrones y evidencia

`modelo-de-datos` y `ciclo-de-vida-guia` siguen el método de los diagramas de Carni-mvp: cada patrón lleva una etiqueta honesta y cada nodo, su evidencia en el código.

- **Etiquetas:** "existe" (está en el código), "framework" (lo da Django o DRF), "analogía" (se parece, pero no es el patrón) y "propuesta" (todavía no existe). El catálogo de referencia es [refactoring.guru](https://refactoring.guru/es/design-patterns/catalog); se cita, nunca se copia.
- **Evidencia:** los marcadores `SRC` de cada nodo apuntan a `archivo:línea` de la rama `backend` en el commit `aed7967` (M54.1). Archify los verifica contra los bytes de ese commit al generar el HTML (16 referencias en `modelo-de-datos`).
- **Enlaces:** `meta.repository.link_mode` vale `local-only` porque `aed7967` todavía no está en GitHub. Después del push, cambiarlo a `web` en las fuentes y regenerar para que los marcadores se vuelvan enlaces.

El detalle de cada patrón está en [`docs/propuesta/blueprint.md`](../propuesta/blueprint.md) §3.

## Cómo regenerarlos

Las fuentes son JSON y se generan con un script, así que un cambio de arquitectura es un cambio de código revisable.

`arquitectura` y `secuencia-consultas`:

```bash
python3 docs/diagramas/fuentes/generar.py
node .claude/skills/archify/bin/archify.mjs finalize architecture docs/diagramas/fuentes/arquitectura.json docs/diagramas/arquitectura.html --quality showcase --json
node .claude/skills/archify/bin/archify.mjs finalize sequence docs/diagramas/fuentes/secuencia-consultas.json docs/diagramas/secuencia-consultas.html --quality showcase --json
```

`modelo-de-datos` y `ciclo-de-vida-guia` citan código de la rama `backend`, así que necesitan `--repo-root` con una copia de esa rama en `aed7967`:

```bash
node .claude/skills/archify/bin/archify.mjs finalize architecture docs/diagramas/fuentes/modelo-de-datos.json docs/diagramas/modelo-de-datos.html --repo-root <copia-de-la-rama-backend> --quality showcase --json
node .claude/skills/archify/bin/archify.mjs finalize lifecycle docs/diagramas/fuentes/ciclo-de-vida-guia.json docs/diagramas/ciclo-de-vida-guia.html --repo-root <copia-de-la-rama-backend> --quality showcase --json
```

Requisitos: Node 18 o superior y un navegador Chromium para la revisión. En esta máquina se usa Brave: `ARCHIFY_CHROME="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"`. Con `ARCHIFY_UPDATE_CHECK_DISABLED=1`, `finalize` no consulta en internet si hay versiones nuevas.

Los archivos `*.delivery.json` son la procedencia que liga cada HTML con su fuente y se regeneran solos. Guardan rutas absolutas, por eso se generan desde una carpeta temporal neutra y no desde la carpeta personal.

## Uso con Claude Code

Al abrir el repositorio, Claude Code descubre la skill. Basta con pedir, por ejemplo, "usa Archify para diagramar el flujo de registro de guías de M64" y la skill escribe el JSON, lo valida y entrega el HTML.

## Para las entregas del LMS

Abre el HTML, elige tema claro u oscuro y usa **Exportar → PNG** para pegar la imagen en el documento de entrega; enlaza además el archivo del repositorio para que el revisor pueda explorarlo.
