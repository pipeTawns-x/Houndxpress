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

## Comandos

```bash
# Backend (desde backend/)
python -m pip install -r requirements-dev.txt
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

M52 esqueleto Django (entregado, etiqueta `m52`) · M54 tablas de guías e historial inmutable · M64 endpoints GET/POST/PUT con validación del orden de etapas · M66 entrega final. El contrato de datos que el frontend ya usa está en `docs/diseno/03-arquitecto.md`; M54 lo confirma o lo cambia en ambos lados a la vez.

## Herramientas locales de Eduardo

Graphify, Engram y el navegador Brave viven en su Mac y no están en las sesiones en la nube. En la nube, este archivo y `docs/` son la fuente de contexto; en local, el grafo de Graphify del proyecto se llama **Hound Express** y se alimenta de este repositorio.
