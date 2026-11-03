# Web completa de Hound Express
Objetivo: entregar la web premium y funcional de punta a punta, con el .zip del diseño como referencia.
Ramas: `feat/api-guias` (de `backend`) y `feat/web-premium` (de `frontend`); integran en `pruebas` y luego en `main`. Estrategia de entrega: ask-on-risk.
Pruebas: `manage.py test` y ruff en el backend; Jest, eslint, typecheck y build en el frontend.

## Specs
- S1. "entregar una funcionalidad completa de web desarrollando con el odd ya tienes contexto no lo utilizas sigues sin utilizarlo"
- S2. "el .zip era para que se tomara de referencia y se utilizaran los recursos para añadirle ese plus al diseño para que se vea premium"
- S3. "estandares de webs modernas de compañias y empreas mas top actualmente asi como estandares sacados de paginas como horizon y las otras con disñeos modernos con animaciones esteticos y muy bellos"
- S4. "un proyecto sin img con un diseño que se desvorda": el sitio tiene imágenes reales y no se desborda a 375, 768 ni 1280 px.
- S5. API de `docs/propuesta/blueprint.md`, sección de endpoints: guías (lista, alta, detalle, avance, baja, historial y resumen), rastreo público, autenticación (csrf, login, logout, me) y sus códigos de respuesta.
- S6. El frontend usa esa API: rastreo público real, acceso de personal, panel protegido, alta de guía, avance de etapa e historial.
- S7. Reglas de negocio de `hound-dominio`: cinco etapas en orden estricto e historial de solo inserción.

Suposiciones:
- A1. La base es React, TypeScript, Sass BEM, Redux y Jest (`CLAUDE.md:27`, `REQUISITOS_EBAC.md:23-28`). El sitio en plantillas Django queda en el respaldo local `respaldo/sitio-django-opencode`, sin publicar. Resuelve L8 de `m54-frontend-django.md`.
- A2. Contacto y cotización siguen con `mailto:` (`04-sistema-de-diseno.md:113`).
- A3. Sin dependencias nuevas de npm ni de Python: el movimiento usa CSS e IntersectionObserver.
- A4. Fuera de esta entrega, como en el documento: portal de cliente, blog, asistente y pagos.

## Historias de usuario
Formato tomado de `nschurmann/hola-ai`: historias verticales de una línea, con 2 o 3 criterios Dado, Cuando, Entonces. Cada historia cruza API, interfaz y datos.

| ID | Historia | Criterios de aceptación | Tareas |
|---|---|---|---|
| HU-01 | Como visitante quiero rastrear mi guía por número para saber en qué etapa va | Dado una guía en etapa 3, cuando escribo su número con espacios, entonces veo las 5 etapas con la 3 marcada en texto, con fecha y ciudad, sin datos internos. Dado un número inexistente, cuando lo busco, entonces veo "no encontrada". Dado la API caída, cuando busco, entonces veo un aviso de sin conexión. | T1, T2 |
| HU-02 | Como visitante quiero rastrear varias guías a la vez para revisar mis envíos | Dado hasta 10 números, cuando los busco, entonces veo el estado de cada uno. Dado más de 10, cuando busco, entonces veo un mensaje claro. | T1, T2 |
| HU-03 | Como visitante quiero conocer servicios y cobertura para decidir si contrato | Dado la portada, cuando la recorro, entonces veo imágenes reales, un gesto de movimiento dominante y ningún texto pendiente. Dado cada servicio, cuando abro su detalle, entonces veo su propio contenido. Dado animaciones reducidas, cuando navego, entonces todo se lee completo. | T3, T4 |
| HU-04 | Como visitante quiero contactar o cotizar para pedir el servicio | Dado la página de contacto, cuando elijo escribir, entonces se abre mi correo con el asunto listo. Dado la página de cotización, cuando completo el formulario, entonces se abre mi correo con esos datos. | T3 |
| HU-05 | Como personal quiero iniciar sesión para entrar al panel | Dado credenciales válidas, cuando entro, entonces llego al panel. Dado credenciales inválidas, cuando entro, entonces veo un mensaje genérico, y los intentos repetidos se frenan. Dado una visita sin sesión a `/panel`, cuando carga, entonces llego al acceso. | T1, T2 |
| HU-06 | Como personal quiero ver el resumen para conocer la operación del día | Dado guías en distintas etapas, cuando abro el panel, entonces los contadores coinciden con la base de datos. Dado una base vacía, cuando abro el panel, entonces veo un estado vacío útil. | T1, T2 |
| HU-07 | Como personal quiero buscar guías para encontrar una rápido | Dado guías registradas, cuando busco parte del número o del destino, entonces la lista se filtra. Dado un teléfono, cuando abro la lista, entonces la veo sin desborde. | T1, T2 |
| HU-08 | Como personal quiero dar de alta una guía para empezar su seguimiento | Dado un número válido, cuando la registro, entonces aparece en la lista y en el rastreo público en etapa 1. Dado un número repetido o inválido, cuando la registro, entonces veo el error y no se crea nada. | T1, T2 |
| HU-09 | Como personal quiero avanzar una etapa para registrar el progreso | Dado una guía en etapa 2, cuando avanzo, entonces queda en etapa 3 con mi nombre, área y fecha del servidor. Dado un salto o un retroceso enviado a la API, cuando se procesa, entonces responde 409 y se registra el intento. Dado una guía entregada, cuando la abro, entonces no se ofrece avanzar. | T1, T2 |
| HU-10 | Como personal quiero ver el historial para auditar una guía | Dado una guía con avances, cuando abro su detalle, entonces veo cada etapa en orden, con autor y fecha. Dado el historial, cuando lo consulto, entonces no hay forma de editarlo ni borrarlo. | T1, T2 |
| HU-11 | Como personal quiero archivar una guía para sacarla de la operación | Dado una guía, cuando la archivo, entonces sale de las activas y su historial sigue intacto. Dado una guía archivada, cuando intento avanzarla, entonces responde 409. | T1, T2 |
| HU-12 | Como personal quiero cerrar sesión para proteger mi cuenta | Dado una sesión abierta, cuando salgo, entonces vuelvo al acceso y `/panel` deja de abrir. | T1, T2 |
| HU-13 | Como persona en un teléfono quiero usar toda la web para no depender de una computadora | Dado 375, 768 y 1280 px, cuando abro cada pantalla, entonces no hay desborde ni imágenes rotas. Dado el menú móvil, cuando lo abro y pulso Escape, entonces abre y cierra bien. | T3 |

## Tasks
| ID | Specs | Ruta | Estado | Evidencia |
|---|---|---|---|---|
| T1 API con TDD | S1, S5, S7 | Delegada a Codex: unidad paralela con superficie propia | Hecha | `71deaef`, 154 pruebas |
| T2 React contra la API | S1, S6, S7 | Delegada a Codex: unidad paralela con superficie propia | Hecha | `e8af21a`, `1eff878`, `cdd4f17`; 310 pruebas; E2E en navegador |
| T3 Rediseño premium | S2, S3, S4 | Delegada a Codex, misma unidad que T2 | Hecha | `cdd4f17`, `5d7dda8`; 42 combinaciones sin desborde |
| T4 Imágenes y video propios | S4 | Inline: mflux y ffmpeg locales | Hecha | `03bf98a`; 7 WebP y `hero.mp4` |
| T5 Validación externa | S1 a S7 | Inline en navegador; revisión de seguridad independiente (Risk: item 2) | Hecha | `77c657a`, `5c0f081`, `95a6c43`, `2a49868`, `b00bf89`; L17 y L18 |
| T6 Publicar y mensaje del LMS | S1 | Inline | Hecha | PR #15 a #21; `main` en `59bb8c6`; etiqueta `m54.3` |
| T7 Limpieza pública y endurecimiento | L23 | Delegada a agentes por pedido de Eduardo | En curso | L24 y L25 |

## Log
- L1 · 2026-11-02, pedido original: "suena bello pero un proyecto sin img con un diseño que se desvorda amm el .zip era para que se tomara de referencia y se utilizaran los recursos para añadirle ese plus al diseño para que se vea premium tienes varios recursos para saber estandares de webs modernas de compañias y empreas mas top actualmente asi como estandares sacados de paginas como horizon y las otras con disñeos modernos con animaciones esteticos y muy bellos no estas utilizando nada para mejorar antes de que sigas esta bien que aca en loop ya saabes hagas lo de mejorar el promt con el meta promting y despues hagas lo que te pido entregar una funcionalidad completa de web desarrollando con el odd ya tienes contexto no lo utilizas sigues sin utilizarlo"
- L2 · 2026-11-02: "esto deberia hacerse como una skils para cada que te diga algo lo mejores haciendolo loop o promt debido a lo que se necesite y pues hagas un traductos pues esto para mejorar los resultados". Hecho: skill `traductor-de-prompts`.
- L3 · Decisión: el contrato del blueprint manda sobre `frontend/src/domain/types.ts`. El frontend se adapta (`trackingNumber`, `serviceLevel`, `stage`, PUT).
- L4 · Decisión: el movimiento de la parte pública usa la escala de marca de `referencias-diseno.md:453-464`; el panel conserva 150 a 250 ms de `04-sistema-de-diseno.md:54`.
- L5 · 2026-11-02: "a opencode lo tenia trabajnado en paralelo espero no te afecte en nada ya mejor lo pause caor lo tengo trabajando en otros proyecto pero mas que como contexto por ejmplo con el tema de https://github.com/nschurmann/hola-ai y bueno todo lo de las funcionalidas creadas con el odd a base de historias de usuarios o tickets jajaja ir desarrollando de manera agentica tareas en conjunto para terminar y entregar la funcionalidad ocmpleta para entregar la practica lo mas completa avanzada y moderna posible". Hecho: backlog de historias HU-01 a HU-13, que son la lista de validación de T5.
- L6 · 2026-11-02: "hey ojo que tiens en recurso modelos y inclsuo recurso sen repos gratuiots que te ayudaran".
- L7 · 2026-11-02: "hay muchos mas muchos mas muchos masssssssss bueno tienes los de nvidia estos si estan respondiendo y ojo claro que no filtres secretos ni nada del sitio vivio ni el mio ya con esto claro mejora y mejora mucho deja de estar de flojo infinidad de recurso que tienes". Aprobación para usar modelos gratuitos de NVIDIA, sin secretos ni datos del sitio vivo.
- L8 · Equipo: Codex construye T1 a T3; `nvidia/minimaxai/minimax-m3.1-flash` (OpenCode) construye las páginas públicas adicionales y revisa la API de forma independiente; mflux y ffmpeg generan imágenes y video. `glm-5.3-flash` no respondió en 160 s; OmniRoute no responde; Higgsfield tiene 0 créditos.
- L9 · T1, evidencia observada por Claude: `Ran 142 tests ... OK`, ruff limpio, sin migraciones pendientes. Pendiente por HU-01: el rastreo público oculta la ubicación porque es texto libre; hay que mostrar la ciudad con una lista cerrada.
- L10 · T4, evidencia: 7 imágenes WebP (de 72 a 147 KB) y `hero.mp4` (538 KB) en `frontend/public/media/`.
- L11 · T5, primera validación en navegador real contra la API real: login con mensaje genérico; alta de `2199123456789012`, visible en lista y rastreo público; PUT con salto responde 409 `invalid_transition`; avance por interfaz deja historial con `updatedBy` y `department`; `/rastreo` muestra "Etapa 2 de 5". Sin desborde ni imágenes rotas en 10 páginas a 375 y 1280 px.
- L12 · Defectos encontrados solo por esa validación, con 287 y 142 pruebas en verde: titular del héroe ilegible, contraste de 1.0 en cobertura, CSRF rechazado por origen a través del proxy, texto crudo de error, panel sin estructura propia. CSRF corregido con prueba; el resto va en lote a Codex.
- L13 · T1: `ALLOWED_LOCATIONS` corregida a las 10 ciudades reales de `frontend/src/content/coverage.ts`, después de que Claude pasara a Codex una lista de memoria que no coincidía. Búsqueda `search` en `GET /api/v1/guides/`.- L14 · T1 commit `71deaef` (154 pruebas). Revisión de seguridad independiente hecha por una sesión nueva de Codex en solo lectura: 0 bloqueos, 2 avisos, corregidos por Claude con TDD. Modelos NVIDIA: minimax se agotó en la revisión; minimax y deepseek casi no produjeron páginas. Codex llegó a su límite hasta las 4:25.
- L15 · Decisión de alcance: blog, noticias, ofertas, campaña y alianzas quedan fuera porque no hay contenido real y la revisión 05:R9 deja alianzas pendiente de Hound. HU-04 se cubre con el formulario de contacto y su asunto Cotización de `ContactForm`; falta confirmar el asunto en navegador.
- L16 · Pendiente de validar en navegador: HU-11 archivar y HU-12 cerrar sesión. Pendiente: diagrama de arquitectura con la API ya hecha, documentos de `practicas-ebac`, etiqueta `m54.3` y mensaje del LMS.
- L17 · T5: HU-04 asunto "Cotización de servicio" en contacto. HU-11: archivar saca la guía de las activas, su historial sigue en 3 filas y avanzarla responde 409. HU-12: cerrar sesión vuelve a `/acceso`, `/auth/me` responde 403 y `/panel/registro` redirige sin mostrar datos.
- L18 · Revisión independiente de la web (Codex en solo lectura): 1 bloqueo y 1 aviso. Bloqueo: un 401 o 403 con el panel abierto no lo cerraba ni borraba los datos. Corregido con TDD y comprobado en navegador: logout externo, clic en "Actualizar guías", redirección a `/acceso` y 0 filas. Aviso: nginx sin protección de enmarcado, corregido. También se agregó `GET /api/v1/guides/?archived=true` porque `/panel/archivo` no tenía datos.
- L19 · Evidencia final: 157 pruebas de backend, 310 de frontend, CI en verde en los PR #15, #16 y #17 antes de esta última tanda.
- L20 · Revisión del script `tracking.sql`: no corría completo y no tenía las migraciones nuevas. Reescrito con el esquema final de una base migrada y probado en SQLite.
- L21 · T6: PR #15 a `backend`, #16 a `frontend`, #17 y #20 a `pruebas`, #18 a `main` (`59bb8c6`), #19 y #21 a `practicas-ebac`; CI en verde en todos antes de fusionar. `docs/diseno` de trabajo retirado de `main`; solo quedan arquitectura y sistema de diseño. gitleaks y semgrep: 0 hallazgos.
- L22 · Pendiente que no bloquea: despliegue público, efectos con `lenis`, `motion` y `cobe` (requieren `npm install` de Eduardo), portal de cliente y páginas sin contenido real confirmado (blog, noticias, ofertas, alianzas).
- L23 · 2026-11-02: "arregla esto ya tenemos que terminar" y "deja todo listo y bien hecho".
- L24 · 2026-11-02, T7. Documentos corregidos: checklist ASVS y matriz en versión M54.3, `SECURITY.md` igual en ambas ediciones, y los cuatro diagramas regenerados en ambas ediciones con patrones y `archivo:línea`. Se retiró la investigación de herramientas de los documentos públicos. Defecto corregido: una guía creada en el admin quedaba sin su primera fila de historial; ahora el admin usa `record_first_stage` y una guía sin historial responde 409. El login del admin quedó limitado a 5 intentos por minuto y comparte el límite con el de la API. nginx responde 404 a los dotfiles y envía una CSP completa. El CI suma el job `security` con gitleaks, pip-audit, bandit y npm audit. el pie avisa que es un rediseño no oficial. Conteos: 195 pruebas de backend, observadas en las dos ediciones, y 311 de frontend. Pendientes honestos en `docs/entregas/m54/asvs-l1-checklist.md`.
- L25 · 2026-11-02, recibo de recursos del kit de Hound Express, con la tarea abierta. "Agente" indica que sale del informe o de las llamadas registradas de un agente.
  1. REA: usado solo como lectura de resultados previos de la observación pasiva, sin captura nueva. `docs/investigacion/rea-sitio-actual.md` se corrigió en `c8328b3`.
  2. roadmap.sh: usado por agente. Nodos aplicados: transactions, migrations, rate-limiting, session-based-auth, pagination e idempotency. Falta database-indexes.
  3. Patrones (#1075, #1076, #809, #810 y la ficha): usados. Al abrir esta tarea solo 2 de 4 diagramas anotaban patrones; ahora los cuatro los anotan contra la versión M54.3.
  4. Seguridad: usada salvo lo indicado. gitleaks sin fugas (149 commits; luego 153, según agente). `check --deploy` sin avisos. pip-audit contra PyPI y OSV sin vulnerabilidades. bandit 1.9.4 sin problemas tras un `nosec` justificado, según agente. `npm audit --omit=dev` en 0. semgrep con 2 avisos en `nginx.conf`. `security-review`, en agente, sin avisos con confianza 8 o más. No usado, sin OK de Eduardo: `supply-chain-risk-auditor`. Dependabot: decide Eduardo.
  5. Big School: usado por agente. Clase 2, pp. 9 y 15-16; #1168; #1172 con 20 controles; `core/tests/test_asvs_controls.py` con 17 pruebas.
  6. EBAC: parcial. #850, #851 y #723 por agente, sin bloqueos. El LMS pide login y no se usó contraseña. `ebac-lms-reader` no se cargó en esta tanda, sin OK de Eduardo.
  7. Resúmenes de video: parcial, por agente. #1090, #1023, `videos-resto.md:58` y `WM2JAuR-MOU.txt` por tramos. No abiertos, sin OK de Eduardo: `metodo.md`, `Nvn6s3r9ZAw.txt` y `5JjuF1zpNbI.txt`.
  8. Gemini y Perplexity (#867, #887, #723): usados por agente. #887 es un inventario; la auditoría está en #723.
  9. Django y DRF: usados por agente. `django-drf` y `pytest` con Bash una vez cada una, y context7 con 2 `resolve-library-id` y 2 `query-docs`. Backend: 193 pruebas observadas, 157 antes.
  10. Archify: usado. Los cuatro diagramas de las dos ediciones pasaron `finalize` en modo `showcase` y `visual-check` con Brave. Las imágenes de `docs/diagramas/img/` se abrieron una por una.
- L26 · 2026-11-03, verificador independiente, primera pasada: bloqueado. Una guía nueva marcada como archivada daba 500 en el admin; ahora el formulario de alta no ofrece ese campo y una prueba lo cubre. Se retiraron referencias restantes a material no publicado y detalle de dependencias del sitio actual, y se corrigió la fila 6.2.2 del checklist, que pasa a parcial. Backend: 195 pruebas; frontend: 311.
