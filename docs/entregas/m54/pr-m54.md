# M54.1

Título: `M54.1: dependencias parcheadas y controles ASVS 5.0 nivel 1`
PR: de `backend` a `practicas-ebac`. El número se asigna al abrirlo.
Commits: `edc8fc4` · `3e08281` · `9b334c0` · `f77c825` · `a50b656` · `40972dd` · `aed7967` · Tag: `m54.1`

Actualiza dependencias con avisos de seguridad y cubre con pruebas los controles de OWASP ASVS 5.0 nivel 1. El modelo de datos y las migraciones no cambian desde M54.

## Qué incluye

- Dependencias: Django 5.2.18 y DRF 3.18.3 (`edc8fc4`).
- Configuración según ASVS 5.0 nivel 1, con pruebas: HSTS, cookies `__Host-`, límite de peticiones, JSON en UTF-8 y política de contraseñas (`3e08281`). El límite de peticiones identifica al cliente por `REMOTE_ADDR` (`40972dd`).
- `SECURITY.md` con los plazos de parche y las reglas de autorización (`f77c825`).
- Se elimina `backend/.env.example` y `.gitignore` deja de permitirlo (`9b334c0`, `a50b656`). `.gitignore` ignora llaves y secretos, y el README actualiza el conteo de pruebas (`aed7967`).

## Cómo probarlo

Desde `backend/`:

```bash
python manage.py migrate
python manage.py loaddata demo_guides
python manage.py test
```

Resultado esperado: `Ran 108 tests` y `OK`. Además: ruff limpio, `makemigrations` sin cambios pendientes, `check --deploy` con 0 avisos y OSV, gitleaks y semgrep con 0 hallazgos.

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

Llave primaria automática, fechas del servidor, contraseña cifrada en el `User` existente, número de guía de 22 caracteres, `ForeignKey` con `PROTECT` y `DateTimeField`. El detalle está en el docstring de `backend/tracking/models.py`.

Entrega del LMS: Proyecto Empresa Aliada - M54 Entregable 10 (etiqueta `m54`).
