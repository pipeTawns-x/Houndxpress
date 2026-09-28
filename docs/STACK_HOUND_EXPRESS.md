# Decisiones técnicas de Hound Express (M52)

Este documento registra las decisiones que ya están en el código de la etiqueta `m52`. Las decisiones de dominio (tablas, historial de etapas, reglas de avance) se documentarán en `docs/DECISIONS.md` al iniciar M54, antes de crear la primera tabla.

## Resumen

| Tema | Decisión | Motivo |
|---|---|---|
| Framework | Django 5.2 LTS con Django REST Framework 3.18 | Tiene soporte de seguridad hasta abril de 2028 y funciona con Python 3.10 a 3.14. Django 6.x exige Python 3.12 o superior. |
| Forma del proyecto | Proyecto local con `manage.py`, en lugar de la plantilla Docker `nickjj/docker-django-example` | La lección permite ambas rutas. La plantilla usa Django 6.1 y Python 3.14, requiere Docker e incluye PostgreSQL, Redis, Celery, esbuild y Tailwind, que este proyecto no necesita. Además, su aviso de licencia MIT quedaría dentro de un código que se cederá a Hound Express. |
| Dependencias | `pyproject.toml` y `uv.lock` como fuente; `requirements.txt` y `requirements-dev.txt` exportados y versionados | La ruta del programa es pip con entorno virtual. La exportación de uv conserva los marcadores de plataforma (`typing-extensions` solo en Python anterior a 3.11, `tzdata` solo en Windows); `pip freeze` los pierde. |
| Base de datos | SQLite con `transaction_mode = IMMEDIATE` | No requiere configuración para clonar y ejecutar. `IMMEDIATE` toma el bloqueo de escritura al iniciar cada transacción, así que una segunda escritura simultánea espera su turno en lugar de fallar. PostgreSQL está planeado para M54. |
| Configuración | Variables de entorno con valores de desarrollo por defecto | El proyecto corre sin `.env`. Con `DJANGO_DEBUG=false` exige `DJANGO_SECRET_KEY` y `DJANGO_ALLOWED_HOSTS`, rechaza claves que empiecen con `django-insecure` y activa cookies seguras y redirección a HTTPS. HSTS y la revisión `check --deploy` llegarán con el primer despliegue (M66). |
| Usuarios | Modelo propio `accounts.User`, que hereda de `AbstractUser` | La documentación de Django 5.2 indica que el modelo de usuario se define antes de crear migraciones o de ejecutar `migrate` por primera vez; cambiarlo después obliga a corregir el esquema a mano. En M54 guardará el departamento de cada usuario. |
| API | Autenticación por sesión e `IsAuthenticated` por defecto | Todo endpoint exige sesión salvo que se declare público. Hoy el único público es `GET /api/v1/health/`. La autenticación por token llegará con los endpoints de guías (M64). |
| Zona horaria | `USE_TZ = True` y `TIME_ZONE = "UTC"` | Con `USE_TZ` activo, las fechas siempre se guardan en UTC; `TIME_ZONE` solo define la zona de visualización por defecto. UTC es neutral para sitios a ambos lados de la frontera, que siguen reglas de horario de verano distintas. |
| Flujo de etapas | Sin librería de máquina de estados | `django-viewflow` tiene licencia AGPLv3+ (copyleft) y `django-fsm` está marcado como inactivo. El flujo es lineal: la única etapa válida es la siguiente. |
| Idioma | Código e identificadores en inglés; documentación y textos para usuarios en español | El código sigue la convención de la industria. El equipo de Hound Express y el tutor leen español. |

## Licencias de las dependencias

Ninguna dependencia es copyleft. El repositorio no incluye licencia propia hasta que se formalice la cesión a Hound Express.

| Paquete | Licencia | Uso |
|---|---|---|
| Django | BSD-3-Clause | ejecución |
| djangorestframework | BSD-3-Clause | ejecución |
| python-dotenv | BSD-3-Clause | ejecución |
| asgiref | BSD-3-Clause | ejecución (dependencia de Django) |
| sqlparse | BSD | ejecución (dependencia de Django) |
| typing-extensions | PSF-2.0 | ejecución, solo Python anterior a 3.11 |
| tzdata | Apache-2.0 | ejecución, solo Windows |
| ruff | MIT | desarrollo |

Cada dependencia nueva se revisa en PyPI y se agrega a esta tabla en el mismo commit. No se aceptan licencias AGPL ni GPL.

## Regenerar `requirements*.txt`

No se editan a mano. Después de cambiar `pyproject.toml`, dentro de `backend/`:

```bash
uv lock
uv export --frozen --no-hashes --no-dev --no-emit-project -o requirements.txt
uv export --frozen --no-hashes --all-groups --no-emit-project -o requirements-dev.txt
```

## Fuentes

- Versiones de Django y fechas de soporte: https://www.djangoproject.com/download/
- Modelo de usuario propio: https://docs.djangoproject.com/en/5.2/topics/auth/customizing/#using-a-custom-user-model-when-starting-a-project
- Transacciones en SQLite: https://docs.djangoproject.com/en/5.2/ref/databases/#sqlite-transaction-behavior
- Zonas horarias: https://docs.djangoproject.com/en/5.2/topics/i18n/timezones/
- Paquetes y licencias: https://pypi.org/project/Django/ , https://pypi.org/project/djangorestframework/ , https://pypi.org/project/django-viewflow/ , https://pypi.org/project/django-fsm/
- Plantilla Docker del curso: https://github.com/nickjj/docker-django-example
