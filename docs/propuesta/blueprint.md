# Hound Express · Blueprint de M64 y M66

| Campo | Valor |
|---|---|
| Fecha | 2026-10-27 |
| Feature | `odd/tasks/contexto-rea-hound.md`, tarea T4, spec S3 |
| Método | Skill `the-architect` en modo *brownfield*, archivo único (`commands/architect-brownfield.md` del repositorio `Hainrixz/the-architect`): las 20 secciones del template, con "NO APLICA" donde no hay contenido |
| Base | Rama `backend`, commit `aed7967` (M54.1). Cada `archivo:línea` de la columna "construido" se comprobó con `git show aed7967:<ruta>` |
| Entradas | [`README.md`](README.md) (propuesta v2), [`abogado-del-diablo.md`](abogado-del-diablo.md), `docs/investigacion/rea-sitio-actual.md`, `docs/entregas/m54/matriz-requisitos.md`, `docs/entregas/m54/asvs-l1-checklist.md` y Engram #851, #1075 y #1076 |
| No hace | No escribe código. Las decisiones que los documentos no resuelven van a §20, "Decisiones de Eduardo" |

## Entrevista respondida con los documentos

El arquitecto entrevista antes de diseñar. Aquí no se preguntó a nadie: cada respuesta sale de un documento.

| Pregunta del arquitecto | Respuesta | Fuente |
|---|---|---|
| ¿Proyecto nuevo o código existente? | Existente: backend Django con M52 y M54 entregadas | `aed7967` |
| ¿Qué debe ser cierto después que no lo es ahora? | Endpoints de guías con validación del orden de etapas (M64); frontend integrado con contadores y una URL publicada (M66) | #851 |
| ¿Qué debe seguir funcionando igual? | `GET /api/v1/health/`, las invariantes de M54, las 108 pruebas, las etiquetas `m52` y `m54` | `matriz-requisitos.md`, L13 |
| ¿Qué está prohibido tocar? | Los modelos de M54 salvo bloqueo demostrado; el sitio vivo y las APIs de Hound; `.env`; push y PR sin Eduardo | Feature S1, reglas globales §4 y §5 |
| ¿Prototipo o producción? | Demostración evaluada en vivo durante 5 días hábiles: necesita el endurecimiento de producción | #851 |
| ¿Restricciones duras? | Python y Django, PostgreSQL decidido, Sass con BEM, Redux y Jest en el frontend, sin AGPL ni GPL | `CLAUDE.md`, `STACK_HOUND_EXPRESS.md`, README v2 §19.1 |
| ¿Forma del proyecto? | `api-backend` más `internal-tool` (panel) y página pública de rastreo | Fases 1 y 2 del arquitecto |

---

## 1. Visión general y no objetivos

### Estado actual (mapa del repositorio)

| Qué | Valor |
|---|---|
| Runtime | Python ≥ 3.10 (`pyproject.toml`), Django 5.2.18 y DRF 3.18.3 fijados en `uv.lock`; `python-dotenv` 1.2.3 |
| Topología | `config` (settings, urls, renderers), `core` (salud), `accounts` (usuario), `tracking` (guías e historial) |
| Datos | SQLite con `transaction_mode: IMMEDIATE` (`settings.py:126-133`); migraciones `tracking/0001-0003` y `accounts/0001-0002` |
| Pruebas | `python manage.py test` (`ci.yml:44`): 108 pruebas, 72 de ellas en `tracking/tests/test_models.py` |
| Lint | `ruff check` y `ruff format --check` (`ci.yml:39-40`) |
| CI | GitHub Actions: Linux y Windows, más los bloques del README en bash y PowerShell |
| Despliegue | Ninguno. `docker compose` existe en `practicas-ebac` con nginx en `:8080` |
| Convenciones | Seguro por defecto (`IsAuthenticated`, `settings.py:173`); invariantes en el modelo; docstrings y mensajes en español, identificadores en inglés; prueba en rojo antes del cambio |

### Estado objetivo

- `tracking/services.py` concentra los casos de uso; las vistas no tocan los modelos directamente.
- La API de M64 cumple las rutas del LMS sin exponer el `id` interno.
- El rastreo público devuelve datos mínimos y consume el límite por guía.
- M66 corre sobre PostgreSQL con roles separados, caché compartida, `NUM_PROXIES` real, freno de fuerza bruta en el admin y una prueba de concurrencia en CI.

### No objetivos e interfaces que no se mueven

| Interfaz | Por qué no se mueve |
|---|---|
| `GET /api/v1/health/` y su respuesta `{"status","database"}` | Lo usan el frontend y el CI (`ci.yml:73`) |
| Las 5 etapas y sus códigos (`models.py:41-46`) | Requisito del PDF y contrato del frontend |
| `tracking_number` de 22 caracteres con su formato (`models.py:34-38`, `:163-165`) | Decisión D3, ya entregada |
| Solo inserción en `StatusHistory` | Requisito de M54 |
| Seguro por defecto en DRF | ASVS 8.1.1; `SECURITY.md` |
| Integración con Sabueso, pagos, WhatsApp, asistente X1 | Fuera de M64 y M66 (README v2 §5.5 y §10) |

---

## 2. Stack

| Capa | Elección | Estado |
|---|---|---|
| Lenguaje | Python ≥ 3.10 | Fijo |
| Framework | Django 5.2.18 LTS + DRF 3.18.3 | Fijo en `uv.lock` |
| Base | SQLite hasta M64; PostgreSQL en M66 | PostgreSQL decidido por Eduardo |
| Controlador | `psycopg` (LGPL-3.0) | M66; revisar licencia en `STACK_HOUND_EXPRESS.md` |
| Caché de límites | `DatabaseCache` de Django | Recomendado: sin dependencia nueva (E11) |
| Freno del admin | Según E1 | Decisión de Eduardo |
| Frontend | React 19, TypeScript, Redux Toolkit, Sass BEM, Jest; Axios en M66 | Requisito EBAC |

---

## 3. Estructura de directorios

### Delta

| Archivo | Acción | Cuándo |
|---|---|---|
| `backend/tracking/services.py` | Nuevo: `create_guide`, `advance_guide`, `archive_guide` | M64 |
| `backend/tracking/api/serializers.py` | Nuevo: serializer de personal y serializer público mínimo | M64 |
| `backend/tracking/api/views.py` | Nuevo: `GuideViewSet` y `PublicTrackView` | M64 |
| `backend/tracking/api/throttles.py` | Nuevo: límite por guía | M64 |
| `backend/tracking/api/urls.py` y `backend/config/urls.py` | Rutas del producto y alias del LMS | M64 |
| `backend/tracking/values.py` | Nuevo: `TrackingNumber` (normaliza y valida) | M64 |
| `backend/tracking/models.py` | `StageTransitionAttempt`, `StatusHistory.department`, restricción de `service_level` y orden por `pk` | M64, con migraciones `0004` en adelante |
| `backend/accounts/api/` | Login, logout, `me` y `csrf` | M64 |
| `backend/config/settings.py` | PostgreSQL, `CACHES`, `NUM_PROXIES`, `CONN_MAX_AGE` y freno del admin | M66 |
| `.github/workflows/ci.yml` | Servicio PostgreSQL, `check --deploy`, OSV y gitleaks | M66, con E9 |
| `frontend/src/services/httpRepository.ts` | Axios y token CSRF desde `/api/v1/auth/csrf/` | M66 |
| `frontend/nginx.conf` | CSP y `X-Forwarded-For` acorde con `NUM_PROXIES` | M66 |

### Patrones: dónde están y dónde irán

Método de Engram #809 y #810: cada patrón lleva una etiqueta honesta (existe en el código, lo da el framework, analogía o propuesta). Catálogo de refactoring.guru (#1075); se cita, nunca se copia.

**Construidos (comprobados en `aed7967`):**

| Patrón | Etiqueta | Dónde | Qué resuelve |
|---|---|---|---|
| State, forma simple | Existe | `models.py:41-46` (`Stage`), `:59-67` (`_validate_stage_transition`), `:93-108` (`_advance_current_stage`) | Máquina de estados lineal: solo la etapa siguiente es válida |
| Compare-and-set (no GoF; PoEAA lo llama bloqueo optimista) | Existe | `models.py:97-104` (UPDATE con `current_stage=expected_stage`) | Dos escritores no avanzan la misma etapa |
| Bloqueo pesimista (no GoF; PoEAA) | Existe | `models.py:216-223`, `:276-281`, `:375-376` (`select_for_update`) | Serializa las escrituras por guía en PostgreSQL |
| Proxy de protección | **Analogía** | `models.py:111-124` (`GuideQuerySet.update`), `:243-253` (`StatusHistoryQuerySet`) | Controla escrituras por herencia, no con un intermediario (C04) |
| Template Method | Framework | `models.py:198` y `:354` (`save_base` sobrescrito); `admin.py:13-20` y `:55-62` (`has_*_permission`) | Django define el algoritmo; el proyecto sobrescribe pasos |
| Strategy | Framework | `settings.py:176-179` (renderers), `:184-187` (throttles); `config/renderers.py:6-15` | DRF elige la implementación por configuración y negociación |
| Chain of Responsibility | Framework | `settings.py:95-103` (`MIDDLEWARE`) | Cada middleware atiende o pasa la petición |
| Manager y QuerySet | Framework (Fowler, no GoF) | `models.py:179`, `:336` | Hace de Repository; no se agrega otra capa |

**Planeados:**

| Patrón | Etiqueta | Dónde irá | Cuándo entra |
|---|---|---|---|
| Facade | Propuesta | `tracking/services.py` | M64: las vistas solo llaman al servicio |
| Command | Propuesta | `advance_guide` como orden auditable; `StageTransitionAttempt` guarda las rechazadas | M64 |
| Value Object (DDD, no GoF) | Propuesta | `tracking/values.py` (`TrackingNumber`: `strip`, `upper`, formato) | M64; nodo `value-objects` de roadmap.sh |
| Observer | Propuesta | Avisos al registrar una etapa | Ola 3. **Ojo:** `bulk_create` no emite `post_save`, y `StatusHistoryQuerySet.bulk_create` (`models.py:255-323`) es una ruta válida de inserción. El aviso sale del servicio, no de una señal |
| Adapter | Propuesta | `TrackingProvider` para Sabueso | Ola 3 (#1076) |
| Strategy | Propuesta | Elección de proveedor (demostración o real) y cotizador por `ServiceLevel` (`models.py:49-51`) | Ola 3 |
| Mediator | Propuesta | Rastreo múltiple en React | M66, si los componentes lo piden |
| Chain of Responsibility | Propuesta | Validaciones antifraude encadenadas | Solo si crecen las reglas |
| State completo | Propuesta | Una clase por etapa | Solo si una etapa gana comportamiento propio (C30) |
| Repository | No aplicar | — | El ORM ya lo cubre |

Diagramas con estas etiquetas: [`docs/diagramas/modelo-de-datos.html`](../diagramas/modelo-de-datos.html) y [`docs/diagramas/ciclo-de-vida-guia.html`](../diagramas/ciclo-de-vida-guia.html).

---

## 4. Modelo de datos

### Entidades construidas en M54

**Guide** — un envío; nace en recepción de carga y avanza solo al registrar historial.

| Campo | Tipo | Restricciones | Notas |
|---|---|---|---|
| `id` | `BigAutoField` | PK | Interno; nunca se expone (`settings.py:135`) |
| `tracking_number` | `CharField(22)` | Único, validador y `CheckConstraint` `tracking_number_format` | 16 dígitos que empiezan con 21, o 22 alfanuméricos en mayúscula (`models.py:34-38`, `:163-165`, `:185-188`) |
| `origin`, `destination` | `CharField(100)` | No nulos | En público, solo ciudad |
| `recipient` | `CharField(255)` | No nulo | Dato personal; nunca público |
| `service_level` | `CharField(10)` | `choices`, `blank=True` | Admite `""` (BD04) |
| `current_stage` | `CharField(20)` | `CheckConstraint` `current_stage_valid` | Solo cambia vía historial (`models.py:189-192`, `:230-233`) |
| `is_archived` | `BooleanField` | Falso por defecto | Archivar en lugar de borrar |
| `created_at`, `updated_at` | `DateTimeField` | `auto_now_add`, `auto_now` | UTC (`settings.py:161`) |

**StatusHistory** — una fila por etapa alcanzada; solo inserción.

| Campo | Tipo | Restricciones | Notas |
|---|---|---|---|
| `guide` | FK a `Guide` | `PROTECT` | `models.py:327` |
| `stage` | `CharField(20)` | `choices` | `models.py:328` |
| `timestamp` | `DateTimeField` | `auto_now_add` | Fecha del servidor de aplicación (`models.py:329`) |
| `updated_by` | FK a `User` | `PROTECT`, nulo permitido | `models.py:330-332` |
| `location` | `CharField(100)` | Opcional | Texto libre |
| `note` | `TextField` | Opcional | Sin tope (BD05) |
| — | `UniqueConstraint(guide, stage)` | `unique_stage_per_guide` | `models.py:340-342` |

**User** (`accounts`) — `AbstractUser` más `department` (`customs`, `operations`, `security`, `kam`; `accounts/models.py:7-22`).

### Relaciones

- `StatusHistory —(N:1)→ Guide`, de 0 a 5 filas por guía. Borrar una guía con historial falla (`PROTECT`).
- `StatusHistory —(N:1, opcional)→ User`. Borrar un usuario con historial falla: se desactiva (`is_active=False`).
- Planeado: `Incident —(N:1)→ Guide` (D5); `StageTransitionAttempt —(N:1)→ Guide` y `→ User` (M64); `Guide —(N:1, opcional)→ User` como `customer` (ola del portal).

### Índices

| Tabla | Índice | Para qué |
|---|---|---|
| `tracking_guide` | Único en `tracking_number` | Búsqueda del rastreo y de las rutas del LMS |
| `tracking_statushistory` | Único `(guide_id, stage)` | Una etapa por guía y lectura del historial |
| `tracking_statushistory` | `guide_id` (FK de Django) | Redundante con el anterior (BD03); se mide en PostgreSQL antes de tocarlo |
| `tracking_guide` | Parcial `current_stage WHERE NOT is_archived` | Solo si `EXPLAIN ANALYZE` lo justifica en M66 (BD08) |

### Delta de M64 (aditivo)

| Cambio | Migración | Prueba en rojo primero |
|---|---|---|
| `StatusHistory.department` (`CharField(20)`, `choices` de `Department`, en blanco permitido): el servicio copia `request.user.department` al insertar | `tracking/0004` | La fila guarda el área aunque después cambie la del usuario (C25) |
| `StageTransitionAttempt`: `guide` (FK `PROTECT`), `requested_stage`, `current_stage`, `attempted_by` (FK `PROTECT`, nulo permitido), `attempted_at` (`auto_now_add`), `reason` (`skip`, `backwards`, `delivered`) | `tracking/0005` | Un PUT con salto responde 409 y deja una fila (C09) |
| `CheckConstraint` `service_level_valid` (`service_level IN ('standard','priority')`) y sin `blank=True` | `tracking/0006` | Guardar `""` falla (BD04) |
| Orden del historial por `pk` en `models.py:286` y `:380` | Ninguna | Dos filas con `timestamp` invertido se validan en orden de inserción (BD12) |

### Delta de M66

| Cambio | Dónde |
|---|---|
| `Incident` (`guide`, `kind`, `opened_at`, `closed_at`, `note`), solo si D5 lo pone en el núcleo | `tracking/0007` |
| Roles de PostgreSQL: `hound_migrator` (dueño del esquema, DDL) y `hound_app` (`SELECT`, `INSERT` y `UPDATE` sobre `tracking_guide`; `SELECT` e `INSERT` sobre `tracking_statushistory` y `tracking_stagetransitionattempt`; sin `UPDATE` ni `DELETE` en el historial) | Procedimiento de despliegue, no migración de Django (BD01) |
| Si D7 es Supabase: tablas fuera del esquema expuesto por su API de datos, o RLS activado sin políticas en todas | Procedimiento de despliegue (BD02) |

### Migraciones

- Nombres automáticos de Django; una migración por cambio de modelo, con su prueba.
- `makemigrations --check --dry-run` en el CI (`ci.yml:42`).
- Solo operaciones reversibles (`AddField`, `CreateModel`, `AddConstraint`). Nada destructivo en el mismo despliegue que el código que lo necesita.
- En PostgreSQL, `SET lock_timeout = '5s'` antes de migrar en el procedimiento de M66 (BD15).

### Datos semilla

`python manage.py loaddata demo_guides`: 4 guías no secuenciales y 13 filas de historial, sin usuarios (`tracking/fixtures/demo_guides.json`; consistencia probada en `test_models.py:636`). El personal de demostración se crea con `createsuperuser`; nunca con una contraseña escrita en un archivo.

---

## 5. Diseño de la API

### Convenciones

| Tema | Regla |
|---|---|
| Base | `/api/v1/` para el producto; `/api/` para los alias del LMS |
| Formato | JSON con `charset=utf-8` (`config/renderers.py:6-15`); camelCase en los serializers (`trackingNumber`, `currentStatus`, `updatedBy`) |
| Errores | `{"detail": "<mensaje>", "code": "<código>"}` y, en los 409, `"currentStatus"`. Códigos: `validation_error` (400), `not_authenticated` y `permission_denied` (403), `not_found` (404), `duplicate` y `invalid_transition` (409), `throttled` (429) |
| Validación | Serializers de DRF más las invariantes del modelo; `TrackingNumber` normaliza antes de validar |
| Paginación | `CursorPagination` por `-created_at`, 20 por página, máximo 100 (BD09) |
| Idempotencia | PUT de la etapa actual responde 200 sin fila nueva (C13; E7). POST de alta con un número existente responde 409 `duplicate` |
| Límites | `anon` 60/min y `user` 120/min (ya construido); `public_track` cuenta cada guía (C15); caché compartida y `NUM_PROXIES` real en M66 |
| Consultas | `select_related` y `prefetch_related("status_history")`; prueba con `assertNumQueries` (BD07) |

### Rutas

| Método | Ruta | Alias del LMS | Acceso | Límite |
|---|---|---|---|---|
| GET | `/api/v1/guides/` | — | Personal | `user` |
| POST | `/api/v1/guides/` | `/api/crear-guia/` | Personal | `user` |
| GET | `/api/v1/guides/{tracking_number}/` | `/api/obtener-guia/{tracking_number}/` | Personal | `user` |
| PUT | `/api/v1/guides/{tracking_number}/` | `/api/actualizar-guia/{tracking_number}/` | Personal | `user` |
| DELETE | `/api/v1/guides/{tracking_number}/` | `/api/eliminar-guia/{tracking_number}/` | Personal | `user` |
| GET | `/api/v1/guides/{tracking_number}/history/` | — | Personal | `user` |
| GET | `/api/v1/guides/summary/` | — | Personal | `user` |
| GET | `/api/v1/public/track/?numbers=a,b` | — | Público | `public_track` por guía |
| GET | `/api/v1/auth/csrf/` | — | Público | `anon` |
| POST | `/api/v1/auth/login/`, `/api/v1/auth/logout/` | — | Público / sesión | `anon`, más el freno de E1 |
| GET | `/api/v1/auth/me/` | — | Sesión | `user` |
| GET | `/api/v1/health/` | — | Público | `anon` (ya existe) |

### Endpoints críticos

**POST `/api/v1/guides/` (alta).**
Entrada: `trackingNumber`, `origin`, `destination`, `recipient`, `serviceLevel` (opcional). Reglas: `TrackingNumber` normaliza y valida; los campos de texto no vacíos tras `strip`; `recipient` hasta 255. Efecto: `create_guide` crea la guía y su primera fila en `cargo_received`, con `updated_by` y `department`, en una sola transacción (C06). Respuestas: 201 con la guía y su historial; 400 `validation_error`; 409 `duplicate`; 403 sin sesión o sin CSRF.

**PUT `/api/v1/guides/{tracking_number}/` (avance).**
Entrada: `stage` (la etapa a la que se quiere llegar) y `location` (opcional, hasta 100). Cualquier fecha enviada se ignora. Efecto: `advance_guide` bloquea la guía, compara y decide:

| Caso | Respuesta | Efecto |
|---|---|---|
| `stage` es la siguiente | 200 con la guía | Nueva fila con autor, área y fecha del servidor |
| `stage` es la actual | 200 con la guía | Ninguno (reintento) |
| Salto, retroceso o guía entregada | 409 `invalid_transition` con `currentStatus` | Una fila en `StageTransitionAttempt` |
| Guía archivada | 409 `invalid_transition` | Una fila en `StageTransitionAttempt` |
| Número inexistente | 404 `not_found` | Ninguno |

**GET `/api/v1/public/track/?numbers=a,b` (rastreo público).**
Entrada: de 1 a 10 números separados por comas, normalizados. Respuesta por guía: `trackingNumber`, `currentStatus` y `history[]` con `stage`, `timestamp` y `location` a nivel de ciudad o centro. Nunca `id`, `recipient`, `note`, `updatedBy`, `origin` ni `destination` detallados. Una guía inexistente aparece como `{"trackingNumber": "...", "found": false}`, con la misma forma para un formato válido que no existe que para uno archivado. Más de 10 números: 400. Cada número consume una unidad del límite `public_track`. Los registros de acceso no guardan la query string de esta ruta (C16).

**GET `/api/v1/guides/summary/` (contadores de M66).**
`{"total", "active", "inTransit", "delivered", "withAlert"}`: activas = etapas 1 a 4 sin archivar; en tránsito = etapa 4; entregadas = etapa 5; con alerta = incidencias abiertas, solo si D5 (E6). Una sola consulta agregada.

**GET `/api/v1/auth/csrf/`.**
Fija la cookie CSRF y devuelve el token en el cuerpo. El SPA nunca lee la cookie por nombre, porque en producción se llama `__Host-csrftoken` (`settings.py:77-78`; C14).

### Interfaces que se mantienen

`GET /api/v1/health/` y su respuesta; los códigos de etapa; el formato del número de guía; `IsAuthenticated` por defecto; el alias `POST /api/v1/guides/{n}/advance/` hasta que el frontend migre a PUT, y entonces se retira con su propio commit.

---

## 6. Arquitectura del frontend

### Delta de M66

- `httpRepository` con una instancia de Axios (`baseURL: "/api/v1"`, `withCredentials`), que pide el token a `/auth/csrf/` y lo envía en `X-CSRFToken`.
- Registro de guías (A3) con las mismas reglas que el servidor: duplicado y campos vacíos con mensajes claros.
- Panel de estado (A1) que carga `summary` al montar y lo vuelve a pedir después de cada alta o avance.
- Lista (A2) con el botón de la etapa siguiente; un 409 muestra la etapa actual que devolvió el servidor.
- Corrección de `StageSummary`: "en tránsito" es solo la etapa 4.
- Estados del rastreo: rastreando, encontrado, no encontrado, servicio no disponible y sin eventos todavía.

El resto de la arquitectura del frontend está en el README v2 §8.7.

## 7. Sistema de diseño

NO APLICA — este blueprint cubre backend e integración. El sistema de diseño está en el README v2 §6 y en el loop de Claude Design.

---

## 8. Autenticación y autorización

| Regla | Dónde se aplica | Estado |
|---|---|---|
| El admin solo admite usuarios activos con `is_staff` | `django.contrib.admin` | Construido (`SECURITY.md`) |
| La API exige sesión salvo que la vista se abra de forma explícita | `settings.py:172-173` | Construido |
| Escribir guías exige ser personal (`is_staff`) | `GuideViewSet.permission_classes` | M64 |
| El rastreo público es `AllowAny` y solo lectura, con campos mínimos | `PublicTrackView` | M64 |
| Cualquier miembro del personal avanza cualquier etapa y queda registrada su área | `advance_guide` | M64 (D2: restringir por área es un plus que decide Eduardo, E12) |
| Freno de fuerza bruta en el login del admin y en `/api/v1/auth/login/` | Según E1 | Antes de M66 (C21) |
| Acceso por objeto: un cliente solo ve sus guías | `Guide.customer` y un permiso por objeto | Ola del portal (ASVS 8.2.2) |

`SECURITY.md` se actualiza en el mismo commit que agregue cada regla (ASVS 8.1.1).

---

## 9. Orden de construcción

Cada paso cabe en una sesión, empieza con su prueba en rojo y termina con su verificación. Comandos desde `backend/`.

| # | Paso | Hecho cuando | Verificación | Punto de regreso |
|---|---|---|---|---|
| 1 | Feature de M64 en `odd/tasks/m64-api-guias.md` con specs textuales de la consigna (#851) | El documento y su espejo en Engram existen | Lectura del documento | — |
| 2 | `TrackingNumber` en `tracking/values.py` | Normaliza (`strip`, `upper`) y rechaza formatos inválidos con el mensaje del validador actual | `python manage.py test tracking` | Commit anterior |
| 3 | Migraciones `0004` a `0006` y orden por `pk` | `department`, `StageTransitionAttempt` y `service_level_valid` existen; las 108 pruebas siguen verdes | `python manage.py test` y `python manage.py makemigrations --check --dry-run` | `migrate tracking 0003` |
| 4 | `services.py`: `create_guide`, `advance_guide`, `archive_guide` | Casos T01, T04, T04b, T05 a T07, T08, T10 y T36 en verde | `python manage.py test tracking` | Commit anterior |
| 5 | API de personal y alias del LMS | Rutas de §5 con 201, 200, 400, 403, 404 y 409; `assertNumQueries` en el listado | `python manage.py test` | Commit anterior |
| 6 | Rastreo público y límite por guía | T13 a T16, T15b y T19 en verde | `python manage.py test` | Commit anterior |
| 7 | Autenticación de la API y `csrf` | T17 y T18; el token sale de `/auth/csrf/` | `python manage.py test accounts` | Commit anterior |
| 8 | Colección de Postman con las rutas del LMS | La colección pasa completa en local | Ejecución de la colección (Eduardo) | — |
| 9 | Cierre de M64 | `ruff check .`, `ruff format --check .`, `check --deploy` en 0 con `DJANGO_DEBUG=false`, OSV y gitleaks sin hallazgos | Los comandos de la fila | — |
| 10 | Entorno de M66 (con E1, E2, E3 y E11 decididas) | PostgreSQL con roles, `CACHES` compartida, `NUM_PROXIES` igual al número de proxies, freno del admin, `CONN_MAX_AGE` | Las 108+ pruebas contra PostgreSQL en CI; T31, T33 y T34 | Volver a SQLite con el mismo commit de código |
| 11 | Integración del frontend (M66) | Jest de integración del flujo completo; contadores T32 | `npm test` (Eduardo) | Commit anterior |
| 12 | Publicación de M66 | La URL responde `{"status":"ok","database":"ok"}` durante toda la revisión; Postman pasa contra la URL | `curl` a `/api/v1/health/` desde fuera | Redesplegar la imagen anterior |

### 9.1 Paridad y corte (SQLite → PostgreSQL)

1. **Lista de paridad:** las mismas pruebas, la misma carga de `demo_guides`, las mismas respuestas de §5 y la misma validación del formato del número de guía con la expresión regular en la base.
2. **Arnés:** el CI corre la suite completa con SQLite y con PostgreSQL; cualquier diferencia falla.
3. **Convivencia:** el motor se elige por variable de entorno; en local sigue SQLite.
4. **Corte:** se migra una base vacía y se carga `demo_guides`. Si E3 dice "datos reales", antes van `pg_dump` y una restauración ensayada.
5. **Criterio para volver atrás:** cualquier prueba roja en PostgreSQL o un 503 sostenido en la salud.
6. **Retiro:** la configuración de SQLite se queda para desarrollo; no hay nada que retirar.

---

## 10. Entorno

Variables que lee `settings.py` (solo nombres; los valores viven en `backend/.env`, privado y fuera de git):

| Variable | Uso |
|---|---|
| `DJANGO_ENV_FILE` | Ruta alternativa del archivo de entorno |
| `DJANGO_DEBUG` | Modo de depuración; en falso activa la configuración de producción |
| `DJANGO_SECRET_KEY` | Clave secreta; obligatoria fuera de depuración |
| `DJANGO_ALLOWED_HOSTS` | Hosts permitidos; obligatoria fuera de depuración |

En M66 se agregan las de la base (nombre por decidir con E2) y `GEMINI_API_KEY` sigue limitada a `backend/assistant/`. No se crea ningún archivo de ejemplo (regla global §4); el README explica cada variable por su nombre. Cuando exista un gestor de secretos, las inyecta al arrancar.

## 11. Dependencias

| Paquete | Versión | Estado | Nota |
|---|---|---|---|
| `django` | 5.2.18 | Fijo | `pyproject.toml`: `>=5.2.18,<5.3` |
| `djangorestframework` | 3.18.3 | Fijo | `>=3.18.2,<3.19` |
| `python-dotenv` | 1.2.3 | Fijo | — |
| `ruff` | 0.16.9 | Desarrollo | — |
| `psycopg` | Por fijar | M66 | LGPL-3.0: revisión de licencia y enfriamiento de 3 días antes de fijar |
| Freno del admin | Por decidir | E1 | Si es `django-axes`: revisión de licencia, de mantenimiento y de cadena de suministro antes de agregarla |

Toda dependencia nueva entra con `uv lock`, se exporta a `requirements.txt` y `requirements-dev.txt` y se registra en `STACK_HOUND_EXPRESS.md`.

## 12. Despliegue

| Requisito | Por qué |
|---|---|
| Host que no se pause durante los 5 días hábiles de revisión | C17 |
| Mismo origen detrás de nginx | Sesión y CSRF sin CORS |
| PostgreSQL con `hound_migrator` y `hound_app` | BD01 |
| Si es Supabase, tablas fuera del esquema expuesto o con RLS | BD02 |
| `NUM_PROXIES` igual al número real de proxies delante de Django; nginx con `$proxy_add_x_forwarded_for` (`frontend/nginx.conf:17` en `c30714a`) | C07 |
| `CACHES` compartida (`DatabaseCache` con `createcachetable`) | C07 |
| `CONN_MAX_AGE` moderado y el pooler del proveedor | BD14 |
| CSP y HSTS también en las respuestas estáticas de nginx | Cabeceras completas |
| Respaldo según E3: con datos de demostración, `loaddata`; con datos reales, `pg_dump` y restauración ensayada | BD13 |

**Regreso:** se vuelve a desplegar la imagen anterior; las migraciones de M64 y M66 son aditivas, así que el código anterior sigue funcionando con el esquema nuevo.

---

## 13. Estrategia de pruebas

- **Runner:** `python manage.py test` (`ci.yml:44`). No se suma pytest (L8).
- **Disciplina:** una prueba en rojo por regla antes del código (Big School, clase 2, p. 9); una prueba por cada comportamiento existente que el cambio toque; verificación diferencial contra el commit anterior para los comandos que compartan código.
- **Piso:** `Ran 108 tests` OK.

| Caso | Prueba prevista | Tipo |
|---|---|---|
| T01 | Alta crea guía y primera fila en la misma transacción | `TestCase` |
| T04b | PUT de la etapa actual: 200 y sin fila nueva | `APITestCase` |
| T05 a T07 | 409 y una fila en `StageTransitionAttempt` | `APITestCase` |
| T08 | Una fecha enviada por el cliente se ignora | `APITestCase` |
| T13, T19 | La respuesta pública no contiene `id`, `recipient`, `note` ni `updatedBy` | `APITestCase` |
| T14 | Inexistente y archivada responden con la misma forma | `APITestCase` |
| T15b | 10 guías consumen 10 unidades | `APITestCase` con caché limpia |
| T16 | 11 guías: 400 | `APITestCase` |
| T17, T18 | Escritura sin sesión o sin CSRF: 403 | `APITestCase` con `enforce_csrf_checks=True` |
| T31 | Dos avances simultáneos: uno 200 y otro 409 | `TransactionTestCase` con dos hilos, solo en PostgreSQL |
| T32 | Contadores según §5 | `APITestCase` |
| T33 | Ráfaga al login del admin: bloqueo | Según E1 |
| T34 | Detrás de un proxy, dos clientes no comparten límite | `APITestCase` con `REMOTE_ADDR` del proxy y `X-Forwarded-For` |
| T35 | Listado con número de consultas constante | `assertNumQueries` |
| T36 | Orden del historial por `pk` con `timestamp` invertido | `TestCase` |

## 14. Seguridad y secretos

Mapa de OWASP ASVS 5.0 nivel 1 (fuente: `docs/entregas/m54/asvs-l1-checklist.md`), actualizado con lo construido en M54.1 y lo planeado.

| ASVS | Control | Estado en `aed7967` | Evidencia | Siguiente |
|---|---|---|---|---|
| 2.1.1 | Reglas de validación documentadas | Parcial | Docstring de `models.py:1-24` | §5 de este blueprint y `SECURITY.md` en M64 |
| 2.2.1, 2.2.2 | Validación positiva en el servidor | Cumple | `models.py:34-38`, `:185-192` | `TrackingNumber` en M64 |
| 2.3.1 | Flujo en orden | Cumple | `models.py:59-67`, `:354-397` | Registro de intentos (M64) |
| 3.2.1 | `nosniff` | Cumple | `settings.py:96`; `core/tests/test_security.py:32` | — |
| 3.3.1 | Cookies `Secure` con `__Host-` | Cumple en producción | `settings.py:75-78` | El SPA toma el token de `/auth/csrf/` (M66) |
| 3.4.1 | HSTS de un año | Cumple en producción | `settings.py:70-72` | También en nginx (M66) |
| 3.4.2 | Sin CORS | Cumple | `core/tests/test_security.py:36` | Mismo origen en M66 |
| 3.5.1, 3.5.2 | CSRF | Cumple | `settings.py:99`; `core/tests/test_security.py:56` | T18 en la API de M64 |
| 4.1.1 | `charset` | Cumple | `config/renderers.py:6-15`; `core/tests/test_security.py:41` | — |
| 6.1.1 | Límite de peticiones | Parcial | `settings.py:184-191`; `core/tests/test_security.py:78-97` | Por guía (M64); caché compartida y `NUM_PROXIES` (M66) |
| 6.2.1, 6.2.4, 6.2.5 | Longitud 12, contraseñas comunes, sin reglas de composición | Cumple | `settings.py:142-152`; `accounts/tests/test_password_policy.py:17-26` | — |
| 6.3.1 | Freno de fuerza bruta | **No cumple** | `settings.py:180-183` | E1, antes de M66 |
| 6.3.2 | Sin cuentas por defecto | Cumple | `accounts/tests/test_authentication.py:71` | — |
| 7.2.4, 7.4.1, 7.4.2 | Sesión nueva al entrar, cierre e inactivos | Cumple | `accounts/tests/test_authentication.py:33-60` | — |
| 8.1.1 | Reglas de autorización documentadas | Cumple | `SECURITY.md` (`aed7967`) | Se amplía con cada regla de §8 |
| 8.2.1, 8.3.1 | Acceso por función en el servidor | Cumple | `settings.py:173`; `core/tests/test_security.py:69` | Permisos de M64 |
| 8.2.2 | Acceso por objeto | No aplica todavía | — | Ola del portal |
| 12.1.1, 12.2.1 | TLS | Producción | `settings.py:66` | M66 |
| 13.4.1 | Sin `.git` en el despliegue | No aplica todavía | — | Imagen de M66 |
| 15.1.1 | Plazos de remediación | Cumple | `SECURITY.md` (`aed7967`) | — |
| 15.2.1 | Componentes sin CVE conocidos | Cumple | `uv.lock`: Django 5.2.18 y DRF 3.18.3; OSV con 0 avisos (L12) | OSV en el CI (E9) |
| 15.3.1 | Solo los campos necesarios | Cumple | `core/views.py:27-33` | Serializer público de M64 |

**Secretos:** solo en `backend/.env` o en el gestor; gitleaks antes de cada push; el frontend nunca recibe una clave.
**Seguridad por diseño (Big School, clase 2, pp. 15-16):** contraseñas con hash robusto (Django), control de acceso en el servidor (§8) y límite de intentos fallidos (E1).

## 15. Accesibilidad

Para las vistas de M66: cada campo con su etiqueta y su texto de ayuda asociado (`aria-describedby`, como el campo de rastreo actual de Hound según REA); errores del servidor anunciados en una región `aria-live`; estado de etapa con texto, ícono y forma, nunca solo color. El resto, en el README v2 §6.

## 16. Observabilidad y costo

- **Registros:** cada intento rechazado se guarda en `StageTransitionAttempt` y también se registra sin datos personales (guía, etapas, usuario por `id`). Los registros de acceso no guardan la query string del rastreo público.
- **Salud:** `/api/v1/health/` responde 503 si la base falla (`core/views.py:27-33`); es la sonda del host.
- **Costo:** los planes gratuitos se verifican en las páginas oficiales antes de elegir (#853). No se paga ninguna API de IA (README v2 §19.1).

## 17. Enrutamiento de modelos

| Trabajo | Dónde |
|---|---|
| Lo que toca código o datos de Hound | Claude Code o Codex |
| Investigación genérica, lectura masiva de documentación pública | OpenCode con modelos gratuitos (regla global §2) |
| Hooks de GGA | Modelos gratuitos, aprobado por Eduardo (#871) |
| Diseño | Claude Design |

## 18. Skills para la construcción

| Skill o recurso | Para qué |
|---|---|
| `django-drf` | ViewSets, serializers, permisos y límites |
| `karpathy-guidelines` | Cambios quirúrgicos y criterios verificables |
| `work-unit-commits` | Commits por unidad de trabajo |
| `archify` | Actualizar `modelo-de-datos` y `ciclo-de-vida-guia` cuando cambie el modelo |
| `abogado-del-diablo` y los tres revisores de base de datos | Revisión de M64 y M66 antes del PR |
| `cyber-neo` (consulta en sitio) | Rúbrica de severidad y fases de configuración y CI |
| `supply-chain-risk-auditor` | `psycopg` y el freno del admin |
| `security-review` (agente de Codex) | Revisión del PR de M64 |

## 19. Espacio de trabajo de los agentes

NO APLICA — el repositorio ya tiene `CLAUDE.md`, `AGENTS.md` y `.codex/agents/`, que mandan. Este blueprint no los modifica.

---

## 20. Puerta de aceptación, riesgos y decisiones

### Puerta de aceptación

- **M64:** todas las rutas de §5 con sus pruebas, colección de Postman en verde, `ruff` limpio, `makemigrations --check` sin cambios, `check --deploy` en 0, OSV y gitleaks sin hallazgos, `SECURITY.md` y diagramas al día.
- **M66:** lo anterior más PostgreSQL en CI, T31 a T35 en verde, freno del admin activo y la URL publicada respondiendo durante toda la revisión.

### Riesgos

| Riesgo | Mitigación |
|---|---|
| El entorno de M66 llega tarde | Paso 10 antes de tocar el frontend |
| Un cambio de modelo rompe M54 | Solo migraciones aditivas; las 108 pruebas como piso |
| Una dependencia nueva trae un CVE | Plazos de `SECURITY.md`, enfriamiento y OSV en el CI |
| El límite por guía molesta al personal | El personal usa la API autenticada, con su propio límite |

### Decisiones de Eduardo

Decisiones que los documentos no resuelven. Cada una lleva la recomendación del arquitecto; ninguna se toma sin su respuesta.

| ID | Pregunta | Recomendación | Bloquea | Críticas |
|---|---|---|---|---|
| E1 | ¿Cómo se frena la fuerza bruta en el login del admin y de la API? (a) `django-axes`, dependencia nueva; (b) un límite propio con la caché de Django y la señal `user_login_failed`; (c) restringir `/admin/` por red en el proxy | (a) después de revisar licencia, mantenimiento y cadena de suministro; (c) como capa extra si el host lo permite | M66 | C21 |
| E2 | ¿Qué host y qué PostgreSQL para M66? | Un servicio que no se pause durante la revisión, verificado en su página oficial; si es Supabase, con las condiciones de BD02 | M66 | C17, BD02 |
| E3 | ¿M66 guarda datos reales o solo de demostración? | Solo de demostración: el respaldo es `loaddata` y no hace falta RPO ni RTO | M66 | BD13 |
| E4 | ¿Cómo se corrige un avance por error? (a) nunca; (b) un evento compensatorio con motivo, autor y aprobación de otro usuario, sin editar el historial | (b), en una ola, con su propia regla de orden | Operación real | C24 |
| E5 | ¿Cuánto tiempo se guardan `recipient` y `note`, y cómo se anonimizan? | Un plazo fijo después de la entrega y anonimización en lugar de borrado; verificar la ley de 2025 en el DOF | Datos reales | C23 |
| E6 | ¿Se confirma "en tránsito = solo la etapa 4" y entra "con alerta" en M66? | Sí a la etapa 4; "con alerta" solo si D5 pone `Incident` en el núcleo | M66 | #851, D5 |
| E7 | ¿Un PUT repetido de la etapa actual responde 200 (reintento) o 409 (v1)? | 200 | M64 | C13 |
| E8 | ¿Se pasa `docs/investigacion/privado/` (y `04`, `07`) del `.git/info/exclude` local al `.gitignore` versionado? | Sí | Cualquier push desde otra copia | C22 |
| E9 | ¿Se agregan al CI `check --deploy`, OSV o `pip-audit`, gitleaks, Dependabot y acciones fijadas por SHA? | Sí, en un PR propio (riesgo 5: CI) | M66 | C26, L7 |
| E10 | ¿Cuándo se notifica a Hound y se pide la autorización de marca (D15)? | Antes de publicar la URL de M66 | M66 | C27 |
| E11 | ¿Caché compartida con `DatabaseCache` (sin dependencia) o Redis (servicio nuevo)? | `DatabaseCache` | M66 | C07 |
| E12 | ¿El avance se restringe por área (D2) o solo se registra el área? | Solo registrar en M64; restringir como plus en una ola | M64 | D2, C25 |

### Bitácora de decisiones del arquitecto

| Decisión | Razón |
|---|---|
| Las invariantes se quedan en el modelo; `services.py` es una fachada | Protegen admin, shell y API (C05) |
| Rutas del LMS por número de guía, no por `id` | Evita enumeración (#851) |
| Migraciones solo aditivas en M64 y M66 | Permiten volver a la imagen anterior sin tocar el esquema |
| Avisos desde el servicio, no desde señales | `bulk_create` no emite señales |
| Sin capa Repository | El ORM ya la da |
| Ningún cambio de modelo en M54 | Ninguna crítica demostró un bloqueo para la entrega |
