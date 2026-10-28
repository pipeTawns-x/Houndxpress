# Hound Express: seguimiento de guías

Plataforma para registrar las guías de carga de Hound Express y asegurar que cada una avance por las cinco etapas del proceso, en el orden establecido. El backend es una API en Django; el frontend, una aplicación en React que vive en su propia rama (ver [Ramas](#ramas)).

**Estado actual: Fase 1 completa.** El backend ya guarda guías y un historial de etapas que no se edita ni se borra, con las reglas en el modelo y restricciones en la base de datos. La API de guías es la Fase 2; hoy el único endpoint es el de salud (`/api/v1/health/`).

## Estado por fase

| Fase | Alcance | Estado |
|---|---|---|
| 0 · base del proyecto | Proyecto Django con las apps `accounts`, `core` y `tracking`, modelo de usuario propio, punto de salud y CI | Hecha |
| 1 · base de datos | `Guide` y `StatusHistory` (historial de solo inserción) con restricciones en la base, departamento de cada usuario, panel de administración y guías de demostración | Hecha |
| 2 · API | Endpoints GET (estado actual de una guía), POST (registrar una guía) y PUT (actualizar el estatus) con validación del orden de etapas | Planeada |
| 3 · integración y despliegue | Frontend conectado a la API, documentación para ejecutar el proyecto y despliegue | Planeada |

## Qué contiene esta rama

Cada fila existe en el repositorio y se verifica en cada push con GitHub Actions.

| Capacidad | Evidencia |
|---|---|
| Proyecto Django con `manage.py` y las apps `accounts`, `core` y `tracking` | `INSTALLED_APPS` en [`backend/config/settings.py`](backend/config/settings.py) |
| Modelo de usuario propio, creado antes de la primera migración, con el departamento del personal | [`backend/accounts/models.py`](backend/accounts/models.py), [`backend/accounts/migrations/`](backend/accounts/migrations/) |
| Guías y historial de etapas de solo inserción, con restricciones en la base | [`backend/tracking/models.py`](backend/tracking/models.py), [`backend/tracking/migrations/`](backend/tracking/migrations/), [`backend/tracking/tests/test_models.py`](backend/tracking/tests/test_models.py) |
| Panel de administración de guías con el historial en solo lectura | [`backend/tracking/admin.py`](backend/tracking/admin.py) |
| API con Django REST Framework: punto de salud que consulta la base de datos | [`backend/core/views.py`](backend/core/views.py), [`backend/core/tests/test_health.py`](backend/core/tests/test_health.py) |
| Configuración por variables de entorno, sin secretos en el repositorio | [`backend/config/settings.py`](backend/config/settings.py), [`backend/core/tests/test_settings.py`](backend/core/tests/test_settings.py) |
| Dependencias con versiones fijas | [`backend/requirements.txt`](backend/requirements.txt), [`backend/uv.lock`](backend/uv.lock) |
| Lint y 108 pruebas automáticas en Linux (Python 3.10 y 3.12) y Windows | [`.github/workflows/ci.yml`](.github/workflows/ci.yml) |

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

En Windows, escribe `.venv\Scripts\python` en lugar de `.venv/bin/python`. Resultado esperado: `Ran 108 tests` seguido de `OK`, y luego `All checks passed!`.

Para el panel de administración, crea un usuario con `.venv/bin/python manage.py createsuperuser` y abre <http://127.0.0.1:8000/admin/>. Para cargar guías de demostración en la base local: `.venv/bin/python manage.py loaddata demo_guides`.

## Configuración

Todas las variables son opcionales en desarrollo: `DJANGO_DEBUG`, `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS` y `DJANGO_ENV_FILE`. Para cambiar alguna, defínela en el entorno o en el archivo privado `backend/.env`, que git ignora. Las notas sobre cada variable van como comentarios dentro de ese mismo archivo.

| Variable | Valor por defecto | Obligatoria cuando |
|---|---|---|
| `DJANGO_DEBUG` | `true` | nunca |
| `DJANGO_SECRET_KEY` | clave de desarrollo marcada como insegura | `DJANGO_DEBUG=false` |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1,[::1]` | `DJANGO_DEBUG=false` |
| `DJANGO_ENV_FILE` | `backend/.env` | nunca |

Con `DJANGO_DEBUG=false` el proyecto no arranca si falta alguna de las dos últimas, y rechaza claves que empiecen con `django-insecure`. `DJANGO_ENV_FILE` cambia la ruta del archivo de variables; apuntarla a un archivo que no existe hace que las pruebas ignoren el `.env` local. La base de datos es SQLite (`backend/db.sqlite3`, creada por `migrate`).

## Seguridad

- **Sesión por defecto:** todo endpoint exige sesión (`IsAuthenticated`), salvo `GET /api/v1/health/`. Una vista nueva hereda esa regla; abrirla al público es una decisión explícita.
- **Contraseñas:** mínimo de 12 caracteres y rechazo de contraseñas comunes (OWASP ASVS 5.0, sección 6.2).
- **Producción:** con `DJANGO_DEBUG=false` se exigen clave secreta y hosts permitidos, y se activan redirección a HTTPS, HSTS de un año y cookies seguras con prefijo `__Host-`. Con esos valores, `manage.py check --deploy` no reporta avisos.
- **Datos:** el historial de etapas es de solo inserción y la etapa de una guía solo avanza a la siguiente; ambas reglas se aplican en el modelo, y la base añade restricciones sobre el formato del número de guía y los valores de la etapa. El SQL directo salta las validaciones del modelo; cerrarlo con permisos por rol está previsto para la Fase 3.
- **Dependencias:** los plazos para corregir componentes vulnerables y las reglas de autorización vigentes están en [`SECURITY.md`](SECURITY.md).

## Diagramas

Los cuatro diagramas son interactivos (archivos HTML autónomos) y se generan con [Archify](https://github.com/tt-a1i/archify). Aquí se muestran sus vistas previas; el detalle, los patrones con `archivo:línea` y cómo regenerarlos están en [`docs/diagramas/`](docs/diagramas/README.md).

**Arquitectura** ([`arquitectura.html`](docs/diagramas/arquitectura.html))

![Arquitectura de Hound Express](docs/diagramas/img/arquitectura.png)

**Modelo de datos** ([`modelo-de-datos.html`](docs/diagramas/modelo-de-datos.html))

![Modelo de datos de Hound Express](docs/diagramas/img/modelo-de-datos.png)

**Ciclo de vida de una guía** ([`ciclo-de-vida-guia.html`](docs/diagramas/ciclo-de-vida-guia.html))

![Ciclo de vida de una guía](docs/diagramas/img/ciclo-de-vida-guia.png)

**Secuencia de consultas** ([`secuencia-consultas.html`](docs/diagramas/secuencia-consultas.html))

![Secuencia de consultas del frontend](docs/diagramas/img/secuencia-consultas.png)

## Estructura del repositorio

```text
Houndxpress/
├── .github/workflows/ci.yml   # Lint, pruebas y los comandos de este README en cada push
├── AGENTS.md, CLAUDE.md       # Contexto del proyecto para agentes de IA
├── SECURITY.md                # Plazos de corrección y reglas de autorización
├── docs/
│   ├── STACK_HOUND_EXPRESS.md # Decisiones técnicas y licencias de las dependencias
│   └── diagramas/             # Diagramas interactivos (HTML), sus fuentes y vistas previas
└── backend/                   # Proyecto Django: aquí vive manage.py
    ├── config/                # settings, urls, wsgi y asgi
    ├── accounts/              # Modelo de usuario del sistema y su departamento
    ├── core/                  # Plataforma: punto de salud /api/v1/health/
    ├── tracking/              # Dominio de guías: Guide, StatusHistory, admin y datos de demostración
    ├── requirements.txt       # Dependencias de ejecución con versiones fijas
    ├── requirements-dev.txt   # Lo anterior más herramientas de desarrollo (ruff)
    └── pyproject.toml         # Declaración de dependencias; uv.lock fija el árbol completo
```

## Ramas

| Rama | Rol |
|---|---|
| `main` | Versión integrada y más completa del producto. Solo recibe cambios por PR desde `pruebas`. |
| `pruebas` | Integración: la suite completa y el CI en verde antes de pasar a `main`. |
| `backend` | La API en Django: modelos, reglas de etapas y, después, los endpoints. |
| `frontend` | La aplicación en React: sitio público, rastreo y panel de operaciones. |

El flujo es `backend` y `frontend` → PR a `pruebas` → PR de `pruebas` a `main`.

## Contexto del negocio

Hound Express es una empresa de mensajería dedicada a la importación en comercio electrónico, con entregas a nivel local e internacional. Cada guía debe registrar su estatus en este orden, y cada etapa tiene un departamento responsable:

| Orden | Etapa | Responsable |
|---|---|---|
| 1 | Recepción de carga | Aduana |
| 2 | Vehículo cargado | Aduana |
| 3 | Vehículo liberado | Operaciones |
| 4 | Vehículo en camino | Seguridad |
| 5 | Carga entregada | KAM |

Problemas que reporta la empresa:

- "Las guías de carga no siguen el proceso en el orden adecuado, saltando pasos para luego ponerlos con fechas posteriores."
- "El porcentaje de error es que de 100 guías solo el 31% siguen el proceso como debe ser y el otro 69% no lo sigue."
- "Pérdidas de 200k pesos MXN por sobrecostos y errores."
- "Se presentan errores humanos por sobrecarga."
- "No tienen datos para analizar y realizar históricos."

## Decisiones técnicas

El detalle está en [`docs/STACK_HOUND_EXPRESS.md`](docs/STACK_HOUND_EXPRESS.md). En resumen: Django 5.2 LTS con Django REST Framework; proyecto local con `manage.py` en lugar de una plantilla Docker de terceros; SQLite por ahora; modelo de usuario propio desde el inicio; ninguna dependencia con licencia copyleft. Los archivos `requirements*.txt` se generan desde `backend/uv.lock` y no se editan a mano; los comandos están en ese documento.

## Derechos de uso

Este repositorio no incluye una licencia de código abierto. El código se cederá a Hound Express y el aviso de licencia se agregará cuando se formalice esa cesión. Las licencias de las dependencias están en [`docs/STACK_HOUND_EXPRESS.md`](docs/STACK_HOUND_EXPRESS.md).

## Autor

Felipe ([@pipeTawns-x](https://github.com/pipeTawns-x)).
