# M54 · Matriz de requisitos

Entrega: "Proyecto Empresa Aliada - M54 Entregable 10" (generar las entidades de la base de datos), versión M54.2, etiqueta `m54.2`. El código está en `backend/`.

## Fuentes

- **Consigna:** lección "Proyecto Empresa Aliada - M54 Entregable 10" del LMS de EBAC (`lms.ebac.mx/lesson/fd172ab1-c112-4fd0-a0f1-8b73f5f28b05`). Los campos de cada entidad se tomaron de esa lección el 11 de octubre de 2026 y se citan abajo, antes de cada tabla.
- **Rúbrica:** documento oficial del proyecto Hound Express (`houndxpress.pdf`, diapositiva 22): tablas y migraciones, evaluadas por la calidad del producto y por las expectativas del cliente.

## 1. Campos de la consigna y su implementación

La consigna se cumple campo por campo. En siete puntos, la definición literal no funciona en Django o no cumple el propósito de la entidad. En esos casos se implementó el equivalente correcto y se explica el motivo.

### Guide (`backend/tracking/models.py:162-177`)

Campos que pide la consigna: `id`, `trackingNumber` (`CharField`, 15), `origin` (`CharField`, 100), `destination` (`CharField`, 100), `createdAt` (`DateField`, `default=timezone.now`), `updatedAt` (`AutoDateTimeField`) y `currentStatus` (`CharField`, 20).

| Consigna | Implementación | Motivo del ajuste |
|---|---|---|
| `id` (`IntegerField`) | `id` automático (`BigAutoField`) | Django exige que la llave primaria sea un campo autoincremental o marcado con `primary_key=True`; un `IntegerField` simple produce el error `models.E004`. |
| `trackingNumber` (`CharField(15)`) | `tracking_number`: `CharField(22)`, único, con validador en el modelo y restricción `CHECK` en la base | Los números de guía reales tienen 16 dígitos que empiezan con 21, o 22 caracteres alfanuméricos. En 15 caracteres no caben. |
| `origin` (`CharField(100)`) | `origin`: `CharField(100)` | Sin cambios. |
| `destination` (`CharField(100)`) | `destination`: `CharField(100)` | Sin cambios. |
| `createdAt` (`DateField`, `default=timezone.now`) | `created_at`: `DateTimeField(auto_now_add=True)` | La consigna habla de fecha y hora; un `DateField` pierde la hora. El servidor asigna el valor y el cliente no puede enviarlo. |
| `updatedAt` (`AutoDateTimeField`) | `updated_at`: `DateTimeField(auto_now=True)` | `AutoDateTimeField` no existe en Django. `auto_now` actualiza la fecha en cada guardado, que es lo que pide la consigna. |
| `currentStatus` (`CharField(20)`) | `current_stage`: `CharField(20)` con las cinco etapas como opciones y restricción `CHECK` | Solo acepta las cinco etapas válidas del proceso. |

Campos agregados por necesidad del negocio: `recipient` (destinatario), `service_level` (nivel de servicio) e `is_archived` (archivado lógico, para no borrar guías con historial).

### StatusHistory (`backend/tracking/models.py:326-341`)

Campos que pide la consigna: `id`, `guideId` (`IntegerField`, como llave foránea), `status` (`CharField`, 20), `timestamp` (`AutoDateTimeField`) y `updatedBy` (`CharField`, 20).

| Consigna | Implementación | Motivo del ajuste |
|---|---|---|
| `id` | `id` automático | El mismo motivo que en `Guide`. |
| `guideId` (`IntegerField` como llave foránea) | `guide`: `ForeignKey(Guide, on_delete=PROTECT)` | Un entero suelto no es una relación. La llave foránea real garantiza que la guía exista, y `PROTECT` impide borrar una guía que tiene historial. |
| `status` (`CharField(20)`) | `stage`: `CharField(20)` con las cinco etapas como opciones | Solo acepta etapas válidas. |
| `timestamp` (`AutoDateTimeField`) | `timestamp`: `DateTimeField(auto_now_add=True)` | Lo asigna el servidor al crear el registro, y el registro no se modifica después. |
| `updatedBy` (`CharField(20)`) | `updated_by`: `ForeignKey(User, on_delete=PROTECT)` | Apunta al usuario real que hizo el cambio, en lugar de un texto libre que se puede escribir mal. |

Campos agregados: `location` (ubicación) y `note` (nota). Restricción: una sola fila por etapa y por guía (`unique_stage_per_guide`, línea 341).

### User (`backend/accounts/models.py:14-24`)

Campos que pide la consigna: `id`, `name` (`CharField`, 50), `email` (`CharField`, 50), `password` (`CharField`, 20, "encriptada"), `createdAt` (`DateField`) y `updatedAt` (`AutoDateTimeField`).

Se reutiliza el usuario de Django (`AbstractUser`) en lugar de crear una segunda tabla de usuarios, porque ya resuelve la autenticación y el cifrado de contraseñas.

| Consigna | Implementación | Motivo del ajuste |
|---|---|---|
| `id` | `id` automático | El mismo motivo que en `Guide`. |
| `name` (`CharField(50)`) | `first_name` y `last_name` (150 caracteres cada uno), más `username` | Los campos estándar de Django. |
| `email` (`CharField(50)`) | `email` (`EmailField`) | Valida el formato del correo. |
| `password` (`CharField(20)`, "encriptada") | `password`: `CharField(128)` con hash PBKDF2 | Un hash ocupa más de 20 caracteres. En 20 solo cabría la contraseña en texto plano, que es lo que hay que evitar. |
| `createdAt` (`DateField`) | `date_joined` (`DateTimeField`) | Django ya registra la fecha y hora de alta. |
| `updatedAt` (`AutoDateTimeField`) | `updated_at`: `DateTimeField(auto_now=True)` | Agregado en M54.2, con su migración `accounts/0003_user_updated_at`. |

Campo agregado: `department` (área del personal: Aduana, Operaciones, Seguridad o KAM).

## 2. Reglas del negocio

Estas reglas resuelven el problema del caso Hound Express: solo 31 de cada 100 guías seguían el orden de etapas, y había pasos que se saltaban y se registraban después con fechas posteriores.

| Regla | Implementación | Evidencia |
|---|---|---|
| Las etapas avanzan solo en orden, sin saltos | `save_base` valida la etapa siguiente y bloquea la guía con `select_for_update` | `backend/tracking/models.py:354-376`; prueba `test_save_base_new_with_skipped_stage_raises_without_inserting` |
| Las fechas las pone el servidor | `auto_now_add` y `auto_now` en `Guide` y `StatusHistory`; `date_joined` y `updated_at` en `User` | Pruebas `test_created_and_updated_at_are_set_by_server` y `test_updated_at_is_set_by_server_and_moves_on_save` |
| El historial es inmutable | Los QuerySet bloquean `delete`, `update` y las inserciones masivas con conflictos | `backend/tracking/models.py:246-255`; pruebas `test_append_only_delete_raises` y `test_bulk_create_update_conflicts_is_rejected` |

## 3. Entregables y calidad

| Requisito | Evidencia |
|---|---|
| Scripts SQL o `models.py` | `backend/tracking/models.py`, `backend/accounts/models.py` y [`tracking.sql`](tracking.sql) |
| Tablas y migraciones | `tracking/0001` a `0003` y `accounts/0002` a `0003`; el CI comprueba que no queden migraciones pendientes |
| Pruebas | 109 pruebas en verde: 72 de `tracking`, 25 de `core` y 12 de `accounts` |
| Seguridad | Django 5.2.18 y DRF 3.18.3, sin vulnerabilidades conocidas; controles OWASP ASVS 5.0 nivel 1 en [`asvs-l1-checklist.md`](asvs-l1-checklist.md) |
| Configuración | Variables de entorno sin secretos en el repositorio; no hay archivos `.env` de ejemplo |
| Documentación | El README explica cómo instalar, probar y arrancar el proyecto; los diagramas están en [`docs/diagramas`](../../diagramas/README.md) |

## Cómo verificarlo

Desde `backend/`:

```bash
python manage.py migrate
python manage.py loaddata demo_guides
python manage.py test
```

Resultado esperado: `Ran 109 tests` y `OK`.
