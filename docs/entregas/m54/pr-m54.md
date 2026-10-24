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
