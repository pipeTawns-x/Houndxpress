# Hound Express: seguimiento de guías

Backend en Django y frontend en React para registrar las guías de Hound Express y asegurar que cada una avance por las cinco etapas del proceso en el orden establecido. Es el proyecto final del programa *Profesión: Desarrollador Full Stack Python* de EBAC, con Hound Express como empresa aliada.

**Estado actual:**

- **Backend: entregable M52, el esqueleto del proyecto** (etiqueta `m52`). Todavía no hay tablas de guías ni endpoints de negocio; llegan en M54 y M64 (ver [Hoja de ruta](#hoja-de-ruta)).
- **Frontend: rediseño del sitio de Hound Express** con rastreo y panel de operaciones. Funciona con **datos de demostración** guardados en el navegador hasta que existan los endpoints de guías; lo único que consulta del backend hoy es su estado (`/api/v1/health/`). Ver [Frontend](#frontend).
- **Docker:** todo el proyecto se levanta con `docker compose up --build` (ver [Con Docker](#con-docker)).

## Qué contiene la entrega M52

Cada fila existe en el repositorio y se verifica en cada push con GitHub Actions.

| Requisito cumplido | Evidencia |
|---|---|
| Proyecto Django generado con `django-admin startproject` y `manage.py` | [`backend/manage.py`](backend/manage.py), [`backend/config/`](backend/config/) |
| Estructura inicial: proyecto `config` y apps `accounts`, `core` y `tracking` | `INSTALLED_APPS` en [`backend/config/settings.py`](backend/config/settings.py) |
| Modelo de usuario propio, creado antes de la primera migración | [`backend/accounts/models.py`](backend/accounts/models.py), [`backend/accounts/migrations/0001_initial.py`](backend/accounts/migrations/0001_initial.py) |
| API con Django REST Framework: punto de salud que consulta la base de datos | [`backend/core/views.py`](backend/core/views.py), [`backend/core/tests/test_health.py`](backend/core/tests/test_health.py) |
| Servidor local con entorno virtual y pip | sección *Inicio rápido*; jobs `readme (bash)` y `readme (powershell)` en [`ci.yml`](.github/workflows/ci.yml) |
| Dependencias con versiones fijas | [`backend/requirements.txt`](backend/requirements.txt) |
| Configuración por variables de entorno, sin secretos en el repositorio | [`backend/.env.example`](backend/.env.example), [`backend/core/tests/test_settings.py`](backend/core/tests/test_settings.py) |
| Lint y 13 pruebas automáticas en Linux (Python 3.10 y 3.12) y Windows | [`.github/workflows/ci.yml`](.github/workflows/ci.yml) |

La versión entregada está congelada en la etiqueta [`m52`](https://github.com/pipeTawns-x/Houndxpress/tree/m52). Para ejecutar exactamente esa versión después de clonar: `git checkout m52`.

## Inicio rápido

Necesitas Git y Python 3.10 o superior (recomendado: 3.12). No hace falta crear un archivo `.env`.

**Antes de empezar:** la primera línea de cada bloque falla con `Necesitas Python 3.10 o superior` si tu Python es anterior (en macOS, el `python3` del sistema suele ser 3.9). En ese caso instala Python 3.12 desde [python.org](https://www.python.org/downloads/) (en macOS también con `brew install python@3.12`) y usa `python3.12` en lugar de `python3` en el bloque (en Windows, `py -3.12` en lugar de `py`). Para crear el entorno escribe `python3.12 -m venv --clear .venv` (Windows: `py -3.12 -m venv --clear .venv`): `--clear` reemplaza un `.venv` que ya exista, y sin él el entorno conserva Python 3.9.

### macOS y Linux

```bash
python3 -c "import sys; assert sys.version_info >= (3, 10), 'Necesitas Python 3.10 o superior'"
git clone https://github.com/pipeTawns-x/Houndxpress.git
cd Houndxpress/backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Windows (PowerShell o cmd)

```powershell
py -c "import sys; assert sys.version_info >= (3, 10), 'Necesitas Python 3.10 o superior'"
git clone https://github.com/pipeTawns-x/Houndxpress.git
cd Houndxpress\backend
py -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python manage.py migrate
.venv\Scripts\python manage.py runserver
```

No hace falta activar el entorno virtual: cada comando usa directamente el Python de `.venv`. Si `py` no existe, usa `python` en su lugar (en la primera línea y en `python -m venv .venv`).

Resultado esperado en cualquier sistema: la consola muestra `Starting development server at http://127.0.0.1:8000/`. La advertencia `WARNING: This is a development server` es normal en local. Abre <http://127.0.0.1:8000/> en el navegador: redirige a `/api/v1/health/`, donde la página de la API navegable de Django REST Framework muestra `"status": "ok"` y `"database": "ok"`. Detén el servidor con `Ctrl+C`.

## Verificar la instalación

Con el servidor encendido, abre otra terminal y ejecuta (en Windows, `curl.exe`):

```bash
curl http://127.0.0.1:8000/api/v1/health/
```

La respuesta esperada es `{"status":"ok","database":"ok"}`.

Pruebas y lint, desde `backend/` en cualquier terminal (usan el Python de `.venv`, sin activarlo):

```bash
.venv/bin/python -m pip install -r requirements-dev.txt
.venv/bin/python manage.py test
.venv/bin/python -m ruff check .
```

En Windows, escribe `.venv\Scripts\python` en lugar de `.venv/bin/python`. Resultado esperado: `Ran 13 tests` seguido de `OK`, y luego `All checks passed!`. Para el panel de administración, crea un usuario con `.venv/bin/python manage.py createsuperuser` y abre <http://127.0.0.1:8000/admin/>.

## Configuración

Todas las variables son opcionales en desarrollo. La plantilla es [`backend/.env.example`](backend/.env.example); cópiala como `backend/.env` si quieres cambiar algún valor.

| Variable | Valor por defecto | Obligatoria cuando |
|---|---|---|
| `DJANGO_DEBUG` | `true` | nunca |
| `DJANGO_SECRET_KEY` | clave de desarrollo marcada como insegura | `DJANGO_DEBUG=false` |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1,[::1]` | `DJANGO_DEBUG=false` |

Con `DJANGO_DEBUG=false` el proyecto no arranca si falta alguna de las dos últimas, y rechaza claves que empiecen con `django-insecure`. En esta versión la base de datos es SQLite (`backend/db.sqlite3`, creada por `migrate`).

## Frontend

Rediseño del sitio de Hound Express en una sola aplicación: sitio público, rastreo de guías y panel de operaciones para el personal. El proceso de diseño (investigación del sitio actual, propuesta, abogado del diablo, arquitecto y revisión) está en [`docs/diseno/`](docs/diseno/).

| Ruta | Pantalla |
|---|---|
| `/` | Inicio con buscador de guía, cifras, servicios, las cinco etapas y cobertura |
| `/rastreo` | Rastreo simple o múltiple con línea de tiempo de etapas; acepta `?guia=NUMERO` |
| `/servicios`, `/cobertura`, `/nosotros`, `/preguntas`, `/contacto` | Sitio institucional |
| `/panel` | Panel de operaciones: resumen por etapa, registro de guías, lista con filtro, avance a la etapa siguiente e historial |
| `/disenos` | Índice de diseños: todas las pantallas y la guía de estilo en vivo |

Necesitas Node 20.19 o superior (recomendado: 22). Con el backend encendido en otra terminal (ver [Inicio rápido](#inicio-rápido)):

```bash
cd frontend
npm ci
npm run dev
```

Abre <http://localhost:5173/>. Vite reenvía `/api` y `/admin` a Django en `127.0.0.1:8000`, así que el pie de página y el panel muestran "API en línea" cuando el backend responde. Sin backend, la aplicación funciona igual y muestra "API sin conexión".

**Datos de demostración.** Las guías del rastreo y del panel se guardan solo en tu navegador (`localStorage`) y la interfaz lo indica. Guías de ejemplo para probar el rastreo: `2148 2139 0765 0312` (Recepción de carga), `2176 6402 1583 9927` (Vehículo liberado), `2119 8753 0246 7781` (Vehículo en camino) y `2154 3029 6817 0435` (Carga entregada); la lista completa está en [`frontend/README.md`](frontend/README.md#guías-de-ejemplo). El panel tiene un botón para restablecerlas. Cuando existan los endpoints de M64, `VITE_DATA_SOURCE=api` cambia al repositorio HTTP sin tocar las pantallas.

Pruebas y calidad, desde `frontend/`: `npm run lint`, `npm run typecheck`, `npm test` y `npm run build`. Resultado esperado: lint y tipos sin errores, `Tests  235 passed (235)` y la compilación en `frontend/dist/`. Detalle en [`frontend/README.md`](frontend/README.md).

## Con Docker

Si prefieres no instalar Python ni Node, con Docker Desktop abierto:

```bash
git clone https://github.com/pipeTawns-x/Houndxpress.git
cd Houndxpress
docker compose up --build
```

Abre <http://localhost:8080/> para el frontend; nginx reenvía `/api`, `/admin` y `/static` a Django, que también responde directo en <http://localhost:8000/>. Comprueba la API a través de nginx con `curl http://localhost:8080/api/v1/health/` (en Windows, `curl.exe`): la respuesta esperada es `{"status":"ok","database":"ok"}`. Para el panel de administración: `docker compose exec backend python manage.py createsuperuser`. Detén todo con `Ctrl+C` y borra los contenedores con `docker compose down`.

Es un entorno de desarrollo: Django corre con `runserver` y `DJANGO_DEBUG=true`, y la base SQLite vive dentro del contenedor, así que `docker compose down` la borra. El job `docker compose` de [`ci.yml`](.github/workflows/ci.yml) reproduce este bloque en cada push.

## Diagramas

[`docs/diagramas/`](docs/diagramas/) contiene diagramas interactivos de la arquitectura, del ciclo de vida de una guía y de las consultas del frontend, generados con [Archify](https://github.com/tt-a1i/archify). Son archivos HTML autónomos: se abren con doble clic y se exportan a PNG para los documentos de entrega.

## Estructura del repositorio

```text
Houndxpress/
├── .github/workflows/ci.yml   # Lint, pruebas, frontend, Docker y los comandos de este README en cada push
├── .claude/skills/archify/    # Skill Archify para generar diagramas (MIT)
├── CLAUDE.md                  # Contexto del proyecto para agentes de IA
├── docker-compose.yml         # backend + frontend (nginx) para desarrollo
├── docs/
│   ├── STACK_HOUND_EXPRESS.md # Decisiones técnicas y licencias de las dependencias
│   ├── diseno/                # Investigación, propuesta, abogado del diablo, arquitecto y sistema de diseño
│   └── diagramas/             # Diagramas interactivos (HTML) y sus fuentes
├── frontend/                  # React + TypeScript + Vite + Tailwind
│   ├── src/domain/            # Etapas, tipos y reglas de avance (sin React)
│   ├── src/services/          # Repositorio de guías (demostración y HTTP) y estado de la API
│   ├── src/pages/             # Una pantalla por ruta
│   ├── Dockerfile, nginx.conf # Imagen de producción del SPA y proxy a Django
│   └── package.json           # Scripts: dev, build, lint, typecheck, test
└── backend/                   # Proyecto Django: aquí vive manage.py
    ├── config/                # settings, urls, wsgi y asgi
    ├── accounts/              # Modelo de usuario del sistema
    ├── core/                  # Plataforma: punto de salud /api/v1/health/
    ├── tracking/              # Dominio de guías y etapas (tablas a partir de M54)
    ├── Dockerfile             # Imagen de desarrollo de la API
    ├── requirements.txt       # Dependencias de ejecución con versiones fijas
    ├── requirements-dev.txt   # Lo anterior más herramientas de desarrollo (ruff)
    ├── pyproject.toml         # Declaración de dependencias; uv.lock fija el árbol completo
    └── .env.example           # Variables de entorno opcionales
```

## Contexto del negocio

Hound Express es una empresa de mensajería dedicada a la importación en comercio electrónico, con entregas a nivel local e internacional. Cada guía debe registrar su estatus en este orden, y cada etapa tiene un departamento responsable:

| Orden | Etapa | Responsable |
|---|---|---|
| 1 | Recepción de carga | Aduana |
| 2 | Vehículo cargado | Aduana |
| 3 | Vehículo liberado | Operaciones |
| 4 | Vehículo en camino | Seguridad |
| 5 | Carga entregada | KAM |

Problemas que reporta la empresa, citados del documento del proyecto:

- "Las guías de carga no siguen el proceso en el orden adecuado, saltando pasos para luego ponerlos con fechas posteriores."
- "El porcentaje de error es que de 100 guías solo el 31% siguen el proceso como debe ser y el otro 69% no lo sigue."
- "Pérdidas de 200k pesos MXN por sobrecostos y errores."
- "Se presentan errores humanos por sobrecarga."
- "No tienen datos para analizar y realizar históricos."

## Hoja de ruta

| Módulo | Alcance | Estado |
|---|---|---|
| M52 | Esqueleto del proyecto Django | Esta versión (etiqueta `m52`) |
| M54 | Tablas y migraciones: guías, historial de etapas que no se puede editar ni borrar, departamento de cada usuario | Planeado |
| M64 | Endpoints GET (estado actual de una guía), POST (registrar una guía) y PUT (actualizar el estatus) con validación del orden de etapas | Planeado |
| M66 | Entrega final y documentación para ejecutar el proyecto en local | Planeado |

**Interfaz para operadores:** el panel de `/panel` ya aplica la regla de avance con datos de demostración; en M64 se conecta a los endpoints reales cambiando `VITE_DATA_SOURCE` a `api`.

## Decisiones técnicas

El detalle está en [`docs/STACK_HOUND_EXPRESS.md`](docs/STACK_HOUND_EXPRESS.md). En resumen: Django 5.2 LTS con Django REST Framework; proyecto local con `manage.py` en lugar de la plantilla Docker del curso, más un `docker-compose.yml` propio de dos servicios; frontend en React con Vite y Tailwind; SQLite en esta etapa; modelo de usuario propio desde el inicio; ninguna dependencia con licencia copyleft. Los archivos `requirements*.txt` se generan desde `backend/uv.lock` y no se editan a mano; los comandos están en ese documento.

## Derechos de uso

Este repositorio no incluye una licencia de código abierto. El proyecto se cederá a Hound Express según los términos del programa, y el aviso de licencia se agregará cuando se formalice esa cesión. Las licencias de las dependencias están en [`docs/STACK_HOUND_EXPRESS.md`](docs/STACK_HOUND_EXPRESS.md).

El logotipo de `frontend/public/brand/` y los datos públicos del sitio (cifras, teléfonos, preguntas frecuentes) son de Hound Express y se usan porque el proyecto se desarrolla para la empresa; el frontend es un rediseño académico, no el sitio oficial. La skill de `.claude/skills/archify/` conserva su licencia MIT original.

## Autor

Felipe ([@pipeTawns-x](https://github.com/pipeTawns-x)), programa *Profesión: Desarrollador Full Stack Python* de EBAC.
