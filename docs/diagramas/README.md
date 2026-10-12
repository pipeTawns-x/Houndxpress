# Diagramas del proyecto

Diagramas interactivos generados con [Archify](https://github.com/tt-a1i/archify) 3.0.1 (licencia MIT), instalado como skill del proyecto en [`.claude/skills/archify/`](../../.claude/skills/archify/). Cada archivo `.html` es autónomo: se abre con doble clic en cualquier navegador, sin instalar nada, y permite acercar, seguir rutas, cambiar a tema oscuro y exportar a PNG, SVG o WebP desde el botón **Exportar**.

| Diagrama | Qué muestra | Archivo |
|---|---|---|
| Arquitectura | Navegador, frontend React, proxy `/api`, API Django, SQLite y lo planeado para M54 | [`arquitectura.html`](arquitectura.html) |
| Ciclo de vida de una guía | Las cinco etapas en orden estricto, su responsable y la regla de avance | [`ciclo-de-vida-guia.html`](ciclo-de-vida-guia.html) |
| Secuencia de consultas | Estado de la API (real desde M52), rastreo con datos de demostración y rastreo contra la API (M64) | [`secuencia-consultas.html`](secuencia-consultas.html) |

Los tres pasaron las cuatro compuertas de `archify finalize` en modo `showcase`: validación del esquema, entrega, revisión estricta del HTML y revisión en un navegador real.

## Cómo regenerarlos

Las fuentes son JSON y se generan con un script, así que un cambio de arquitectura es un cambio de código revisable:

```bash
python3 docs/diagramas/fuentes/generar.py
node .claude/skills/archify/bin/archify.mjs finalize architecture docs/diagramas/fuentes/arquitectura.json docs/diagramas/arquitectura.html --quality showcase --json
node .claude/skills/archify/bin/archify.mjs finalize lifecycle docs/diagramas/fuentes/ciclo-de-vida-guia.json docs/diagramas/ciclo-de-vida-guia.html --quality showcase --json
node .claude/skills/archify/bin/archify.mjs finalize sequence docs/diagramas/fuentes/secuencia-consultas.json docs/diagramas/secuencia-consultas.html --quality showcase --json
```

Requisitos: Node 18 o superior y un Chrome o Chromium para la revisión en navegador (si no lo encuentra solo, se indica con `ARCHIFY_CHROME=/ruta/al/navegador`). Los archivos `*.delivery.json` son la procedencia que liga cada HTML con su fuente; se regeneran solos.

## Uso con Claude Code

Al abrir el repositorio, Claude Code descubre la skill. Basta con pedir, por ejemplo, "usa Archify para diagramar el flujo de registro de guías de M64" y la skill escribe el JSON, lo valida y entrega el HTML.

## Para las entregas del LMS

Abre el HTML, elige tema claro u oscuro y usa **Exportar → PNG** para pegar la imagen en el documento de entrega; enlaza además el archivo del repositorio para que el revisor pueda explorarlo.
