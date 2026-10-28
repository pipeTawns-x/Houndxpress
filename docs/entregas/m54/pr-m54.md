# M54.2

Título: `M54.2: fecha de actualización del usuario y matriz de requisitos campo por campo`
PR: de `m54-2-entrega` a `practicas-ebac` (commit de `backend` aplicado con cherry-pick). Tag: `m54.2`

Completa la entidad `User` de la consigna y documenta cada ajuste frente a la consigna.

## Qué incluye

- `User.updated_at` (`DateTimeField(auto_now=True)`) con la migración `accounts/0003_user_updated_at`. La consigna pide `createdAt` y `updatedAt`: `AbstractUser` ya guarda `date_joined`, y faltaba la fecha de actualización.
- Una prueba que comprueba que el servidor asigna `updated_at` y que cambia en cada guardado. La suite pasa de 108 a 109 pruebas.
- `matriz-requisitos.md`, reescrita con la tabla campo por campo (consigna, implementación y motivo de cada ajuste) para `Guide`, `StatusHistory` y `User`.
- `tracking.sql` con el SQL de la migración nueva.

## Cómo probarlo

Desde `backend/`: `python manage.py migrate`, `python manage.py loaddata demo_guides` y `python manage.py test`. Resultado esperado: `Ran 109 tests` y `OK`.

# M54.1

Título: `M54.1: dependencias parcheadas y controles ASVS 5.0 nivel 1`
PR: de `m54-1-entrega` a `practicas-ebac` (commits de `backend` aplicados con cherry-pick, como en el PR #4). El número se asigna al abrirlo.
Commits: `f2fa222` · `6099863` · `db4125c` · `d5b3abc` · `3a750a6` · `c902416` · `60981a5` · `a0da889` · `79c1eb5` · `ec950c4` · Tag: `m54.1`

Actualiza dependencias con avisos de seguridad y cubre con pruebas los controles de OWASP ASVS 5.0 nivel 1. El modelo de datos y las migraciones no cambian desde M54.

## Qué incluye

- Dependencias: Django 5.2.18 y DRF 3.18.3 (`f2fa222`).
- Configuración según ASVS 5.0 nivel 1, con pruebas: HSTS, cookies `__Host-`, límite de peticiones, JSON en UTF-8 y política de contraseñas (`6099863`). El límite de peticiones identifica al cliente por `REMOTE_ADDR` (`c902416`).
- `SECURITY.md` con los plazos de parche y las reglas de autorización (`d5b3abc`).
- Frontend: vite 8.3.3, zod 4.6.7 y source-map-js 1.2.2, instalados con `--ignore-scripts` y con más de 3 días publicados (`ec950c4`). Riesgo aceptado: `deepmerge` 4.3.1, de severidad baja, sin versión corregida y usado solo por Jest.
- Checklist ASVS cruzado con los 20 controles del curso de hacking ético de Big School (`79c1eb5`).
- Se elimina `backend/.env.example` y `.gitignore` deja de permitirlo (`db4125c`, `3a750a6`, `a0da889`). `.gitignore` ignora llaves y secretos, y el README actualiza el conteo de pruebas (`60981a5`).

## Cómo probarlo

Desde `backend/`:

```bash
python manage.py migrate
python manage.py loaddata demo_guides
python manage.py test
```

Resultado esperado: `Ran 108 tests` y `OK`. Además: ruff limpio, `makemigrations` sin cambios pendientes, `check --deploy` con 0 avisos y OSV, gitleaks y semgrep con 0 hallazgos.

Desde `frontend/`: `npm ci --ignore-scripts` y `npm test`. Resultado esperado: 278 pruebas en 24 suites, con build, lint y typecheck en verde.

Entrega del LMS: Proyecto Empresa Aliada - M54 Entregable 10 (etiqueta `m54.1`).

# M54 (historial)

Implementa el módulo de tracking del M54 (`Guide` + `StatusHistory`) con historial de etapas inmutable y restricciones a nivel de base de datos.

PR: https://github.com/pipeTawns-x/Houndxpress/pull/4
Commits: merge `7a0f3924` · código M54 `b950efb` · Tag: `m54`

El PR #3 se cerró por conflictos y fue reemplazado por el PR #4.

## Qué incluye

- `tracking`: `Guide` y `StatusHistory`. Una guía solo avanza a la etapa siguiente (Recepción de carga → Vehículo cargado → Vehículo liberado → Vehículo en camino → Carga entregada) y el historial es de solo inserción.
- `accounts`: área del usuario (Aduana, Operaciones, Seguridad, KAM).
- Migraciones `tracking/0001_initial`, `tracking/0002_alter_guide_tracking_number`, `tracking/0003_guide_current_stage_valid` y `accounts/0002_user_department`.
- Fixture `demo_guides` con cuatro guías de demostración.

## Cómo probarlo

Desde `backend/`:

```bash
python manage.py migrate
python manage.py loaddata demo_guides
python manage.py test
```

Resultado esperado: `Ran 86 tests` y `OK`.

## Decisiones frente a la consigna del LMS

Llave primaria automática, fechas del servidor, contraseña cifrada en el `User` existente, número de guía de 22 caracteres, `ForeignKey` con `PROTECT` y `DateTimeField`. El detalle campo por campo está en `docs/entregas/m54/matriz-requisitos.md`.

Entrega del LMS: Proyecto Empresa Aliada - M54 Entregable 10 (etiqueta `m54`).
