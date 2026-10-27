# Abogado del diablo · Propuesta maestra y bloque M54.1

| Campo | Valor |
|---|---|
| Fecha | 2026-10-27 |
| Feature | `odd/tasks/contexto-rea-hound.md`, tarea T4, spec S3 ("odd investiga planifica") |
| Qué se ataca | La propuesta maestra v1 (reconstruida, ver [`README.md`](README.md)) y el bloque M54.1 de la rama `backend` (`0fc74ad..aed7967`) |
| Método | Skill `abogado-del-diablo` (ocho ángulos), tres pasadas de revisión de base de datos y la escala de severidad de `cyber-neo` |
| Código revisado | `backend/tracking/models.py`, `backend/accounts/models.py`, `backend/tracking/admin.py`, `backend/config/settings.py` y `backend/config/renderers.py` en `aed7967`. Toda cita `archivo:línea` se comprobó con `git show aed7967:<ruta>` |
| Lo que no se hizo | Ninguna consulta al sitio vivo de Hound ni a sus APIs. Los hallazgos de seguridad sobre ese sitio siguen en el informe privado y no aparecen aquí |

## 0. Cómo leer este documento

**Severidad** (rúbrica de `cyber-neo`, `skills/cyber-neo/SKILL.md`, paso 7.3):

| Severidad | Criterio adaptado al proyecto |
|---|---|
| Crítica | Pérdida de datos, acceso sin autenticación o secreto expuesto en producción |
| Alta | Rompe una entrega (M64 o M66), abre una vía de ataque realista o filtra información privada |
| Media | Defecto que aparece con uso normal, o una regla del proyecto incumplida |
| Baja | Defecto con poca probabilidad o poco impacto |
| Info | Mejora o medición sin defecto demostrado |

Cuando aplica, cada crítica lleva su CWE y su categoría de OWASP Top 10 2025 (`references/owasp-top-10.md` y `references/cwe-top-25.md` de `cyber-neo`).

**Horizonte:** "ahora" (documentos), M54 (modelos), M64 (API), M66 (integración y despliegue) u "ola" (después de M66).

**Evidencia:** `archivo:línea` en `aed7967` para la rama `backend`; `archivo:línea` en `c30714a` para `practicas-ebac`; `#NNN` para observaciones de Engram; `L<n>` para la bitácora del feature.

**Identificadores:** `C01` a `C33` son críticas a la propuesta y a M54.1; `BD01` a `BD15` son hallazgos de las pasadas de base de datos. `D1` a `D16` (sin cero) son las decisiones pendientes de la v1, y `E1` a `E12`, las decisiones nuevas del blueprint.

**Veredicto de cada crítica:** se decide en [`README.md`](README.md) §0.3, con su razón.

---

## 1. Veredicto

La propuesta diseña 42 vistas, un asistente de IA y tres olas de mejoras sobre un backend que nunca ha corrido fuera de `manage.py test` con SQLite. M66 exige una URL pública con datos persistentes revisada durante cinco días hábiles, y hoy no existe entorno de producción, ni base elegida, ni prueba de concurrencia en PostgreSQL, ni freno de fuerza bruta en el admin. El modelo de M54 resiste; lo que va a fallar es todo lo que lo rodea.

---

## 2. Ataque por ángulos

### Ángulo 1 · Premisas falsas

**C01 · La propuesta no existía en git.** Severidad **Alta**.
`docs/propuesta/README.md` no está en ninguna rama (L8: `git log --all` vacío), aunque `AGENTS.md` la cita como documento rector. Engram #946 solo guarda un resumen. El texto completo sobrevivió por accidente: el script del kit lo copió a `~/kit-claude-design/05-PROPUESTA-V3.md` el 2026-10-14 (línea 41 de `docs/loops/armar-kit-claude-design.sh`, en una versión del script que tampoco está en git). Un documento que manda sobre el proyecto y vive en una carpeta temporal fuera del repositorio es un punto único de pérdida.

**C02 · SDD como columna vertebral.** Severidad **Media**.
La v1 organiza el trabajo con SDD (§12.3, §12.5 y §13.2: "Cada cambio recorre exploración → propuesta → spec…"). La regla global §1 retiró SDD y fijó ODD: no se crean artefactos SDD. La propuesta contradice una regla que manda sobre ella.

**C03 · `backend/.env.example` como documentación de variables.** Severidad **Media**.
La v1 (§8.8 y §12.8) lo presenta como el lugar de las variables. La regla global §4 prohíbe cualquier variante de `.env`; el archivo se eliminó en `9b334c0` y el `.gitignore` dejó de permitirlo en `a50b656`.

**C04 · "El Proxy de protección existe en el código".** Severidad **Baja**.
Engram #1076 marca a `GuideQuerySet` (`models.py:111-124`) y `StatusHistoryQuerySet` (`models.py:243-253`) como Proxy existente. Un Proxy es un objeto intermediario con la misma interfaz que el objeto real. Aquí hay subclases que sobrescriben `update`, `delete` y `bulk_*`: el control de acceso existe, pero por herencia, no por un intermediario. Si se presenta como "existe", NotebookLM y el material de estudio aprenden un patrón inflado. La ficha de refactoring.guru ya lo llamaba "como idea".

**C05 · Capas `domain.py` y `services.py`.** Severidad **Media**.
La v1 (§8.2) pedía reglas puras en `domain.py` y casos de uso en `services.py`. La M54 construida puso las invariantes en el modelo y en sus QuerySet (`models.py:198-240`, `:354-397`), y eso protege también el admin y el shell, que nunca pasarían por un servicio. Un `domain.py` duplicaría reglas que el ORM ya hace cumplir. La premisa de capas no sobrevivió al código.

**C06 · "El alta crea el historial inicial".** Severidad **Media**.
El caso T01 de la v1 espera "201 con historial inicial". El modelo admite una guía en `cargo_received` con cero filas de historial: `_current_stage_for_history(0)` devuelve recepción de carga (`models.py:79-82`) y `save_base` fija esa etapa al crear (`models.py:224-226`). El admin crea guías sin fila inicial. Sin esa fila no hay fecha de recepción, y el indicador "tiempo por etapa" no tiene punto de partida.

**C07 · El límite de peticiones "por cliente" no distingue clientes.** Severidad **Media** hoy, **Alta** en M66. CWE-770, OWASP A06:2025.
`NUM_PROXIES` vale 0 (`settings.py:189-191`): DRF identifica al cliente por `REMOTE_ADDR`. Detrás del nginx de `docker compose` (`frontend/nginx.conf:14-18` en `c30714a`), todos los clientes llegan con la misma dirección, la del contenedor de nginx. Resultado: 60 peticiones anónimas por minuto **para todos los visitantes juntos**, no por visitante. Además no hay `CACHES` en `settings.py`, así que el historial del límite vive en la memoria de cada proceso: con varios workers, cada uno cuenta por su lado. La corrección de `40972dd` cerró la evasión con `X-Forwarded-For` (`core/tests/test_security.py:88-97`), pero deja este efecto para M66, como reconoce el propio comentario.

**C08 · Estado del repositorio desactualizado.** Severidad **Baja**.
La v1 dice "Django 5.2.17 LTS + DRF 3.18.1" y "13 pruebas" (§2.3 y §14.3). En `aed7967` hay Django 5.2.18, DRF 3.18.3 y `Ran 108 tests` (L13).

### Ángulo 2 · Validez del problema

**C09 · El sistema bloquea el salto, pero no lo registra.** Severidad **Media**.
El problema que motiva el proyecto es humano: solo 31 de cada 100 guías seguían el orden y los saltos se tapaban con fechas posteriores (#851). `_validate_stage_transition` lanza `ValidationError` (`models.py:59-67`) y no guarda nada. La empresa pierde exactamente la métrica que le dolía: cuántas veces alguien intentó saltarse un paso, quién y en qué guía. La mejora 5 de la v0 (indicador de cumplimiento con "intentos de salto bloqueados", #853) no tiene de dónde leer.

**C10 · El orden estricto no prueba el hecho físico.** Severidad **Media**.
Nada impide avanzar las cinco etapas en diez segundos. La regla evita el salto, no la ráfaga. Sin "tiempo por etapa" y una alerta por avances en ráfaga, el sistema certifica un orden que puede ser ficticio.

### Ángulo 3 · Competencia

**C11 · Una demostración sin datos reales no compite como rastreador.** Severidad **Media**.
Hound ya tiene Sabueso con historial real; AfterShip y 17TRACK agregan transportistas (v0, #853). La integración real con Sabueso está fuera de alcance (v1 §5.5). Si la propuesta se vende como "un mejor rastreador", pierde contra lo que Hound ya tiene. Lo que este proyecto sí puede demostrar es control del proceso, rastreo público seguro y diseño.

### Ángulo 4 · Viabilidad práctica

**C12 · 42 vistas, 8 diseñadas.** Severidad **Alta**.
Claude Design entregó los lotes 0 a 5 (el sistema y 8 de 42 vistas) antes de quedarse sin créditos (#954). Faltan 34. Si M66 espera al rediseño completo, M66 no llega.

**C13 · PUT para avanzar no es idempotente en su respuesta.** Severidad **Media**.
La regla de la v1 (§8.4, paso 4) responde 409 ante un "envío repetido". Un cliente que reintenta después de perder la respuesta (doble clic, red móvil) recibe 409 aunque el primer intento sí avanzó. El estado del servidor es idempotente; la respuesta no. El nodo `idempotency` de roadmap.sh (`api-design`) lo plantea justo para PUT: repetir la petición debe tener el mismo efecto que hacerla una vez.

**C14 · La cookie `__Host-csrftoken` rompe al SPA solo en producción.** Severidad **Media**. CWE-352.
En producción la cookie se llama `__Host-csrftoken` (`settings.py:77-78`); en local, `csrftoken`. Un frontend que lea la cookie por nombre funciona en desarrollo y falla en la URL publicada de M66. El defecto aparecería el día de la entrega.

**C15 · El límite cuenta peticiones, no guías.** Severidad **Media**. CWE-799, OWASP A06:2025.
El rastreo múltiple acepta hasta 10 guías por petición (v1 §8.5). Con 60 peticiones por minuto, un cliente consulta 600 guías por minuto: el límite que debía frenar la enumeración se multiplica por diez.

**C16 · Números de guía en la URL.** Severidad **Baja**.
`GET /api/v1/public/track/?numbers=a,b` (v1 §8.5) deja los números en los registros de acceso del proxy y de cualquier intermediario. Un número de guía es la llave del rastreo.

### Ángulo 5 · Números

**C17 · Hosting gratuito que se pausa durante la revisión.** Severidad **Alta**.
La v0 registró que el plan gratuito de Supabase se pausa tras 7 días sin actividad y no incluye respaldos (#853), con la advertencia de verificar esas cifras en la página oficial (sin re-verificar aquí: no se usó la red). La revisión de M66 tarda 5 días hábiles (#851). Si la base se pausa mientras el tutor revisa, `/api/v1/health/` responde 503 (`core/views.py:27-33`) y la entrega se ve rota.

**C18 · Créditos frente a la regla de datos.** Severidad **Media**.
La regla global §2 manda el trabajo pesado a OpenCode con modelos gratuitos; la §4 prohíbe que código o datos de Hound salgan a esos modelos sin aprobación. Claude Design ya se quedó sin créditos (#954) y un escritor se cortó por límite de uso (L11). Todo lo que toca datos de Hound cae del lado caro.

### Ángulo 6 · Capacidad de ejecución

**C19 · Una sola persona ejecuta red, git y aprobaciones.** Severidad **Media**.
Eduardo ejecuta npm, Homebrew y git con red, aprueba compuertas y publica. En una sola semana hubo blobs perdidos en git (#1165), un `npm install` negado por el clasificador de permisos (L11) y un escritor cortado por límite de uso (L11). Cinco ramas, tres compuertas y la revisión nativa multiplican los puntos de espera.

**C20 · No hay prueba de concurrencia real.** Severidad **Media**. CWE-362.
`test_models.py` no abre dos conexiones a la vez. En SQLite, `select_for_update` no bloquea filas; la seguridad descansa en `transaction_mode: IMMEDIATE` (`settings.py:130-131`), en el UPDATE condicional (`models.py:97-104`) y en `unique_stage_per_guide` (`models.py:341`). El diseño es correcto en papel, pero en PostgreSQL nadie lo ha visto funcionar.

### Ángulo 7 · Pre-mortem: cómo muere en doce meses

1. **Mes 1.** M64 sale con PUT y alias del LMS. El frontend sigue con `POST .../advance/` porque el rediseño no llegó (C12).
2. **Mes 2.** M66 se publica en el plan gratuito más rápido de configurar. El SPA lee `csrftoken` por nombre y todo POST falla con 403 en producción (C14). Se arregla de prisa y sin prueba.
3. **Mes 2, semana 2.** El tutor corre la colección de Postman desde la misma red que otros revisores. Detrás del proxy todos comparten una dirección y el límite global de 60 por minuto devuelve 429 a mitad de la colección (C07).
4. **Mes 3.** La base se pausa un fin de semana; la URL del portafolio responde 503 justo cuando Hound la abre (C17).
5. **Mes 5.** La URL pública del admin recibe un ataque de diccionario. No hay freno (C21) y la cuenta del personal de demostración cae; aparecen guías con textos ofensivos en la vitrina que Hound iba a evaluar.
6. **Mes 6.** Un miembro del personal avanza una guía por error. El historial no admite correcciones (C24); alguien la "arregla" con SQL directo, la ruta que el propio docstring declara sin control (`models.py:12-16`).
7. **Mes 8.** Con dos instancias detrás del balanceador, una fila de historial queda ordenada antes que su predecesora por desfase de relojes; la guía no admite más etapas (BD12).
8. **Mes 12.** Se clona el repositorio en otra máquina para continuar. `docs/investigacion/privado/` no está en el `.gitignore` versionado y un `git add .` publica notas de investigación que debían quedar privadas (C22). Es el único error de la lista que no se puede deshacer.

### Ángulo 8 · Puntos ciegos

**C21 · El login del admin no tiene freno de fuerza bruta.** Severidad **Media** hoy (sin despliegue), **Alta** en M66. CWE-307, OWASP A07:2025, ASVS 6.3.1.
Los límites de DRF no cubren `/admin/` y el código lo dice (`settings.py:180-183`). La política de 12 caracteres y la lista de contraseñas comunes (`settings.py:142-152`) reducen el riesgo, no lo eliminan. El material de seguridad por diseño del curso de Big School (clase 2, p. 16) lo pide sin rodeos: limitar el número de intentos fallidos de inicio de sesión. Es el aviso 2 del verificador independiente (L13).

**C22 · La investigación privada solo está excluida en local.** Severidad **Alta**. CWE-538, OWASP A02:2025.
`docs/investigacion/privado/`, `04` y `07` se excluyeron en `.git/info/exclude` (L4). Ese archivo no viaja con el repositorio: un clon nuevo o una copia en otra máquina los trata como archivos nuevos. La política de divulgación responsable de la v1 (§15.6) depende de que nadie ejecute `git add .` fuera de esta copia.

**C23 · Datos personales sin plazo de retención.** Severidad **Media**. CWE-359.
`recipient` (`models.py:168`) y `note` (`models.py:334`) guardan datos personales sin plazo ni anonimización. `PROTECT` en `updated_by` (`models.py:330-332`) impide borrar a un usuario con historial, y eso choca con el derecho de cancelación de la ley de datos personales. La propia v1 advierte que la ley de 2025 debe verificarse en el DOF (§15.2).

**C24 · No existe una vía para corregir un error operativo.** Severidad **Media**.
El historial no se edita ni se borra, tampoco desde el admin (`admin.py:55-62`). Es el requisito. Pero un avance por error es inevitable en operación real, y hoy la única salida es SQL directo, la ruta que el docstring declara fuera de control (`models.py:12-16`).

**C25 · El historial no guarda el área de quien avanzó.** Severidad **Media**.
La v1 prometía `updated_by` "usuario y área" (§8.3). El modelo guarda solo el usuario (`models.py:330-332`), y `department` vive en el usuario y se puede cambiar (`accounts/models.py:22`). Si alguien cambia de área, el historial deja de decir qué área hizo cada avance, que es la pregunta que se hace en una auditoría.

**C26 · El CI no ejecuta los controles que la entrega declara.** Severidad **Media**. OWASP A03:2025.
`check --deploy`, OSV, gitleaks y semgrep pasaron en la máquina del escritor (L12), pero `.github/workflows/ci.yml` solo corre ruff, `check`, `makemigrations --check`, `migrate` y las pruebas (`ci.yml:38-44`). Las acciones se fijan por etiqueta (`actions/checkout@v7`, `ci.yml:34`), no por SHA (`cyber-neo`, fase 6). Un retroceso en dependencias o en la configuración de producción no rompería el CI.

**C27 · Dos permisos externos siguen sin pedirse.** Severidad **Alta**.
La notificación responsable a Hound (v1 §15.6) y la autorización escrita para usar la marca en una demostración pública (D15) están pendientes. M66 publica una URL con el logotipo de la empresa.

### Ataques al bloque M54.1 que no prosperan

| ID | Ataque | Severidad | Por qué no prospera |
|---|---|---|---|
| C28 | HSTS de un año con `includeSubDomains` y `preload` desde el primer despliegue (`settings.py:70-72`) podría dejar inaccesible un subdominio que solo sirva HTTP | Info | Los hosts candidatos (servicios de contenedores y GitHub Pages) solo sirven HTTPS. Sobre el subdominio de un proveedor, la cabecera no alcanza al dominio padre, y la lista de precarga solo aplica si alguien envía el dominio. Se revisa si aparece un dominio propio |
| C29 | Una contraseña de 12 dígitos se acepta (`accounts/tests/test_password_policy.py:26`) | Info | ASVS 6.2.5 prohíbe reglas de composición. La longitud mínima y la lista de contraseñas comunes ya aplican |
| C30 | El State "simple" no escala: debería usarse una librería de máquina de estados o el patrón State completo | Baja | El flujo es lineal y ninguna etapa tiene comportamiento propio. `viewflow` es AGPLv3 y `django-fsm` está inactiva (v1 §8.2). El State completo entra cuando una etapa gane acciones propias |
| C31 | Usar un UUID como identificador público en lugar del número de guía | Baja | El cliente tiene el número de guía, no un UUID (D4). Un UUID aleatorio como clave degrada los índices (pasada 1). El rastreo público se protege con límite, 404 uniforme y campos mínimos |
| C32 | Copiar las coordenadas que muestra Hound | Baja | El informe REA (§5) recomienda no guardarlas: más datos personales sin beneficio para el cliente |
| C33 | La vista navegable de DRF muestra el `charset` | Info | Aviso 3 del verificador, aceptado (L13). No expone nada |

---

## 3. Tres pasadas de revisión de base de datos

Cada pasada adopta un rol de revisor y revisa el modelo de M54 tal como está en `aed7967`. Los roles están en `~/Desktop/recursos-agentes/`.

### Pasada 1 · Revisor de base de datos (`affaan-m/ECC/agents/database-reviewer.md`)

Lista del rol: índices en claves foráneas, tipos correctos, restricciones, mínimo privilegio, RLS, transacciones cortas, orden de bloqueo.

| ID | Hallazgo | Severidad | Evidencia | Horizonte |
|---|---|---|---|---|
| BD01 | **Mínimo privilegio sin implementar.** El docstring lo exige como mitigación de las rutas que saltan el ORM (`models.py:18-23`), pero hoy hay un único usuario de SQLite. En PostgreSQL, un rol de migraciones (DDL) separado del rol de la aplicación, y el de la aplicación sin `UPDATE` ni `DELETE` sobre `tracking_statushistory`, convierte "solo inserción" en una regla de la base y cierra la ruta de SQL directo (`models.py:12-16`) | Media | `models.py:12-23` | M66 |
| BD02 | **Supabase expone el esquema `public`.** Si D7 termina en Supabase: su API de datos publica las tablas de `public` a quien tenga la clave anónima, salvo que tengan RLS activado. Django crea sus tablas en `public`. La v0 ya pedía esquema propio y rol dedicado (#853). Comportamiento a confirmar en la documentación oficial antes de elegir | Alta, condicional | #853; `settings.py:126-133` (hoy SQLite) | M66 |
| BD03 | **Índice redundante.** Django indexa `guide_id` por ser clave foránea, y `unique_stage_per_guide (guide, stage)` ya cubre ese prefijo | Info | `models.py:327`, `:341` | Medir en M66 |
| BD04 | **`service_level` admite cadena vacía.** `blank=True` (`models.py:169-171`) deja pasar `""` por `full_clean` y por el admin, y no hay `CheckConstraint`, a diferencia de `current_stage` (`models.py:189-192`) | Baja | `models.py:169-171`, `:189-192` | M64 |
| BD05 | **`note` sin límite.** `TextField` sin tope (`models.py:334`); puede contener datos personales | Baja | `models.py:334` | M64 |
| — | Sin defecto: `BigAutoField` (`settings.py:135`); fechas con zona horaria (`USE_TZ`, `settings.py:161`), que en PostgreSQL serán `timestamptz`; orden de bloqueo consistente, `select_for_update` con `order_by("pk")` (`models.py:277-280`); transacciones cortas y sin llamadas externas dentro del bloqueo | — | Citas de la fila | — |

### Pasada 2 · Optimizador de base de datos (`msitarzewski/agency-agents/engineering/engineering-database-optimizer.md`)

Lista del rol: planes de consulta, N+1, índices parciales, paginación, migraciones reversibles, conexiones.

| ID | Hallazgo | Severidad | Evidencia | Horizonte |
|---|---|---|---|---|
| BD07 | **N+1 en la futura API.** Listar guías con su historial y su autor genera una consulta por guía si no se usa `prefetch_related("status_history")` y `select_related`. El admin ya lo evita en el historial (`admin.py:53`); la API todavía no existe | Media | `admin.py:53` | M64 |
| BD08 | **Contadores sin índice.** Los contadores de M66 agrupan por `current_stage` con `is_archived = false`. Con datos de demostración no importa; un índice parcial solo si `EXPLAIN ANALYZE` en PostgreSQL lo justifica | Baja | `models.py:172-175` | M66 |
| BD09 | **Paginación.** El orden por defecto es `-created_at` (`models.py:183`), sin índice. La lista de M64 conviene con `CursorPagination` de DRF; el índice, cuando el volumen lo pida | Baja | `models.py:183` | M64 |
| BD11 | **Lectura del historial en cada inserción.** `save_base` lee todo el historial de la guía (`models.py:377-382`); está acotado a 5 filas | Info | `models.py:377-382` | — |
| — | Sin defecto: las migraciones `tracking/0001` a `0003` solo usan `CreateModel`, `AlterField` y `AddConstraint`, que Django revierte solo; no hay `RunPython` ni `RunSQL` | — | `tracking/migrations/` | — |

### Pasada 3 · Ingeniero de confiabilidad de base de datos (`msitarzewski/agency-agents/engineering/engineering-database-reliability-engineer.md`)

Lista del rol: RPO y RTO, restauración probada, migraciones con presupuesto de bloqueo, conexiones, conmutación por falla.

| ID | Hallazgo | Severidad | Evidencia | Horizonte |
|---|---|---|---|---|
| BD12 | **El orden del historial depende del reloj de la aplicación.** El historial se ordena por `timestamp, pk` (`models.py:286`, `:380`), y `timestamp` lo pone `auto_now_add` en el servidor de aplicación (`models.py:329`). Con dos instancias con relojes desfasados, una fila posterior puede quedar antes que la anterior; la siguiente inserción falla en `_validate_history_prefix` (`models.py:70-76`) y la guía queda atascada, sin vía de reparación (C24). Con un solo proceso, como en M54, no ocurre | Media | `models.py:70-76`, `:286`, `:329`, `:380` | M64 |
| BD13 | **Sin RPO ni RTO.** SQLite dentro de un contenedor se pierde al volver a desplegar (v1 §8.9). Con datos de demostración, la restauración es `loaddata demo_guides` y ya está probada (`test_models.py:618-636`); con datos reales hacen falta `pg_dump` y una restauración ensayada | Media | `test_models.py:618-636` | M66 |
| BD14 | **Conexiones.** Un servicio que escala por petición abre conexiones por instancia y los planes gratuitos tienen tope. Hace falta `CONN_MAX_AGE` moderado y el pooler del proveedor | Media | `settings.py:126-133` (sin opciones de conexión para PostgreSQL) | M66 |
| BD15 | **Presupuesto de bloqueo en migraciones.** A escala de demostración no hace falta expandir y contraer; sí un `lock_timeout` corto en el procedimiento de M66 | Baja | — | M66 |
| — | Mitigado: los datos de demostración se cargan en un estado consistente (`test_models.py:636`) y sus guías no son secuenciales (`tracking/fixtures/demo_guides.json`) | — | Citas de la fila | — |

---

## 4. El defecto que lo mata

**M66 se publica sin un entorno de producción probado.** Base que se pausa durante la revisión (C17), límite que trata a todos los visitantes como uno solo detrás del proxy (C07), cookie CSRF con otro nombre (C14), admin sin freno (C21) y ninguna prueba en PostgreSQL (C20). Cada uno se corrige en horas; juntos convierten la única entrega que se evalúa en vivo en una apuesta. La propuesta dedica una sección a cada vista y ninguna al entorno donde todas van a correr.

---

## 5. Arreglos priorizados

1. **Versionar la propuesta y la exclusión privada** (C01, C22). La v2 entra en `docs/propuesta/`, y `docs/investigacion/privado/` pasa al `.gitignore` versionado. Ambos los ejecuta Eduardo.
2. **Decidir el entorno de M66 antes de escribir M64** (C17, BD02, BD13, BD14): host sin pausa durante la revisión, PostgreSQL con roles separados y la decisión "datos de demostración o reales".
3. **Cerrar el contrato de M64 con lo que M66 necesita** (C06, C09, C13, C15, C25, BD04, BD05, BD07, BD09, BD12): alta con historial inicial, registro de intentos rechazados, PUT idempotente, límite por guía, área copiada al historial y orden por `pk`.
4. **Freno de fuerza bruta y CI de seguridad antes de publicar** (C21, C26).
5. **Separar la ruta crítica del rediseño** (C12): las vistas que pide M66 y las tres insignias primero; las 34 restantes no bloquean M66.
6. **Reetiquetar patrones con honestidad** (C04) y actualizar los datos viejos (C02, C03, C08).
7. **Ola KPI** (C10): tiempo por etapa y alerta de ráfagas, sobre los datos que deja el punto 3.

## 6. Recursos aplicados

| Recurso | Qué aportó |
|---|---|
| Skill `abogado-del-diablo` (`~/.agents/skills/abogado-del-diablo/SKILL.md`) | Los ocho ángulos, el veredicto y el defecto que lo mata |
| `cyber-neo` (`Hainrixz/cyber-neo/skills/cyber-neo/SKILL.md`) | Rúbrica de severidad (paso 7.3), mapeo a CWE y OWASP 2025, y las fases 5 (configuración) y 6 (cadena de suministro y CI) como lista de revisión. No se ejecutó su escáner |
| Roles de revisión de base de datos | Las tres pasadas de §3 |
| roadmap.sh (`backend`: `migrations`, `transactions`, `owasp-risks`; `postgresql-dba`: `constraints`, `normalization--normal-forms`, `indexes-and-their-usecases`; `api-design`: `api-security`, `rate-limiting--throttling`, `idempotency`; `software-design-architecture`: `value-objects`) | C13 (idempotencia), C07 y C15 (límites), BD08 y BD09 (índices), BD15 (migraciones) y el objeto de valor `TrackingNumber` del blueprint |
| Big School, `Apuntes-Curso-Desarrollo-Clase-2.pdf`, pp. 9 y 15-16 | C21 (freno de fuerza bruta) y el ciclo rojo y verde del plan de pruebas |
| Engram #946, #853, #933, #939, #954, #850, #851, #1075, #1076, #809 y #810 | Reconstrucción de la propuesta, consigna de las prácticas y método de patrones |
