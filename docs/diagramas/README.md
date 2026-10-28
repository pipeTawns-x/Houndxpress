# Diagramas de Hound Express

Cuatro diagramas interactivos de la plataforma, generados con [Archify](https://github.com/tt-a1i/archify) 3.0.1 (licencia MIT). Cada archivo `.html` es autónomo: se abre en cualquier navegador sin instalar nada, permite acercar, seguir rutas, cambiar a tema oscuro y exportar a PNG, SVG o WebP desde el botón **Exportar**.

> GitHub muestra los `.html` como código. Para explorarlos, descarga el archivo (botón **Raw** o **Download raw file**) y ábrelo en el navegador. Las imágenes de esta página son vistas previas del tema claro.

| Diagrama | Qué muestra | Interactivo |
|---|---|---|
| Arquitectura | Navegador, frontend React, proxy `/api`, API Django y SQLite, con lo implementado y lo previsto | [`arquitectura.html`](arquitectura.html) |
| Modelo de datos | `Guide`, `StatusHistory` y `User` con sus restricciones, los QuerySet que vigilan las escrituras y el UPDATE condicional | [`modelo-de-datos.html`](modelo-de-datos.html) |
| Ciclo de vida de una guía | Las cinco etapas en orden estricto, su responsable y la regla de avance | [`ciclo-de-vida-guia.html`](ciclo-de-vida-guia.html) |
| Secuencia de consultas | Estado de la API, rastreo con datos de demostración y rastreo contra la API | [`secuencia-consultas.html`](secuencia-consultas.html) |

## Arquitectura

![Arquitectura de Hound Express](img/arquitectura.png)

El frontend y la API se comunican por un proxy `/api` (Vite en desarrollo, nginx en Docker Compose), de modo que el navegador usa un solo origen y no necesita CORS. Todo endpoint exige sesión, salvo `GET /api/v1/health/`.

## Modelo de datos

![Modelo de datos de Hound Express](img/modelo-de-datos.png)

La regla de negocio vive en la base y en el modelo: una guía solo avanza registrando la etapa siguiente en `StatusHistory`, que es de solo inserción. Cada nodo del diagrama enlaza con su código en `backend/tracking/models.py`.

## Ciclo de vida de una guía

![Ciclo de vida de una guía](img/ciclo-de-vida-guia.png)

## Secuencia de consultas

![Secuencia de consultas del frontend](img/secuencia-consultas.png)

Los mensajes punteados (`/api/v1/guides/`) describen el trabajo de la Fase 2; todavía no existen en el backend.

## Patrones y evidencia

Cada patrón lleva una etiqueta honesta: **existe** (está en el código), **framework** (lo da Django o DRF), **analogía** (se parece, pero no es el patrón) o **propuesta** (todavía no existe). Los enlaces apuntan al commit [`aed7967`](https://github.com/pipeTawns-x/Houndxpress/tree/aed7967dd0d3730d1feab3162d00c94033dd9685) de la rama `backend`, así que no cambian cuando el código evoluciona.

| Patrón | Etiqueta | Evidencia |
|---|---|---|
| State, forma simple: `Stage` y solo la etapa siguiente | existe | [`models.py:41`](https://github.com/pipeTawns-x/Houndxpress/blob/aed7967dd0d3730d1feab3162d00c94033dd9685/backend/tracking/models.py#L41), [`models.py:59-67`](https://github.com/pipeTawns-x/Houndxpress/blob/aed7967dd0d3730d1feab3162d00c94033dd9685/backend/tracking/models.py#L59-L67) |
| Template Method del framework: `save_base` sobrescrito | framework | [`models.py:198`](https://github.com/pipeTawns-x/Houndxpress/blob/aed7967dd0d3730d1feab3162d00c94033dd9685/backend/tracking/models.py#L198), [`models.py:354`](https://github.com/pipeTawns-x/Houndxpress/blob/aed7967dd0d3730d1feab3162d00c94033dd9685/backend/tracking/models.py#L354) |
| Compare-and-set (no es GoF): UPDATE condicional de la etapa | existe | [`models.py:93-108`](https://github.com/pipeTawns-x/Houndxpress/blob/aed7967dd0d3730d1feab3162d00c94033dd9685/backend/tracking/models.py#L93-L108) |
| Proxy de protección: QuerySet que vigila las escrituras | analogía | [`models.py:111`](https://github.com/pipeTawns-x/Houndxpress/blob/aed7967dd0d3730d1feab3162d00c94033dd9685/backend/tracking/models.py#L111), [`models.py:243`](https://github.com/pipeTawns-x/Houndxpress/blob/aed7967dd0d3730d1feab3162d00c94033dd9685/backend/tracking/models.py#L243) |
| Command para avances auditables y Observer para avisos | propuesta | todavía no existe |

El catálogo de referencia es [refactoring.guru](https://refactoring.guru/es/design-patterns/catalog); se cita, nunca se copia.

## Cómo regenerarlos

Las fuentes son JSON y las produce un script, así que un cambio de arquitectura es un cambio de código revisable.

1. Instala Archify (Node 18 o superior) y un navegador Chromium para su revisión en navegador. Si no lo encuentra solo, indícalo con `ARCHIFY_CHROME=/ruta/al/navegador`. Con `ARCHIFY_UPDATE_CHECK_DISABLED=1` no consulta en internet si hay versiones nuevas.
2. Genera los JSON. El script generador vive en una sola copia, la de las ramas `backend`, `pruebas` y `main`, porque los diagramas describen el código del backend. Ejecútalo desde una de ellas. `ARCHIFY_HOME` es la carpeta de Archify (la que contiene `bin/` y `examples/`); si Archify está en `.claude/skills/archify`, se puede omitir. Después copia los JSON y los HTML generados a esta rama.

   ```bash
   ARCHIFY_HOME=<carpeta-de-archify> python3 docs/diagramas/fuentes/generar.py
   ```

3. Entrega cada diagrama con las cuatro compuertas de `finalize` en modo `showcase`: validación del esquema, entrega, revisión estricta del HTML y revisión en un navegador real.

   ```bash
   node <carpeta-de-archify>/bin/archify.mjs finalize architecture docs/diagramas/fuentes/arquitectura.json docs/diagramas/arquitectura.html --quality showcase --json
   node <carpeta-de-archify>/bin/archify.mjs finalize sequence docs/diagramas/fuentes/secuencia-consultas.json docs/diagramas/secuencia-consultas.html --quality showcase --json
   ```

   `modelo-de-datos` y `ciclo-de-vida-guia` citan código, así que necesitan `--repo-root` con una copia del repositorio en el commit `aed7967`:

   ```bash
   node <carpeta-de-archify>/bin/archify.mjs finalize architecture docs/diagramas/fuentes/modelo-de-datos.json docs/diagramas/modelo-de-datos.html --repo-root <copia-en-aed7967> --quality showcase --json
   node <carpeta-de-archify>/bin/archify.mjs finalize lifecycle docs/diagramas/fuentes/ciclo-de-vida-guia.json docs/diagramas/ciclo-de-vida-guia.html --repo-root <copia-en-aed7967> --quality showcase --json
   ```

Los archivos `*.delivery.json` son la procedencia que liga cada HTML con su fuente. Guardan rutas absolutas, por eso se generan desde una carpeta temporal neutra y no desde una carpeta personal. Si una carpeta de evidencia ya existe de una corrida anterior, usa una nueva con `--out-dir`.

Las vistas previas de `img/` se capturan con el navegador sin interfaz, a 1600 px de ancho y con `?theme=light` en la dirección del HTML.
