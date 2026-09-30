# Decisiones técnicas de Hound Express

Este documento registra las decisiones que están en el código. El resumen y la tabla del backend corresponden a la etiqueta `m52`; la sección [Después de M52](#después-de-m52-frontend-docker-y-diagramas) agrega el frontend, Docker y los diagramas. Las decisiones de dominio (tablas, historial de etapas, reglas de avance) se documentarán en `docs/DECISIONS.md` al iniciar M54, antes de crear la primera tabla.

## Resumen

| Tema | Decisión | Motivo |
|---|---|---|
| Framework | Django 5.2 LTS con Django REST Framework 3.18 | Tiene soporte de seguridad hasta abril de 2028 y funciona con Python 3.10 a 3.14. Django 6.x exige Python 3.12 o superior. |
| Forma del proyecto | Proyecto local con `manage.py`, en lugar de la plantilla Docker `nickjj/docker-django-example` | La lección permite ambas rutas. La plantilla usa Django 6.1 y Python 3.14, requiere Docker e incluye PostgreSQL, Redis, Celery, esbuild y Tailwind, que este proyecto no necesita. Además, el template conserva el aviso de licencia MIT de su autor original, lo que complica la cesión limpia del código a Hound Express. |
| Dependencias | `pyproject.toml` y `uv.lock` como fuente; `requirements.txt` y `requirements-dev.txt` exportados y versionados | La ruta del programa es pip con entorno virtual. La exportación de uv conserva los marcadores de plataforma (`typing-extensions` solo en Python anterior a 3.11, `tzdata` solo en Windows); `pip freeze` los pierde. |
| Base de datos | SQLite con `transaction_mode = IMMEDIATE` | No requiere configuración para clonar y ejecutar. `IMMEDIATE` toma el bloqueo de escritura al iniciar cada transacción, así que una segunda escritura simultánea espera su turno en lugar de fallar. PostgreSQL se evaluará en M54. |
| Configuración | Variables de entorno con valores de desarrollo por defecto | El proyecto corre sin `.env`. Con `DJANGO_DEBUG=false` exige `DJANGO_SECRET_KEY` y `DJANGO_ALLOWED_HOSTS`, rechaza claves que empiecen con `django-insecure` y activa cookies seguras y redirección a HTTPS. HSTS y la revisión `check --deploy` llegarán con el primer despliegue (M66). |
| Usuarios | Modelo propio `accounts.User`, que hereda de `AbstractUser` | La documentación de Django 5.2 indica que el modelo de usuario se define antes de crear migraciones o de ejecutar `migrate` por primera vez; cambiarlo después obliga a corregir el esquema a mano. En M54 guardará el departamento de cada usuario. |
| API | Autenticación por sesión e `IsAuthenticated` por defecto | Todo endpoint exige sesión salvo que se declare público. Hoy el único público es `GET /api/v1/health/`. La autenticación por token llegará con los endpoints de guías (M64). |
| Zona horaria | `USE_TZ = True` y `TIME_ZONE = "UTC"` | Con `USE_TZ` activo, las fechas siempre se guardan en UTC; `TIME_ZONE` solo define la zona de visualización por defecto. UTC es neutral para sitios a ambos lados de la frontera, que siguen reglas de horario de verano distintas. |
| Flujo de etapas | Sin librería de máquina de estados | `django-viewflow` tiene licencia AGPLv3+ (copyleft) y `django-fsm` está marcado como inactivo. El flujo es lineal: la única etapa válida es la siguiente. |
| Idioma | Código e identificadores en inglés; documentación y textos para usuarios en español | El código sigue la convención de la industria. El equipo de Hound Express y el tutor leen español. |

## Después de M52: frontend, Docker y diagramas

Estas decisiones llegaron después de la etiqueta `m52` y no cambian el backend. El razonamiento completo, con las objeciones del abogado del diablo, está en [`docs/diseno/03-arquitecto.md`](diseno/03-arquitecto.md).

| Tema | Decisión | Motivo |
|---|---|---|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS 4 en `frontend/` | React es lo que enseña el módulo de front-end del programa. La API de DRF necesita un cliente, y una SPA la consume sin plantillas de Django. |
| Datos del frontend | Interfaz `GuideRepository` con una implementación de demostración (`localStorage`) y una HTTP para M64 | Las tablas de guías llegan en M54 y los endpoints en M64. La interfaz se puede probar hoy sin fingir que el backend ya lo hace. |
| Estado de la API | El frontend consulta `GET /api/v1/health/` de verdad | Es el único endpoint que existe; demuestra la integración sin inventar otros. |
| Mismo origen | Vite (desarrollo) y nginx (Docker) reenvían `/api`, `/admin` y `/static` a Django | Sin CORS ni paquetes extra en el backend. |
| Docker | `docker-compose.yml` propio con dos servicios: `backend` (Python 3.12 slim, usuario sin privilegios, `runserver`) y `frontend` (compilación con Node 22, servida por nginx) | Levanta todo con un comando sin instalar Python ni Node. No reemplaza la ruta local: la plantilla del curso se descartó por sus servicios extra y su licencia, no por usar Docker. Es un entorno de desarrollo: la base SQLite vive dentro del contenedor y se pierde con `docker compose down`. |
| Diagramas | Skill Archify 3.0.1 en `.claude/skills/archify/` | Diagramas interactivos validados en un navegador real, generados desde JSON versionado. Es herramienta de documentación, no parte del producto. |

## Licencias de las dependencias

Ninguna dependencia que llega al producto es copyleft (la única excepción de desarrollo está explicada en la sección del frontend). El repositorio no incluye licencia propia hasta que se formalice la cesión a Hound Express.

### Backend (Python)

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

### Frontend (npm)

Versiones de `frontend/package-lock.json`; licencia leída del `package.json` de cada paquete instalado.

| Paquete | Versión | Licencia | Uso |
|---|---|---|---|
| react, react-dom | 19.3.0 | MIT | ejecución |
| react-router | 7.18.4 | MIT | ejecución |
| lucide-react | 1.49.0 | ISC | ejecución |
| @fontsource-variable/inter, @fontsource-variable/plus-jakarta-sans | 5.3.0 | OFL-1.1 | ejecución (tipografías autoalojadas) |
| vite, @vitejs/plugin-react | 8.3.1, 6.1.1 | MIT | desarrollo |
| tailwindcss, @tailwindcss/vite | 4.3.3 | MIT | desarrollo |
| typescript | 6.0.3 | Apache-2.0 | desarrollo |
| vitest, jsdom | 4.1.11, 29.1.1 | MIT | desarrollo |
| @testing-library/react, dom, user-event, jest-dom | 16.3.3, 10.4.2, 14.6.7, 6.9.1 | MIT | desarrollo |
| eslint, @eslint/js, typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals | 10.11.0, 10.0.1, 8.71.0, 7.1.1, 0.5.7, 17.12.0 | MIT | desarrollo |
| @types/react, @types/react-dom, @types/node | 19.3.0, 19.3.0, 22.20.4 | MIT | desarrollo |

Árbol completo del lockfile: MIT, Apache-2.0, ISC, BSD, BlueOak, CC0 y MIT-0, más dos casos que se aceptan por ser solo de compilación y no llegar al código servido:

- `lightningcss` (MPL-2.0), que Tailwind y Vite usan para procesar CSS. MPL-2.0 es copyleft débil por archivo: obliga a compartir cambios a los archivos de lightningcss, no al código que lo usa, y este proyecto no los modifica.
- `caniuse-lite` (CC-BY-4.0), la tabla de compatibilidad de navegadores.

Algunas versiones están fijadas por debajo de la última para cumplir `engines: node >=20.19`: react-router 8, `@testing-library/jest-dom` 6.10 y las versiones siguientes de Vitest y jsdom exigen Node 22. TypeScript queda en 6.0 porque `typescript-eslint` 8.71 no admite la 7. El detalle está en [`frontend/README.md`](../frontend/README.md#notas-de-mantenimiento).

### Herramientas del repositorio

| Herramienta | Versión | Licencia | Uso |
|---|---|---|---|
| Archify (`.claude/skills/archify/`) | 3.0.1 | MIT (Copyright tt-a1i y Cocoon AI) | Genera los diagramas de `docs/diagramas/`. Los HTML generados incluyen el visor de Archify (MIT) y la tipografía JetBrains Mono (OFL-1.1, con su licencia dentro del archivo). Son documentación, no parte del producto. |
| Imágenes base de Docker | `python:3.12-slim`, `node:22-alpine`, `nginx:1.29-alpine` | Las de cada proyecto (PSF, MIT, BSD-2-Clause) | Solo para `docker compose`; no se distribuyen en el repositorio. |

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
