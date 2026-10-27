# M54.1 · Matriz de requisitos

## Fuentes

- **Consigna de la lección M54:** Engram #850, capturada del LMS el 2026-10-11 (`lms.ebac.mx/lesson/fd172ab1-…`). La relectura con `ebac-lms-reader` queda pendiente: el LMS pide iniciar sesión.
- **Contexto de la práctica:** Engram #851.
- **Rúbrica:** Engram #723 (`houndxpress.pdf`, diapositiva 22).
- **Código:** rama `backend`, commit `0fc74ad`.

La columna de REA se completa en la etapa 1 (`docs/investigacion/rea-sitio-actual.md`).

## Matriz

| # | Requisito (fuente) | Implementación | Evidencia | Estado | Lo que ya tiene Hound (REA) |
|---|---|---|---|---|---|
| R1 | `Guide` con id, número de guía, origen, destino, fechas y estado actual (#850) | `id` automático; `tracking_number` de 22 caracteres, único, con validador y restricción en la base; `origin` y `destination` de 100; fechas `DateTimeField`; `current_stage` con `TextChoices` | `tracking/models.py:163-177`, `:185-189` | Cumple, con las 6 correcciones a la consigna documentadas en el docstring | Etapa 1 |
| R2 | `StatusHistory` con guía, estado, fecha y usuario (#850) | `ForeignKey` con `PROTECT` a la guía y al usuario; una fila por etapa | `tracking/models.py:327`, `:330-331`, `:341` | Cumple | Etapa 1 |
| R3 | `User` con contraseña cifrada (#850) | Se reutiliza `accounts.User(AbstractUser)` (hash PBKDF2) y se agrega el campo `department` | `accounts/models.py:14`, `:22` | Cumple | — |
| R4 | Entregar scripts SQL o `models.py` (#850) | `models.py` y `docs/entregas/m54/tracking.sql` | Etiqueta `m54` | Cumple | — |
| R5 | Tablas y migraciones (#723) | `tracking/0001`-`0003` y `accounts/0002`; `makemigrations --check` en el CI | `.github/workflows/ci.yml:42` | Cumple | — |
| R6 | Etapas en orden, sin saltos ("saltando pasos para luego ponerlos con fechas posteriores", #851) | `save_base` valida la etapa siguiente con `select_for_update` | `tracking/models.py:354-376`; `tracking/tests/test_models.py:358` | Cumple | Etapa 1 (`cPaso`) |
| R7 | Fechas puestas por el servidor (#851) | `auto_now_add` y `auto_now` | `tracking/models.py:176-177`; `tracking/tests/test_models.py:307` | Cumple | — |
| R8 | Historial inmutable (#851) | El QuerySet bloquea `delete`, `update` y `bulk_create` con conflictos | `tracking/models.py:246-255`; `tracking/tests/test_models.py:125-200`, `:366` | Cumple | — |
| R9 | Calidad de producto y expectativas del cliente (#723) | 86 pruebas: 72 de `tracking`, 6 de `health`, 5 de `settings` y 3 de `accounts`; ruff; CI | `rg -c 'def test_'` por archivo | Cumple; mejora con R10 | — |
| R10 | Componentes sin vulnerabilidades conocidas (ASVS 15.2.1; #1154) | Django 5.2.17 y DRF 3.18.1 | `backend/requirements.txt:5,9` | **No cumple** → T5 (bump) | — |
| R11 | El README explica cómo arrancar cada parte (sugerencia del tutor de M52, #850) | README del backend | `README.md` | Cumple; T6 ajusta los pasos | — |
| R12 | Sin `.env.example` (regla global §4) | `backend/.env.example` está versionado | `README.md:19,81,106` | **No cumple** → T6 | — |

## Fuera del alcance de la M54, pero ya previsto

Para M64, la enumeración por ID secuencial y el borrado frente al historial inmutable (#851). Están cubiertos en `asvs-l1-checklist.md` (8.2.2).
