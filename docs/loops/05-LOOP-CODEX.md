# Loop 5 · Codex: Hound Express de punta a punta, agéntico, seguro y con IA

**Para qué:** que Codex orqueste el proyecto completo con un equipo de agentes especializados. Arma el equipo, investiga, propone, deja que el abogado del diablo destruya la propuesta, rediseña toda la web con IA y construye con SDD las prácticas M54, M64 y M66 sobre un producto real en AWS.

Eduardo aprueba en tres compuertas. Claudia (Claude Code) audita cada PR. Este loop reemplaza al loop 4 para Codex. Lo escribió Claudia el 12 de octubre de 2026 a partir de toda la conversación con Eduardo; el detalle vive en Engram, proyecto `houndxpress`.

## 0. Roles y compuertas

| Rol | Quién | Modelo |
|---|---|---|
| Orquestador | Codex | `gpt-6-astra`, esfuerzo alto |
| Implementación | Subagentes de Codex | `gpt-6.1-sol`, esfuerzo medio |
| Tareas mecánicas | Subagentes de Codex | `gpt-6-luna`, esfuerzo bajo |
| Auditoría final de cada PR | Claudia (Claude Code) | Opus |
| Decisiones | Eduardo | — |

**Compuertas (humano en el ciclo).** No se avanza sin el "aprobado" de Eduardo:

1. La propuesta (fin de la fase 5).
2. El rediseño completo (fin de la fase 6).
3. El producto en `pruebas`, antes de `main` (fin de la fase 8).

## 1. Contexto verificado

**Engram, proyecto `houndxpress`** (`mem_search` por topic y `mem_get_observation` para el texto completo):

| Topic | Qué tiene |
|---|---|
| `houndxpress/contexto-para-codex` | Resumen de toda la conversación y sus decisiones |
| `houndxpress/practicas-lms` | M54, M64 y M66: consignas, entregables y trampas |
| `houndxpress/m54-consigna` | Los 6 errores de la consigna M54, verificados con Django 5.2 |
| `houndxpress/ramas-y-mapa-carni` | Cinco ramas y lo que se reutiliza de carni-mvp |
| `houndxpress/propuesta-v0` | Stack, lógica de negocio en 3 capas y las primeras 5 mejoras |
| `houndxpress/mejoras-15` | Las 15 mejoras propuestas |
| `houndxpress/hosting-opciones` | Opciones de hosting evaluadas antes de elegir AWS |
| `houndxpress/auditoria-fase0-codex` | EPERM del sandbox y vulnerabilidades solo de desarrollo |

**Hechos clave:**

- **Problema de la empresa** (PDF en `~/Desktop/houndxpress.pdf`): cinco etapas en orden estricto, cada una con su responsable. Las guías "saltan pasos para luego ponerlos con fechas posteriores": solo 31 de cada 100 siguen el orden, con 200,000 MXN de pérdidas. El PDF dice: "Los mejores trabajos serán enviados a HOUND EXPRESS y podrán ser considerados en su bolsa de empleo".
- **Plan de Eduardo:** en el curso de frontend usó un proyecto externo, así que el rediseño de hound-express.com **es** el frontend del proyecto. El backend crece con cada práctica. Es un producto real, no un ejercicio aislado, y debe superar con creces lo que esperan los tutores y la empresa.
- **Prácticas:** M52 entregada con 100/100 (el tutor sugiere que el README explique cómo arrancar cada parte). Faltan M54, M64 y M66 (apéndice A).
- **Sitio actual:** el sitemap tiene 26 páginas; se replican 22, más el espejo en inglés hecho con Weglot. El rastreo llama **desde el navegador** al sistema interno "Sabueso" (`ws_pods.hound-express.com/Sabueso/ws/deliveryServices/trackOrder`) con una **llave de socio visible en el JavaScript** y arma el HTML concatenando texto. Muestra fecha, descripción y ubicación (con enlace a Google Maps), permite rastreo múltiple y usa los estados Recolectado, Tránsito, Entregado y No encontrado.
- **Referencias:** Kakobuy (pestañas por estado con contador, fotos de control de calidad, desglose del flete, ventana "Información logística" con eventos y hora de sincronización, confirmación de recepción, chat de soporte para cobros extra) y 17TRACK (categorías Info recibida, En tránsito, En reparto, Entregado, Alerta y Expirado; detectó mal el país de una guía real y no la encontró).
- **Repo:** `main` tiene la M52 (etiqueta `m52`). `frontend` tiene React 19 + TypeScript + Vite + Redux Toolkit + Jest + Sass con BEM (278 pruebas), Docker, `docs/diseno` y `docs/loops`, con el PR #2 hacia `pruebas`. `backend` y `pruebas` son iguales a `main`. `practicas-ebac` es nueva: sale de `frontend` y trae este loop. Codex tiene 2 commits locales sin subir en `frontend` (9262db6 y 6a71498).
- **Entorno:** instalados Docker, kubectl, gitleaks, gh, graphify, engram, scrapling y opencode. Faltan aws, sam o cdk, podman, trivy, semgrep, checkov, syft y cosign. Los MCP de Codex son context7, engram, pencil, node_repl y omniroute; faltan Playwright y AWS. Codex tiene `~/.codex/agents/`, una sección `[agents]` en `config.toml`, `multi_agent = true` y `max_threads = 4`.

## 2. Reglas (no se negocian)

**Cinco ramas:**

| Rama | Rol | Cómo llega a `main` |
|---|---|---|
| `frontend` | Desarrollo del frontend | Pasa por `pruebas` |
| `backend` | Desarrollo del backend | Pasa por `pruebas` |
| `practicas-ebac` | Entorno escolar: prácticas del LMS, entregas, documentos de curso y loops | Solo el producto, filtrado al salir |
| `pruebas` | Entorno de pruebas con frontend y backend juntos | Cuando todo está en verde |
| `main` | Producto final, limpio y profesional | — |

- **Filtro al salir de `practicas-ebac`.** No pasan `docs/loops/`, las entregas y mensajes del LMS, las notas de práctica, los Word, las capturas de las prácticas ni los prompts. Pasan el código y la documentación escrita en tono de producto. Revisa el `git diff` del filtro: en carni, copiar ramas con `git checkout main -- .` reintrodujo archivos borrados.
- **El tutor mira `main` por defecto.** En carni rechazaron la M44 porque el chatbot estaba solo en `practicas-ebac`. Cada entrega lleva el enlace a su etiqueta (`m54`, `m64`, `m66`), como se hizo con `m52`.
- Un agente por rama, y una carpeta (worktree) por rama.
- **Solo el orquestador corre git.** npm y el git que usa red se corren fuera del sandbox: dentro, `npm ci` deja `node_modules` a medias. Si el push se traba en el llavero: `git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push`.
- `git fetch` y rebase antes de cada push. Nunca `--force`. Conventional Commits: tipo en inglés, descripción en español. PR: título en español y cuerpo que abre con una línea de resumen en inglés.
- Nada se da por hecho sin la salida del comando. Cada dato externo lleva fuente. No se inventan comandos ni nombres de paquetes: se verifican con la skill `investigador`.
- **Seguridad primero:** ningún secreto en el navegador ni en el repo, mínimo privilegio, y las listas de roadmap.sh (API Security Best Practices y AWS Best Practices) como base.
- Migración en sitio sobre lo que ya existe (skill `migracion-incremental`). Construcción con SDD.
- Errores ya cometidos: sección "Errores que ya cometimos" de `CLAUDE.md`.
- Una pregunta a la vez a Eduardo.

## 3. Fase 0 · Preparar Codex y ponerlo a prueba

1. **Sincroniza.** Sube tus commits 9262db6 y 6a71498 a `frontend`. Crea la carpeta de la rama escolar: `git worktree add ../houndxpress-practicas practicas-ebac`.
2. **Primer commit en `practicas-ebac`.** Actualiza `CLAUDE.md` (sección Ramas: cinco ramas y el filtro) y `AGENTS.md` (Codex lee este loop). Después lleva esos dos cambios a `frontend` y `backend`.
3. **Instala lo que falta.** Verifica cada comando en la documentación oficial antes de correrlo: AWS CLI v2, AWS SAM CLI o CDK (lo decide el arquitecto), Podman, Trivy, Semgrep, Checkov, Syft y Cosign. Regístralos en `docs/STACK_HOUND_EXPRESS.md`.
4. **MCP.** Agrega Playwright y los servidores de AWS que hagan falta (la lista oficial está en `github.com/awslabs/mcp`). Conserva engram, pencil y context7.
5. **AWS.** Los pasos de consola los hace Eduardo: tú le das la guía y esperas. Incluyen MFA en la cuenta raíz y ninguna llave de acceso para ella, un usuario de IAM Identity Center con `aws configure sso`, alertas de AWS Budgets en 1 y 5 USD, y la región. **Eduardo decide entre el plan Free y el Paid:** el Free cierra la cuenta a los 6 meses, o al agotar los créditos, si no se actualiza.
6. **Examen de Codex.** Una tabla de aprobado o reprobado, con la salida pegada:
   - un subagente `gpt-6-luna` confirma qué modelo usó;
   - las puertas completas del frontend y del backend, corridas fuera del sandbox;
   - un resumen en 3 líneas del topic `houndxpress/practicas-lms` de Engram;
   - `graphify update .` y una consulta al grafo;
   - un push a `practicas-ebac` sin que se trabe.

   Si algo reprueba, avísale a Eduardo antes de seguir.

## 4. Fase 1 · Arma el equipo: agentes, subagentes y skills

Los creas tú, Codex. Claudia no los crea.

**Fuentes:**

| Fuente | Qué aporta |
|---|---|
| `github.com/kamranahmedse/developer-roadmap`, carpeta `roadmaps/<id>/content/*.md` | Un archivo por tema. aws (98 temas), devsecops (93), kubernetes (66), devops (138), system-design (132), software-design-architecture (84), backend (154), django (110), docker (56), api-design (99), terraform (109) y cyber-security (289) |
| `roadmap.sh/api-security-best-practices` y `roadmap.sh/aws-best-practices` | Listas de control. Por ejemplo: "Prefer using UUID over auto-increment IDs" y "Set up granular billing alerts" |
| Dashboard de Eduardo en roadmap.sh | Lo que ya sigue: Frontend, Backend, Full Stack, DevOps, SQL, JavaScript y TypeScript |
| `github.com/msitarzewski/agency-agents` (licencia MIT) | Plantillas de agentes especializados |
| `~/.agents/skills` (118), `~/.codex/skills` (32), `.atl/skill-registry.md` (117) y las skills `find-skills` y `skill-creator` | Skills que ya existen. Reutiliza antes de crear |

**Skills a crear.** Formato `SKILL.md`, guardadas en el repo y enlazadas a los directorios de Codex, OpenCode y Claude:

| Skill | Contenido | Fuentes |
|---|---|---|
| `hound-dominio` | Etapas, eventos, estado público, contadores, reglas y antifraude | Apéndice B y el PDF |
| `ebac-practicas-hound` | M54, M64 y M66: consignas, trampas, entregables, etiquetas, mensaje del LMS y filtro | Apéndice A |
| `django-drf-seguro` | Modelos, migraciones, viewsets en las rutas exactas, permisos, throttling, UUID públicos, transacciones, historial inmutable y pruebas | Roadmaps django, api-design y backend; API Security |
| `aws-serverless-seguro` | La arquitectura del apéndice C, IAM, Budgets, SSM, CloudFront, Lambda y las trampas de costo | Roadmap aws y AWS Best Practices |
| `devsecops-pipeline` | Modelo de amenazas (STRIDE), SAST, SCA, secretos, IaC, contenedores, DAST, SBOM y respuesta a incidentes | Roadmap devsecops |
| `contenedores-seguros` | Dockerfile endurecido, Podman sin root, escaneo, firma, y cuándo sí y cuándo no usar Kubernetes | Roadmaps docker y kubernetes |
| `arquitectura-limpia` | SOLID, arquitectura en capas, hexagonal y screaming, y DDD del dominio logístico | Roadmap software-design-architecture |
| `system-design-logistica` | Idempotencia, límites de peticiones, colas, trabajos en segundo plano, caché, eventos y strangler fig | Roadmap system-design |
| `ia-asistente-seguro` | Asistente con herramientas, OWASP Top 10 para LLM, pruebas de inyección de prompt y control de costos | Roadmaps backend y devsecops |

**Agentes y subagentes a crear.** En el formato de `~/.codex/agents/` y de la sección `[agents]` de `config.toml`; toma los existentes como ejemplo:

| Agente | Modelo | Skills | Hace | Nunca hace |
|---|---|---|---|---|
| `investigador` | luna o sol | investigador, scrapling-official, context7 | Investiga con fuentes | Decidir ni escribir código |
| `arquitecto` | astra | the-architect, arquitectura-limpia, system-design-logistica | El blueprint | Código |
| `abogado-del-diablo` | astra | abogado-del-diablo | Atacar todo | Validar ni suavizar |
| `disenador-ui` | sol | MCP de Pencil, impeccable, frontend-design, hallmark | Rediseño por lotes | Código de producción |
| `frontend-dev` | sol | react-19, typescript, migracion-incremental | Piezas del frontend | Tocar el backend |
| `backend-dev` | sol | django-drf-seguro, hound-dominio, ebac-practicas-hound | Django y las prácticas | Tocar el frontend |
| `aws-devsecops` | astra para diseñar, sol para implementar | aws-serverless-seguro, devsecops-pipeline, contenedores-seguros | IaC, pipeline y endurecimiento | Poner llaves en el repo |
| `qa-integrador` | sol | playwright, pytest | Pruebas de integración y de punta a punta en `pruebas` | Saltarse puertas |
| `auditor-seguridad` | astra | security-review, devsecops-pipeline | Revisión de seguridad antes de cada PR | Aprobar sin evidencia |
| `redactor-lms` | luna | ebac-practicas-hound | Mensajes y entregables del LMS, y el filtro escolar | Publicar en el LMS: eso lo hace Eduardo |

**Enrutamiento** (así sabe el orquestador a quién llamar): una tabla "tarea → agente → skills" en `AGENTS.md`. Ejemplos:

- modelos y SQL → `backend-dev` con `django-drf-seguro` y supabase-postgres-best-practices;
- cualquier pantalla → primero `disenador-ui`, después `frontend-dev`;
- nube o pipeline → `aws-devsecops`;
- cualquier dato externo → primero `investigador`.

**Cierre de la fase:** una tarea de prueba por agente, un PR en `practicas-ebac` y la auditoría de Claudia.

## 5. Fase 2 · Investigación (investigadores en paralelo)

Entrega en `docs/investigacion/`, con fuentes:

1. **Sitio actual completo:** las 26 páginas, sus flujos, y el rastreo con Sabueso y sus fallas de seguridad.
2. **Comparativa:** Kakobuy, 17TRACK, AfterShip, DHL, FedEx, Estafeta y 99minutos.
3. **Prácticas:** relee las consignas del LMS y el PDF, y confirma o refuta el apéndice A.
4. **AWS:** confirma en las páginas oficiales los datos del apéndice C (créditos, capa siempre gratis, precios, Lambda Web Adapter y OAC).
5. **itsfree.dev:** completa la selección del apéndice E. Claudia revisó hosting, datos, IA y seguridad; faltan auth, email, monitorización, CI/CD, storage, APIs y analítica. Verifica cada capa gratis.
6. **roadmap.sh:** los temas que el proyecto todavía no cubre.

## 6. Fase 3 · Propuesta del arquitecto, versión 1

Parte del topic `houndxpress/propuesta-v0`, de las 15 mejoras (apéndice F), del apéndice C y de la investigación. Escribe `docs/propuesta/01-arquitecto-v1.md` con: el alcance por práctica y por entrega, el modelo de datos (M54 más extensiones), la API (M64), la integración (M66), la arquitectura en AWS, el DevSecOps, la IA, el mapa del rediseño, los riesgos, la estimación y qué mejoras entran en cada ola.

## 7. Fase 4 · El abogado del diablo juzga TODO

Ataca todo esto:

- la propuesta v1;
- las 15 mejoras: cuáles sobran, cuáles son inseguras y cuáles no caben en el tiempo;
- la investigación de Claudia, verificando cada dato;
- el código y los documentos actuales del repo;
- la idea misma: ¿es demasiado para las prácticas y el calendario?;
- AWS y sus costos;
- la seguridad.

Formato por objeción: supuesto que rompe, evidencia, consecuencia y confianza. Escribe `docs/propuesta/02-abogado.md`.

## 8. Fase 5 · Propuesta del arquitecto, versión 2 → COMPUERTA 1

Un veredicto por objeción (se atiende, se reduce o se descarta), cada uno con su razón, en `docs/propuesta/03-arquitecto-v2.md`. **Eduardo aprueba la propuesta.**

## 9. Fase 6 · Rediseño completo con IA → COMPUERTA 2

`disenador-ui` trabaja con Pencil (y con imágenes de ChatGPT como referencia), por lotes de una o dos pantallas, como en el loop 1. Cubre las 22 páginas del sitemap, el espejo en inglés si entra, el rastreo, el panel, el centro de incidencias, el asistente de IA y las mejoras aprobadas. Cada componente tiene nombre BEM, sus estados (vacío, cargando, error y alerta), vistas en 390 y 1440 px y contraste AA. Se entregan `DESIGN.md` y los tokens. **Eduardo aprueba el rediseño completo.**

## 10. Fase 7 · Construcción con SDD

Cada cambio sigue el ciclo explore → propose → spec → design → tasks → apply → verify → archive, en este orden:

| # | Cambio | Rama | Cierre |
|---|---|---|---|
| 1 | M54: modelos, migraciones, admin, datos de demostración, pruebas y el SQL de `sqlmigrate` | `practicas-ebac` | Etiqueta `m54` y mensaje del LMS listo |
| 2 | M64: API en las rutas de la consigna, permisos, throttling, colección de Postman y pruebas | `practicas-ebac` | Etiqueta `m64` |
| 3 | Infraestructura de AWS y pipeline DevSecOps | `backend` (la IaC) | El stack de pruebas desplegado |
| 4 | Rediseño implementado por piezas | `frontend` | Puertas y capturas |
| 5 | M66: Axios, Redux, publicación en AWS y README por cada parte | `practicas-ebac` | Etiqueta `m66` y URL publicada |
| 6 | Mejoras aprobadas, en olas (incluido el asistente de IA) | `frontend` y `backend` | Cierre por ola |

Cada pieza pasa sus puertas y la revisión de `auditor-seguridad`, abre un PR y espera la auditoría de Claudia. Los mensajes del LMS los envía Eduardo.

## 11. Fase 8 · Pruebas, filtro y `main` → COMPUERTA 3

En `pruebas` corren la suite completa, las pruebas de punta a punta con Playwright, el DAST (ZAP baseline) contra el stack de pruebas y `docker compose`. Se aplica el filtro de `practicas-ebac`. **Eduardo revisa el producto.** Después va el PR de `pruebas` a `main`.

## 12. Fase 9 · Corrección y mejora continua

Lo que Eduardo pida después de revisar sigue el mismo ciclo.

---

## Apéndice A · Las prácticas

| | M54 · Entregable 10 | M64 · Entregable 11 | M66 · Entregable 12 |
|---|---|---|---|
| Pide | `models.py` con `Guide`, `StatusHistory` y `User` | `views.py` con viewsets; en `urls.py`, el prefijo `api/` y las rutas `crear-guia`, `actualizar-guia/ID`, `obtener-guia/ID` y `eliminar-guia/ID` (opcional); probar con Postman | Axios con URL base; registro por POST con las mismas validaciones en ambos lados; panel con activas, en tránsito y entregadas que se actualiza solo; lista con PUT; componentes sincronizados; manejo de errores; pruebas del flujo |
| Se entrega | `models.py` o los scripts SQL, adjuntos | ZIP o URL del repo | URL de la app publicada y el repo |
| Tiempo y revisión | 120 min, 1 día | 160 min, 1 día | 60 min, 5 días |
| Trampas | `id = IntegerField()` da el error E004; `AutoDateTimeField` no existe en Django; `guideId` como entero no es llave foránea; en un `trackingNumber` de 15 caracteres no entra ningún número real (16 dígitos que empiezan con 21, o 22 alfanuméricos); en un `password` de 20 caracteres solo entra texto plano (Django cifra en 89); `createdAt` como `DateField` pierde la hora | Los IDs consecutivos dejan recorrer todas las guías (usar UUID o número de guía); `actualizar-guia` acepta solo la etapa siguiente, dentro de una transacción; borrar choca con el historial (archivar); el cliente nunca manda fechas | Hoy se usa `fetch` (pasar a Axios); los contadores no están definidos; es la primera práctica que exige publicar; el PDF pide además un README para correr en local |
| Base en carni-mvp | M14: TimeStampedModel, `bulk_create`, fixture y borrado solo de los datos de demostración | M13: CRUD protegido en el servidor | Las clases de Axios (React III) y el chatbot de la M44 |

## Apéndice B · Lógica de negocio

- **Capa 1, etapas:** Recepción de carga (Aduana) → Vehículo cargado (Aduana) → Vehículo liberado (Operaciones) → Vehículo en camino (Seguridad) → Carga entregada (KAM). Solo se avanza a la siguiente, la fecha la pone el servidor y el historial no se edita. Los códigos (`cargo_received`, `vehicle_loaded`, `vehicle_released`, `vehicle_in_transit`, `cargo_delivered`) caben en 20 caracteres.
- **Capa 2, eventos:** lo que pasa dentro de cada etapa, con ubicación, modo de transporte (terrestre, aéreo o marítimo) y descripción.
- **Capa 3, estado público:** las categorías que ve el cliente, al estilo de 17TRACK.
- **Contadores de la M66:** activas = etapas 1 a 4, sin las archivadas; en tránsito = etapa 4; entregadas = etapa 5; con alerta = incidencias abiertas.
- Es la misma lógica que el colaborador carnicero planeado en carni: tomado → despachando → en camino → entregado.

## Apéndice C · AWS, versión 0 (para que el abogado la ataque)

| Pieza | Propuesta | Qué verificar |
|---|---|---|
| Frontend | S3 privado más CloudFront, que es siempre gratis hasta 1 TB y 10 millones de peticiones al mes | Página oficial |
| Backend | Django en una imagen de contenedor sobre AWS Lambda con Lambda Web Adapter: se enciende con cada petición y se apaga solo. Lambda es siempre gratis hasta 1 millón de peticiones y 400,000 GB-s al mes | Repositorio `awslabs/aws-lambda-web-adapter` |
| Un solo dominio | CloudFront manda `/` a S3 y `/api/*` a Lambda | OAC con Lambda exige el hash SHA-256 del cuerpo en POST y PUT. Alternativas: API Gateway HTTP o una cabecera secreta |
| Base de datos | Postgres: Supabase (gratis) o RDS con créditos. RDS ya no es gratis durante 12 meses | Para llegar a RDS, Lambda entra a una VPC y pierde la salida a internet, salvo con NAT Gateway, que cuesta cada mes |
| Secretos | SSM Parameter Store, con valores SecureString | — |
| IA | Amazon Bedrock con un rol de IAM, sin llave de API. Para desarrollo, respaldos gratis: Groq y Google AI Studio | Precios por token |
| IaC | SAM o CDK en Python | — |
| CI/CD | GitHub Actions con OIDC hacia AWS, sin llaves de larga duración. `pruebas` despliega al stack de pruebas y `main` a producción | — |
| Seguridad | IAM con mínimo privilegio, MFA, CloudTrail, Budgets, cabeceras de seguridad en CloudFront y Turnstile contra bots | — |
| Contenedores | Docker con una imagen endurecida (sin root, base mínima, escaneada y firmada). Podman sin root en local. **Kubernetes no va a producción por ahora:** EKS cobra el plano de control por hora y es excesivo para esta app. kind en local, solo para aprender | Precio de EKS |
| Descartado | Lightsail (siempre encendido), Render y Google | — |

## Apéndice D · Pipeline DevSecOps

En cada PR: lint y pruebas → secretos (gitleaks) → SAST (Semgrep y Bandit) → SCA (npm audit, pip-audit y Dependabot) → imagen (Trivy) → SBOM (Syft) y firma (Cosign) → IaC (Checkov) → despliegue al stack de pruebas → DAST (ZAP baseline) → aprobación → producción. Las cabeceras se revisan con Mozilla Observatory.

## Apéndice E · Recursos gratis (itsfree.dev, lo que revisó Claudia)

| Categoría | Candidatos | Para qué |
|---|---|---|
| Hosting | Cloudflare (Turnstile) y GitHub (Actions) | Verificación anti-bots y CI |
| Datos | Supabase, Neon (escala a cero) y Upstash (Redis) | Postgres, y caché o límites de peticiones |
| IA | Groq, Google AI Studio, Hugging Face y NVIDIA NIM | Respaldo del asistente en desarrollo |
| Seguridad | GitGuardian, Socket, Mozilla Observatory y Have I Been Pwned (Pwned Passwords) | Secretos, dependencias, cabeceras y contraseñas filtradas |
| Pendiente | Auth, email, monitorización, CI/CD, storage, APIs y analítica | Se completa en la fase 2 |

## Apéndice F · Las 15 mejoras (hipótesis para el abogado del diablo)

Todas se suman al asistente de IA (el widget flotante de la M44 de carni, evolucionado).

1. **Centro de incidencias por guía:** cobros extra o impuestos, documentos faltantes, dirección incorrecta, retenido en aduana. El cliente acepta o responde, y la incidencia se enruta al área responsable (Kakobuy).
2. **Rastreo enriquecido:** eventos en un mapa, íconos por modo de transporte, hasta 10 guías y pestañas con contadores, todo en español (17TRACK).
3. **Notificaciones:** correo, WhatsApp o aviso del navegador cuando cambia la etapa o se abre una incidencia.
4. **Prueba de entrega:** foto, nombre de quien recibe y ubicación al cerrar la etapa 5.
5. **Indicador de cumplimiento y antifraude:** porcentaje de guías en orden (hoy 31 %), intentos bloqueados de saltar etapas o atrasar fechas, tiempo por etapa y alertas de guías atoradas.
6. **Cotizador con costo total:** flete, impuestos y aranceles estimados, y tiempo de entrega (la "Estimación" de Kakobuy).
7. **Portal del vendedor:** carga masiva de guías por CSV (`bulk_create`, como en la M14 de carni), llaves de API y webhooks de cambio de estado.
8. **Logística inversa:** devoluciones con su propia guía. Es un servicio real de Hound Express, con más de 200,000 devoluciones al mes.
9. **Documentos aduanales digitales por guía:** carta porte y factura comercial, guardados en S3 privado y compartidos con enlaces temporales.
10. **Etiqueta con código QR** y escaneo desde el celular del operador para avanzar de etapa, sin teclear.
11. **Roles por área con MFA y bitácora de auditoría:** quién, cuándo y desde dónde. La regla de negocio pasa a ser un control de seguridad.
12. **Copiloto de IA para el personal:** resume el historial, redacta respuestas al cliente y sugiere el siguiente paso.
13. **Entrega estimada predictiva** y alertas de retraso: primero con la mediana por ruta y etapa, después con un modelo.
14. **Verificador antiestafas:** "¿este SMS o correo es de Hound Express?", contra los mensajes falsos de "paquete retenido, paga aquí".
15. **Pago en línea de cobros extra** ligado a las incidencias, en modo de prueba (el pago de saldo de Kakobuy).

## Apéndice G · Cuántas mejoras más hay

Claudia estima unas 25 mejoras útiles adicionales, repartidas entre cliente, vendedor, operación, seguridad, datos y plataforma. No están escritas: el arquitecto decide si se investigan.
