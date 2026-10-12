# Loop 5 · Codex: Hound Express de punta a punta, agéntico, seguro y con IA (versión 2)

**Para qué:** que Codex orqueste el proyecto completo con un equipo de agentes especializados: arma el equipo, investiga, propone, se deja destruir por el abogado del diablo, rediseña toda la web con IA y construye con SDD las prácticas M54, M64 y M66 sobre un producto real en AWS. Eduardo aprueba en tres compuertas; Claudia (Claude Code) audita cada PR.

Versión 2, escrita por Claudia el 12 de octubre de 2026. Reemplaza a la versión 1 (commit `a797d62`).

**Qué cambió respecto a la versión 1:**

- Codex no tiene red, credenciales ni escritura en `node_modules` dentro de su sandbox. Por eso Codex hace los commits locales y Eduardo corre push, npm y brew.
- Engram se usa con `mem_session_start` y `mem_save`; no hace falta ninguna "identidad de sesión".
- GGA queda activo en el repo con un modelo gratis de OpenCode.
- El plan Free de AWS entra a la terminal con `aws login`.
- **Recursos:** lo global vive en la memoria y en el grafo, y cada proyecto tiene solo sus especialistas. Los agentes de carni-mvp no se usan como plantilla.
- La fase 0 quedó con avance real (sección 3).

## 0. Roles, compuertas y quién ejecuta qué

| Rol | Quién | Modelo |
|---|---|---|
| Orquestador | Codex | `gpt-6-astra`, esfuerzo alto |
| Implementación | Subagentes de Codex | `gpt-6.1-sol`, esfuerzo medio |
| Tareas mecánicas | Subagentes de Codex | `gpt-6-luna`, esfuerzo bajo (no se puede verificar qué modelo usa realmente; riesgo aceptado) |
| Auditoría de cada PR | Claudia (Claude Code) | Opus |
| Decisiones, push, npm, brew y consola de AWS | Eduardo | — |

| Acción | Quién la ejecuta |
|---|---|
| Editar archivos, commits locales, `git merge` local | Codex (solo el orquestador corre git; los subagentes solo editan) |
| `git push`, `git fetch` con red, `npm` (cualquier comando), `brew`, `opencode run`, configuración de MCP y de AWS | Eduardo, en su terminal. Codex se lo pide en **un solo bloque de comandos** y espera la salida |
| Auditar el diff y el PR | Claudia |

**Compuertas (humano en el ciclo).** No se avanza sin el "aprobado" de Eduardo:

1. La propuesta (fin de la fase 5).
2. El rediseño completo (fin de la fase 6).
3. El producto en `pruebas`, antes de `main` (fin de la fase 8).

## 1. Contexto verificado

**Engram, proyecto `houndxpress`.** Se busca con `mem_search` por palabras del título y se abre completo con `mem_get_observation`.

| Topic | Qué tiene |
|---|---|
| `houndxpress/contexto-para-codex` | Resumen de toda la conversación y sus decisiones |
| `houndxpress/practicas-lms` y `houndxpress/m54-consigna` | Consignas, entregables y trampas de M54, M64 y M66 |
| `houndxpress/ramas-y-mapa-carni` | Cinco ramas y lecciones de carni |
| `houndxpress/propuesta-v0` y `houndxpress/mejoras-15` | Stack, lógica de negocio y las 15 mejoras |
| `houndxpress/manuales-y-recursos` | Decisión de recursos globales y los 63 repos |
| `houndxpress/recursos-gemini` | Los 23 recursos del chat de Gemini de Eduardo |
| `houndxpress/codex-sandbox-flujo`, `houndxpress/codex-engram`, `houndxpress/gentle-stack-codex` | Sandbox, Engram y stack de Gentle AI en Codex |
| `houndxpress/gga-proveedor-gratis` | GGA con modelo gratis |
| `houndxpress/herramientas-devsecops` | Herramientas instaladas y Podman |

**Hechos clave:**

- **Problema de la empresa** (PDF en `~/Desktop/houndxpress.pdf`): cinco etapas en orden estricto, cada una con su responsable. Las guías saltan pasos y se registran con fechas atrasadas: solo 31 de cada 100 siguen el orden, con 200,000 MXN de pérdidas. "Los mejores trabajos serán enviados a HOUND EXPRESS y podrán ser considerados en su bolsa de empleo".
- **Plan de Eduardo:** el rediseño de hound-express.com **es** el frontend del proyecto, porque en el curso de frontend usó un proyecto externo. El backend crece con cada práctica. Es un producto real, no un ejercicio aislado.
- **Prácticas:** M52 entregada con 100/100. Faltan M54, M64 y M66 (apéndice A).
- **Sitio actual:** el sitemap tiene 26 páginas; se replican 22, más el espejo en inglés hecho con Weglot. El rastreo llama desde el navegador al sistema interno "Sabueso" con una **llave de socio visible en el JavaScript** y arma el HTML concatenando texto.
- **Referencias:** Kakobuy (pestañas por estado, fotos de control de calidad, desglose del flete, ventana "Información logística", confirmación de recepción, chat para cobros extra) y 17TRACK (categorías de estado estándar; detectó mal una guía real).
- **Repo:** `main` tiene la M52 (etiqueta `m52`). `frontend` está en `f4ca676`, con React 19, TypeScript, Redux Toolkit, Jest, Sass con BEM, 278 pruebas y el PR #2 hacia `pruebas`. `practicas-ebac` está en `57a4831` e integra `frontend`, las reglas de las cinco ramas y la guía de AWS y MCP. `backend` y `pruebas` son iguales a `main`. Worktrees: `~/Desktop/houndxpress` (`frontend`), `~/Desktop/houndxpress-practicas` (`practicas-ebac`) y `~/Desktop/houndxpress-backend` (`backend`).
- **Entorno instalado:** aws 2.37.12 (con `aws login`), sam 1.168.0, podman 6.1.3 (máquina rootless con 4 GiB, seccomp y SELinux), trivy 0.75.0, semgrep 1.180.0, checkov 3.3.20, syft 1.54.1, cosign 3.1.3, gitleaks, docker, kubectl, gh, graphify, engram 1.10.0, gga 2.10.1 y gentle-ai 4.0.0.
- **Stack de Gentle AI en Codex:** gentle-ai, Engram, Agent Teams Lite (la sección "SDD Orchestrator" de `~/.codex/AGENTS.md` y los agentes `sdd-*`), los jueces de judgment-day y 32 skills de Gentleman. Falta GGA activo en el repo.

## 2. Reglas (no se negocian)

**Cinco ramas:**

| Rama | Rol | Cómo llega a `main` |
|---|---|---|
| `frontend` | Desarrollo del frontend | Pasa por `pruebas` |
| `backend` | Desarrollo del backend | Pasa por `pruebas` |
| `practicas-ebac` | Entorno escolar: prácticas del LMS, entregas, documentos de curso y loops | Solo el producto, filtrado al salir |
| `pruebas` | Entorno de pruebas con frontend y backend juntos | Cuando todo está en verde |
| `main` | Producto final, limpio y profesional | — |

- **Filtro al salir de `practicas-ebac`.** No pasan `docs/loops/`, las entregas y mensajes del LMS, las notas de práctica, los Word, las capturas de prácticas ni los prompts. Revisa el `git diff` del filtro.
- **El tutor mira `main` por defecto.** Cada entrega lleva el enlace a su etiqueta (`m54`, `m64`, `m66`).
- Un agente escritor por rama, y un worktree por rama.
- **Sandbox de Codex:** nunca `npm ci` (dejó `node_modules/.bin` vacío dos veces), nunca `--no-verify`, nunca leer credenciales, nunca `--force`. Una rama publicada se sincroniza con merge, nunca con rebase.
- Conventional Commits: tipo en inglés, descripción en español. PR: título en español y cuerpo que abre con una línea de resumen en inglés.
- Nada se da por hecho sin la salida del comando. Separa lo **ejecutado**, lo **reportado** y lo **pendiente**. Todo dato externo lleva fuente. No se inventan comandos ni paquetes.
- **Seguridad primero:** ningún secreto en el navegador ni en el repo, mínimo privilegio, y las listas de roadmap.sh (API Security Best Practices y AWS Best Practices).
- **Engram:** al empezar cada sesión, `mem_session_start` con id `codex-houndxpress-<fecha>` y project `houndxpress`. Después, `mem_save` con ese project y ese session_id, siguiendo el protocolo de `~/.codex/AGENTS.md`. Si falla, pega el error literal.
- **GGA:** usa siempre la ruta `/opt/homebrew/bin/gga`. Si el hook no llega al proveedor desde el sandbox, avísale a Eduardo, que correrá `gga run --pr-mode --diff-only` antes del push.
- **gentle-ai:** no corras `gentle-ai sync`. Se actualizó a 4.0.0 y Eduardo revisará los cambios antes.
- Migración en sitio sobre lo que ya existe (skill `migracion-incremental`). Construcción con SDD.
- Errores ya cometidos: sección "Errores que ya cometimos" de `CLAUDE.md`.
- Una pregunta a la vez a Eduardo.

## 3. Fase 0 · Preparar el entorno (estado al 12 de octubre)

**Hecho, con evidencia:**

- ✅ Worktree de `practicas-ebac` creado; `frontend` integrado con merge (`23399cc`).
- ✅ Reglas de cinco ramas y de separación de operaciones en `CLAUDE.md` y `AGENTS.md` de `practicas-ebac` y `frontend`.
- ✅ `docs/entorno/FASE-0-AWS-MCP.md`: guía de MCP y de AWS (MFA, presupuesto, Free frente a Paid, Organizations).
- ✅ Push de `frontend` y `practicas-ebac`. Los tres worktrees están limpios.
- ✅ Puertas del frontend en verde (las corrió Eduardo). Backend: 13 pruebas y ruff OK.
- ✅ Las 8 herramientas instaladas y Podman listo.
- ✅ `nemotron-3-ultra-free` y `big-pickle` responden en OpenCode.

**Pendiente:**

1. `AGENTS.md` de `frontend` apunta a `docs/loops/05-LOOP-CODEX.md`, que solo existe en `practicas-ebac`. Cambia la referencia a `git show origin/practicas-ebac:docs/loops/05-LOOP-CODEX.md`.
2. Llevar `CLAUDE.md` y `AGENTS.md` a `backend`, sin material escolar.
3. Ruta del plan Free en la guía de AWS: `aws login` con un usuario de IAM con MFA y permisos mínimos (credenciales temporales que se renuevan solas, sin llaves permanentes ni Organizations). Verifícalo en la documentación oficial.
4. MCP: Eduardo aplica la configuración de Playwright y de AWS Documentation. Después de la primera prueba exitosa se fija la versión exacta en lugar de `@latest`.
5. GGA: en `practicas-ebac`, `.gga` con `PROVIDER="opencode:opencode/nemotron-3-ultra-free"` (respaldo: `opencode/big-pickle`), `RULES_FILE="AGENTS.md"`, `STRICT_MODE="true"` y `TIMEOUT="300"`. Revisa `*.py`, `*.ts`, `*.tsx`, `*.js`, `*.jsx` y `*.scss`, y excluye las pruebas, `*.d.ts` y `backend/*/migrations/*`. Haz commit, llévalo a `frontend` y `backend`, e instala el hook con `gga install`: los worktrees comparten `.git/hooks`.
6. `gentle-ai skill-registry refresh` en `houndxpress-practicas` y en `houndxpress-backend`.
7. Prueba de Engram: guarda el cierre de la fase 0 en el topic `houndxpress/fase-0` y reporta el ID que devuelve.
8. Copia este archivo a `docs/loops/05-LOOP-CODEX.md` en `practicas-ebac` y haz commit.
9. **Examen final:** tabla de aprobado o reprobado, con la salida de cada punto. **Sin "aprobado" de Eduardo no hay fase 1.**

## 4. Fase 1 · Recursos y equipo: lo global y lo del proyecto

**Decisión de Eduardo.** Los recursos viven de forma **global**, en la memoria y en el grafo. Cada proyecto tiene **solo los especialistas que necesita**: así se evita sobrecargar los proyectos y todo queda más ordenado. **Los agentes de carni-mvp no se usan como plantilla**, porque traen supuestos de Supabase, Tailwind y BuildAds.

**4.1 · Capa global.** Eduardo abre `~/Desktop/recursos-agentes` como un proyecto aparte en Codex, para que puedas escribir ahí.

1. Escribe `CATALOGO.md` con una fila por recurso: categoría, para qué sirve, cuándo usarlo, licencia y ruta. Incluye:
   - los 63 repos clonados;
   - los recursos del chat de Gemini que no están clonados (the-architect, OpenSpec, claude-webkit, hallmark, cult-ui, agente-pagokit, prebuiltui.com, la guía del MCP de Supabase);
   - `msitarzewski/agency-agents` (pídele a Eduardo que lo clone);
   - roadmap.sh: los temas de `github.com/kamranahmedse/developer-roadmap`, en `roadmaps/<id>/content/*.md` (aws 98, devsecops 93, kubernetes 66, devops 138, system-design 132, software-design-architecture 84, backend 154, django 110, docker 56, api-design 99, terraform 109 y cyber-security 289), más las guías `roadmap.sh/api-security-best-practices` y `roadmap.sh/aws-best-practices`;
   - itsfree.dev: la selección del apéndice E, completada en la fase 2.
2. Corre Graphify sobre esa carpeta para tener el grafo global de recursos.
3. Guarda en Engram, con alcance personal, el resumen del catálogo y el conocimiento de modelos de IA (observaciones #785, #788 y #830). Así sirve para cualquier proyecto.
4. **Skills globales de conocimiento general**, que no dependen del proyecto. Antes de crear una, revisa si ya existe en `~/.agents/skills`, `~/.codex/skills` o `.atl/skill-registry.md`:

| Skill | Fuente |
|---|---|
| `aws-serverless-seguro` | Roadmap aws y AWS Best Practices |
| `devsecops-pipeline` | Roadmap devsecops, más cyber-neo, agentshield, agent-scan y GGA |
| `contenedores-seguros` | Roadmaps docker y kubernetes, más Podman rootless |
| `arquitectura-limpia` | Roadmap software-design-architecture y Refactoring Guru |
| `django-drf-seguro` | Roadmaps django, api-design y backend; API Security |
| `ia-asistente-seguro` | Roadmap backend (sección de IA) y OWASP Top 10 para LLM |

5. **Roles universales a nivel usuario.** Ya existen como skills: investigador, the-architect, abogado-del-diablo y security-review. Créales agentes globales solo si faltan.

**4.2 · Capa del proyecto (Hound Express).** Solo lo específico de este proyecto:

| Pieza | Tipo | Contenido |
|---|---|---|
| `hound-dominio` | Skill | Etapas, eventos, estado público, contadores y antifraude (apéndice B) |
| `ebac-practicas-hound` | Skill | M54, M64 y M66: trampas, entregables, etiquetas, mensaje del LMS y filtro (apéndice A) |
| `system-design-logistica` | Skill | Idempotencia, límites de peticiones, colas, eventos y strangler fig, aplicados a guías |
| `backend-dev` | Agente | Django y DRF de las prácticas |
| `frontend-dev` | Agente | React, TypeScript, Sass con BEM y Redux; migración en sitio |
| `disenador-ui` | Agente | Pencil, impeccable, frontend-design, hallmark y open-design |
| `aws-devsecops` | Agente | IaC, pipeline y endurecimiento del stack del apéndice C |
| `qa-integrador` | Agente | Pruebas de punta a punta e integración en `pruebas` |
| `redactor-lms` | Agente | Mensajes y entregables del LMS, y el filtro escolar |

Los agentes van en el formato de `~/.codex/agents/` (toma los existentes como ejemplo). Cada uno dice cuándo usarlo, qué recibe, qué entrega, qué nunca hace y cómo se verifica.

**4.3 · Enrutamiento.** Una tabla "tarea → agente → skills → recurso global (ruta)" en `AGENTS.md` del proyecto. Ejemplos:

- modelos y SQL → `backend-dev` con `django-drf-seguro` y supabase-postgres-best-practices;
- pantallas → primero `disenador-ui`, después `frontend-dev`;
- nube o pipeline → `aws-devsecops`;
- cualquier dato externo → primero el investigador.

**Cierre de la fase:** una tarea de prueba por agente, un PR en `practicas-ebac` y la auditoría de Claudia.

## 5. Fase 2 · Investigación (investigadores en paralelo)

Entrega en `docs/investigacion/`, con fuentes:

1. El sitio actual completo: las 26 páginas, sus flujos, el rastreo con Sabueso y sus fallas.
2. Comparativa: Kakobuy, 17TRACK, AfterShip, DHL, FedEx, Estafeta y 99minutos.
3. Las consignas del LMS y el PDF, para confirmar o refutar el apéndice A.
4. AWS: confirmar en las páginas oficiales los datos del apéndice C.
5. itsfree.dev: completar el apéndice E (faltan auth, email, monitorización, CI/CD, storage, APIs y analítica) y verificar cada capa gratis.
6. Los recursos del catálogo global que aplican a cada fase.

## 6. Fase 3 · Propuesta del arquitecto, versión 1

Parte de `houndxpress/propuesta-v0`, de las 15 mejoras (apéndice F), del apéndice C y de la investigación. Escribe `docs/propuesta/01-arquitecto-v1.md`: alcance por práctica y por entrega, modelo de datos, API, integración, AWS, DevSecOps, IA, mapa del rediseño, riesgos, estimación y olas de mejoras.

## 7. Fase 4 · El abogado del diablo juzga TODO

Ataca la propuesta v1, las 15 mejoras, la investigación de Claudia (verificando cada dato), el código y los documentos actuales, la idea misma (¿es demasiado para las prácticas y el calendario?), AWS y sus costos, y la seguridad. Por objeción: supuesto que rompe, evidencia, consecuencia y confianza. Escribe `docs/propuesta/02-abogado.md`.

## 8. Fase 5 · Propuesta del arquitecto, versión 2 → COMPUERTA 1

Un veredicto por objeción (se atiende, se reduce o se descarta), con su razón, en `docs/propuesta/03-arquitecto-v2.md`. **Eduardo aprueba la propuesta.**

## 9. Fase 6 · Rediseño completo con IA → COMPUERTA 2

`disenador-ui` trabaja con Pencil, open-design y referencias de imágenes de ChatGPT, por lotes de una o dos pantallas. Cubre las 22 páginas, el espejo en inglés si entra, el rastreo, el panel, el centro de incidencias, el asistente de IA y las mejoras aprobadas. Cada pantalla con componentes BEM, sus estados (vacío, cargando, error y alerta), vistas en 390 y 1440 px y contraste AA. Se entregan `DESIGN.md` y los tokens. **Eduardo aprueba el rediseño completo.**

## 10. Fase 7 · Construcción con SDD

Cada cambio sigue el ciclo explore → propose → spec → design → tasks → apply → verify → archive (`gentle-ai sdd-status`):

| # | Cambio | Rama | Cierre |
|---|---|---|---|
| 1 | M54: modelos, migraciones, admin, datos de demostración, pruebas y el SQL de `sqlmigrate` | `practicas-ebac` | Etiqueta `m54` y mensaje del LMS listo |
| 2 | M64: API en las rutas de la consigna, permisos, throttling, Postman y pruebas | `practicas-ebac` | Etiqueta `m64` |
| 3 | Infraestructura de AWS y pipeline DevSecOps | `backend` (IaC) | Stack de pruebas desplegado |
| 4 | Rediseño implementado por piezas | `frontend` | Puertas y capturas |
| 5 | M66: Axios, Redux, publicación en AWS y README por cada parte | `practicas-ebac` | Etiqueta `m66` y URL publicada |
| 6 | Mejoras aprobadas en olas, incluido el asistente de IA | `frontend` y `backend` | Cierre por ola |

Cada pieza pasa sus puertas, GGA, la revisión de seguridad y la auditoría de Claudia. Los mensajes del LMS los envía Eduardo.

## 11. Fase 8 · Pruebas, filtro y `main` → COMPUERTA 3

En `pruebas` corren la suite completa, las pruebas de punta a punta con Playwright, el DAST (ZAP baseline) contra el stack de pruebas y `docker compose`. Se aplica el filtro de `practicas-ebac`. **Eduardo revisa el producto.** Después va el PR de `pruebas` a `main`.

## 12. Fase 9 · Corrección y mejora continua

Lo que Eduardo pida después de revisar sigue el mismo ciclo.

---

## Apéndice A · Las prácticas

| | M54 · Entregable 10 | M64 · Entregable 11 | M66 · Entregable 12 |
|---|---|---|---|
| Pide | `models.py` con `Guide`, `StatusHistory` y `User` | Viewsets; en `urls.py`, el prefijo `api/` y las rutas `crear-guia`, `actualizar-guia/ID`, `obtener-guia/ID` y `eliminar-guia/ID` (opcional); probar con Postman | Axios con URL base; registro por POST con validaciones iguales en ambos lados; panel con activas, en tránsito y entregadas que se actualiza solo; lista con PUT; componentes sincronizados; errores claros; pruebas del flujo |
| Se entrega | `models.py` o los scripts SQL, adjuntos | ZIP o URL del repo | URL de la app publicada y el repo |
| Tiempo y revisión | 120 min, 1 día | 160 min, 1 día | 60 min, 5 días |
| Trampas | `id = IntegerField()` da el error E004; `AutoDateTimeField` no existe en Django; `guideId` como entero no es llave foránea; en un `trackingNumber` de 15 no entra ningún número real (16 dígitos que empiezan con 21, o 22 alfanuméricos); un `password` de 20 solo guarda texto plano (Django cifra en 89); `createdAt` como `DateField` pierde la hora | IDs consecutivos dejan recorrer las guías (usar UUID o número de guía); solo la etapa siguiente, dentro de una transacción; borrar choca con el historial (archivar); el cliente no manda fechas | Hoy se usa `fetch` (pasar a Axios); contadores sin definir; primera práctica que exige publicar; el PDF pide además un README para correr en local |
| Base en carni-mvp | M14: TimeStampedModel, `bulk_create`, fixture, borrado solo de los datos de demostración | M13: CRUD protegido en el servidor | Clases de Axios de React III y el chatbot de la M44 |

## Apéndice B · Lógica de negocio

- **Etapas:** Recepción de carga (Aduana) → Vehículo cargado (Aduana) → Vehículo liberado (Operaciones) → Vehículo en camino (Seguridad) → Carga entregada (KAM). Solo se avanza a la siguiente, la fecha la pone el servidor y el historial no se edita. Los códigos (`cargo_received`, `vehicle_loaded`, `vehicle_released`, `vehicle_in_transit`, `cargo_delivered`) caben en 20 caracteres.
- **Eventos:** lo que pasa dentro de cada etapa, con ubicación, modo de transporte (terrestre, aéreo o marítimo) y descripción.
- **Estado público:** las categorías que ve el cliente, al estilo de 17TRACK.
- **Contadores de la M66:** activas = etapas 1 a 4, sin las archivadas; en tránsito = etapa 4; entregadas = etapa 5; con alerta = incidencias abiertas.

## Apéndice C · AWS, versión 0 (para que el abogado la ataque)

| Pieza | Propuesta | Qué verificar |
|---|---|---|
| Frontend | S3 privado más CloudFront, siempre gratis hasta 1 TB y 10 millones de peticiones al mes | Página oficial |
| Backend | Django en una imagen de contenedor sobre Lambda con Lambda Web Adapter: se enciende con cada petición. Lambda es siempre gratis hasta 1 millón de peticiones y 400,000 GB-s al mes | Repositorio `awslabs/aws-lambda-web-adapter` |
| Un solo dominio | CloudFront manda `/` a S3 y `/api/*` a Lambda | OAC con Lambda exige el hash SHA-256 del cuerpo en POST y PUT. Alternativas: API Gateway HTTP o una cabecera secreta |
| Base de datos | Postgres: Supabase (gratis) o RDS con créditos. RDS ya no es gratis 12 meses | Lambda en una VPC pierde la salida a internet salvo con NAT Gateway, que cuesta cada mes |
| Acceso de Eduardo | Plan Free: `aws login` con un usuario de IAM con MFA. Plan Paid: IAM Identity Center | Crear Organizations convierte la cuenta en Paid |
| Secretos | SSM Parameter Store, con valores SecureString | — |
| IA | Amazon Bedrock con un rol de IAM, sin llave de API. Para desarrollo, respaldos gratis | Precio por token |
| IaC | SAM o CDK en Python | — |
| CI/CD | GitHub Actions con OIDC hacia AWS, sin llaves de larga duración | — |
| Seguridad | IAM con mínimo privilegio, MFA, CloudTrail, Budgets (alertas en 1 y 5 USD, que no son un límite duro), cabeceras en CloudFront y Turnstile | — |
| Contenedores | Imagen endurecida (sin root, base mínima, escaneada y firmada). Podman rootless en local. Kubernetes no va a producción por ahora | Precio de EKS |

## Apéndice D · Pipeline DevSecOps

GGA con modelo gratis antes de cada commit → lint y pruebas → secretos (gitleaks) → SAST (Semgrep y Bandit) → SCA (npm audit, pip-audit y Dependabot) → imagen (Trivy) → SBOM (Syft) y firma (Cosign) → IaC (Checkov) → despliegue al stack de pruebas → DAST (ZAP baseline) → aprobación → producción. Las cabeceras se revisan con Mozilla Observatory, y la configuración de los agentes y de los MCP con agentshield y agent-scan.

## Apéndice E · Recursos gratis (itsfree.dev)

| Categoría | Candidatos | Para qué |
|---|---|---|
| Hosting | Cloudflare (Turnstile) y GitHub (Actions) | Verificación anti-bots y CI |
| Datos | Supabase, Neon y Upstash | Postgres, y caché o límites de peticiones |
| IA | Groq, Google AI Studio, Hugging Face, NVIDIA NIM y los modelos gratis de OpenCode | Respaldos del asistente y de GGA |
| Seguridad | GitGuardian, Socket, Mozilla Observatory y Have I Been Pwned | Secretos, dependencias, cabeceras y contraseñas filtradas |
| Pendiente | Auth, email, monitorización, CI/CD, storage, APIs y analítica | Fase 2 |

## Apéndice F · Las 15 mejoras (hipótesis para el abogado del diablo)

Se suman al asistente de IA, el widget flotante de la M44 de carni evolucionado. El detalle está en `houndxpress/mejoras-15`.

1. Centro de incidencias por guía.
2. Rastreo enriquecido.
3. Notificaciones (correo, WhatsApp con whatsapp-agentkit o aviso del navegador).
4. Prueba de entrega.
5. Indicador de cumplimiento y antifraude.
6. Cotizador con costo total.
7. Portal del vendedor: CSV, API y webhooks.
8. Logística inversa.
9. Documentos aduanales digitales.
10. Etiqueta QR y escaneo desde el celular.
11. Roles por área con MFA y bitácora de auditoría.
12. Copiloto de IA para el personal.
13. Entrega estimada predictiva.
14. Verificador antiestafas.
15. Pago en línea de cobros extra, en modo de prueba (agente-pagokit).

## Apéndice G · Cuántas mejoras más hay

Claudia estima unas 25 mejoras útiles adicionales, repartidas entre cliente, vendedor, operación, seguridad, datos y plataforma. No están escritas: el arquitecto decide si se investigan.
