# Diagramas del proyecto

Diagramas interactivos generados con [Archify](https://github.com/tt-a1i/archify) 3.0.1 (licencia MIT), instalado como skill del proyecto en [`.claude/skills/archify/`](../../.claude/skills/archify/). Cada archivo `.html` es autónomo: se abre con doble clic en cualquier navegador, sin instalar nada, y permite acercar, seguir rutas, cambiar a tema oscuro y exportar a PNG, SVG o WebP desde el botón **Exportar**.

| Diagrama | Qué muestra | Archivo |
|---|---|---|
| Arquitectura | Navegador, frontend React, proxy `/api`, API Django, servicios de `tracking`, límite de login y SQLite. Anotado con los patrones que el código usa y su `archivo:línea` | [`arquitectura.html`](arquitectura.html) |
| Modelo de datos | `Guide`, `StatusHistory`, `StageTransitionAttempt` y `User` con sus restricciones y relaciones, los QuerySet que vigilan las escrituras, el UPDATE condicional, los servicios y lo planeado (`Incident`). Anotado con los patrones y su `archivo:línea` | [`modelo-de-datos.html`](modelo-de-datos.html) |
| Ciclo de vida de una guía | Las cinco etapas en orden estricto, su responsable y la regla de avance. Debajo, el alta por la API o el admin, los avances rechazados y el archivo, con su evidencia en el código | [`ciclo-de-vida-guia.html`](ciclo-de-vida-guia.html) |
| Secuencia de consultas | Estado de la API, rastreo público, avance de etapa y acceso, con el límite que comparten la API y el admin | [`secuencia-consultas.html`](secuencia-consultas.html) |

Los cuatro pasaron las cuatro compuertas de `archify finalize` en modo `showcase` (validación del esquema, entrega, revisión estricta del HTML y revisión en un navegador real) y el `visual-check` de Archify.

## Vistas previas

GitHub muestra los `.html` como código; estas imágenes (tema claro) se ven directamente en la página. Para explorar el diagrama, descarga el HTML y ábrelo en el navegador.

![Arquitectura](img/arquitectura.png)

![Modelo de datos](img/modelo-de-datos.png)

![Ciclo de vida de una guía](img/ciclo-de-vida-guia.png)

![Secuencia de consultas](img/secuencia-consultas.png)

## Patrones y evidencia

Los cuatro diagramas siguen el método de los diagramas de Carni-mvp: cada patrón lleva una etiqueta honesta y cada nodo, su evidencia en el código.

- **Etiquetas:** "existe" (está en el código), "framework" (lo da Django o DRF), "analogía" (se parece, pero no es el patrón) y "propuesta" (todavía no existe). El catálogo de referencia es [refactoring.guru](https://refactoring.guru/es/design-patterns/catalog); se cita, nunca se copia.
- **Evidencia:** los marcadores `SRC` de cada nodo apuntan a `archivo:línea` de la versión M54.3. Archify los verifica contra los bytes de la revisión que fija `generar.py` al generar el HTML: 70 referencias (17 en `arquitectura`, 21 en `modelo-de-datos`, 20 en `ciclo-de-vida-guia` y 12 en `secuencia-consultas`).
- **Enlaces:** en esta edición escolar `meta.repository.link_mode` vale `local-only`, porque se genera antes de publicar esa revisión. La edición de producto usa enlaces permanentes en GitHub.

| Patrón | Etiqueta | Evidencia | Diagramas |
|---|---|---|---|
| State, forma simple: `Stage` y solo la etapa siguiente | existe | `tracking/models.py:43-48`, `:61-69` | Modelo de datos, ciclo de vida |
| Compare-and-set (no es GoF): UPDATE condicional de la etapa | existe | `tracking/models.py:104-108` | Modelo de datos, ciclo de vida, secuencia |
| Facade: casos de uso sobre las invariantes del modelo | existe | `tracking/services.py:1`, `:59-70`, `:73-120` | Los cuatro |
| Value Object: `TrackingNumber` | existe | `tracking/values.py:19-23` | Arquitectura, modelo de datos |
| Repository en el frontend: `GuideRepository` | existe | `frontend/src/services/guideRepository.ts:3-7`, `httpRepository.ts:12` | Arquitectura, secuencia |
| Template Method: `save_base` sobrescrito | framework | `tracking/models.py:209`, `:367` | Modelo de datos |
| Chain of Responsibility: `MIDDLEWARE` | framework | `config/settings.py:105-113` | Arquitectura |
| Strategy: renderers y throttles de DRF | framework | `config/settings.py:186-197` | Arquitectura |
| Proxy de protección: QuerySet que vigila las escrituras | analogía | `tracking/models.py:118`, `:254` | Modelo de datos |
| Decorator: el límite envuelve el login del admin | analogía | `config/admin_throttle.py:13-28`, `config/urls.py:11-12` | Arquitectura, secuencia |
| Observer para avisos | propuesta | Todavía no existe | Ciclo de vida |

Las rutas de `tracking/` y `config/` parten de `backend/`. El detalle de cada patrón está en [`docs/propuesta/blueprint.md`](../propuesta/blueprint.md) §3.

## Cómo regenerarlos

Las fuentes son JSON y se generan con un script, así que un cambio de arquitectura es un cambio de código revisable.

Los cuatro citan código, así que necesitan `--repo-root` con una copia del repositorio en la revisión que fija `generar.py`. Si el código cambia, actualiza en `generar.py` la revisión y las líneas citadas.

```bash
python3 docs/diagramas/fuentes/generar.py
node .claude/skills/archify/bin/archify.mjs finalize architecture docs/diagramas/fuentes/arquitectura.json docs/diagramas/arquitectura.html --repo-root <copia-en-la-revisión> --quality showcase --json
node .claude/skills/archify/bin/archify.mjs finalize architecture docs/diagramas/fuentes/modelo-de-datos.json docs/diagramas/modelo-de-datos.html --repo-root <copia-en-la-revisión> --quality showcase --json
node .claude/skills/archify/bin/archify.mjs finalize lifecycle docs/diagramas/fuentes/ciclo-de-vida-guia.json docs/diagramas/ciclo-de-vida-guia.html --repo-root <copia-en-la-revisión> --quality showcase --json
node .claude/skills/archify/bin/archify.mjs finalize sequence docs/diagramas/fuentes/secuencia-consultas.json docs/diagramas/secuencia-consultas.html --repo-root <copia-en-la-revisión> --quality showcase --json
```

Para la revisión visual: `node .claude/skills/archify/bin/archify.mjs visual-check docs/diagramas/<nombre>.html --summary --require-provenance --out-dir <carpeta-temporal>`.

Requisitos: Node 18 o superior y un navegador Chromium para la revisión. En esta máquina se usa Brave: `ARCHIFY_CHROME="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"`. Con `ARCHIFY_UPDATE_CHECK_DISABLED=1`, `finalize` no consulta en internet si hay versiones nuevas.

Después de regenerar cualquier HTML, recaptura su vista previa. Si no, GitHub y el mensaje del LMS mostrarían un diagrama viejo:

1. Captura las imágenes de `img/` con el navegador sin interfaz, a 1600 px de ancho, a página completa y con `?theme=light` en la dirección del HTML.
2. Registra de qué HTML salió cada imagen:

   ```bash
   (cd docs/diagramas && shasum -a 256 arquitectura.html modelo-de-datos.html ciclo-de-vida-guia.html secuencia-consultas.html > img/previews.sha256)
   ```

3. Comprueba que ninguna imagen quedó vieja. El script falla y nombra la imagen si un HTML cambió después de su captura:

   ```bash
   sh docs/diagramas/img/check-previews.sh
   ```

Los archivos `*.delivery.json` son la procedencia que liga cada HTML con su fuente y se regeneran solos. Guardan rutas absolutas, por eso se generan desde una carpeta temporal neutra y no desde la carpeta personal.

## Uso con Claude Code

Al abrir el repositorio, Claude Code descubre la skill. Basta con pedir, por ejemplo, "usa Archify para diagramar el flujo de registro de guías de M64" y la skill escribe el JSON, lo valida y entrega el HTML.

## Para las entregas del LMS

Abre el HTML, elige tema claro u oscuro y usa **Exportar → PNG** para pegar la imagen en el documento de entrega; enlaza además el archivo del repositorio para que el revisor pueda explorarlo.
