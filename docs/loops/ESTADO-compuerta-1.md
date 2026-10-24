# Estado del loop: compuerta-1

- Proyecto Engram: houndxpress · tema `loop/compuerta-1/estado`
- Rama: practicas-ebac · Actualizado: 2026-10-14 00:27 (hora de San Luis Potosí)

## Unidades

| # | Unidad | Estado | Evidencia | Revisión |
|---|---|---|---|---|
| 1 | Propuesta maestra | hecho | `docs/propuesta/README.md` (30 reemplazos con coincidencia única) | pendiente: Eduardo, Compuerta 1 |
| 2 | Resumen corregido | hecho | `docs/propuesta/06-propuesta-definitiva.md` | pendiente: Eduardo |
| 3 | Agentes y enrutamiento | hecho | `.codex/agents/*.toml` (8 válidos con tomllib), `AGENTS.md` (0 rutas rotas) | pendiente: Eduardo |
| 4 | Loop v3: 24 lotes, 42 vistas | hecho | verificador: 19 nombres del kit, secciones del README y del brief y rutas del repo existen | pendiente: Eduardo, Compuerta 1 |
| 5 | Nota v3 en el brief y script del kit | hecho | el script arma `kit-claude-design/` con 35 archivos (exit 0; git lo ignora) | — |
| 6 | `backend/.env` con `GEMINI_API_KEY` | hecho | creado sin secretos; Eduardo pegó la clave (no se lee) | — |
| 7 | Textos del sitio vivo para el kit | hecho | 11 archivos `docs/loops/kit/CONTENIDO-V3-*.md` (≤ 450 líneas; índice en `CONTENIDO-V3-INDICE.md`); 0 coincidencias de credenciales | pendientes reales marcados en el índice |
| 8 | Conexión con Gemini en el backend | hecho | verificación propia: 46 pruebas OK sin cargar `.env` (`DJANGO_ENV_FILE=/dev/null`), ruff y formato limpios, clave solo en la cabecera (`assistant/gemini.py:114`) | falta `check_gemini` contra la API real (lo corre Eduardo) |
| 9 | Verificación final | hecho | verificador: "OK: todas las referencias del loop existen"; falta solo `check_gemini` de Eduardo | — |
| 10 | Resumen para Eduardo (3 prácticas, rediseño, impacto) | hecho | respuesta en el chat del 2026-10-14 | — |
| 11 | Prompt de arranque y equipo del loop v3 | hecho | loop de 359 líneas; verificador: 24 referencias OK, 0 secretos | pendiente: Eduardo pega el prompt |
| 12 | Kit fuera de repositorios y prompt que verifica archivos | hecho | `~/kit-claude-design` (207 archivos; `INDICE-KIT.md` con 47 entradas, todas existen); guardia probada contra repos; kit viejo eliminado | — |
| 13 | Claude Design sobre el proyecto completo, en modo continuo | hecho | loop v3 de 359 líneas: prompt con rutas del repositorio y sección "Modo continuo" | — |
| 14 | Rediseño en Claude Design: lotes 0 a 5 | hecho | `~/Desktop/Honddesing.zip` (33 archivos): 14 `.dc.html` = sistema, 8 vistas (Inicio, Rastreo, Panel resumen y registro, Servicios, Servicio, Cobertura, País), 4 piezas compartidas e índice; `~/Desktop/HoundEdesing.html` = País exportada aparte | pendiente: segunda vista de OpenCode |
| 15 | Rediseño: lotes 6 a 23 y documentos de cierre | pendiente | `00-indice.dc.html` marca 34 vistas pendientes; faltan DESIGN.md, tokens.json, pantallas.md, decisiones.md, plus.md y autoevaluacion.md | se retoma el lunes 19 de octubre con "Continúa el loop" |
| 16 | Traspaso a OpenCode | hecho | prompt entregado en el chat; Engram `houndxpress/handoff-opencode`; `graphify update .` al cierre | — |
| 17 | M54 · Entregable 10: modelos, migraciones, admin y fixture (rama `backend`) | hecho | commit `6380d52` publicado en `backend` con revisión GGA en verde; 86 pruebas OK, migraciones al día, ruff limpio; etiqueta `m54` publicada; PR #3 abierto a `practicas-ebac`; material en `docs/entregas/m54/` | falta: enviar el mensaje del LMS |
| 18 | Implementar el sistema y las 8 vistas de los lotes 0 a 5 (rama `frontend`) | pendiente | segunda vista antes de implementar | OpenCode, frente B |

## Siguiente

OpenCode, en paralelo: frente A, M54 en la rama `backend`; frente B, segunda vista e implementación de los lotes 0 a 5 en la rama `frontend`. Claude Design termina las 34 vistas restantes desde el lunes 19 de octubre.

## Para retomar

Retoma la Compuerta 1: lee docs/loops/ESTADO-compuerta-1.md y continúa con la siguiente unidad.

## Resumen de la sesión (13 y 14 de octubre de 2026)

**Decisiones de Eduardo**
- X1: asistente de IA con modelos gratuitos, nunca APIs de pago. En la demostración, Gemini (Google AI Studio) desde el backend, con la clave solo en `backend/.env`; con datos reales, HomeLab propio.
- Base de datos: PostgreSQL (el código migra en M54).
- Las 42 vistas se diseñan en Claude Design y toda mejora empieza en el diseño. Tecnología del PDF: React, TypeScript, Sass BEM, Redux y Jest.
- Contacto y cotizador con `mailto:` (decisión cerrada en v1).
- La revisión completa del rediseño, con abogado del diablo, va sobre la entrega entera.

**Entregables**
- `docs/propuesta/README.md` (propuesta maestra) y `06-propuesta-definitiva.md` corregido.
- 8 agentes en `.codex/agents/` (nuevos: `security-review`, `ia-asistente`) y `AGENTS.md`.
- `docs/loops/06-LOOP-CLAUDE-DESIGN-V3.md` y `armar-kit-claude-design.sh` (kit opcional en `~/kit-claude-design`, con 11 skills).
- `docs/loops/kit/CONTENIDO-V3-*.md`: textos reales del sitio vivo.
- `backend/assistant/`: cliente de Gemini con el comando `check_gemini` y 33 pruebas.

**Hallazgos**
- El rastreador del sitio vivo expone una credencial de integración (evidencia privada en `docs/investigacion/07-gate0-evidencia.md`; avisar a Hound Express y rotarla).
- Defectos del sitio vivo y cuatro contratos de API incompatibles (README §3.4 y §8.5). El panel cuenta "en tránsito" como etapas 1 a 4; debe ser solo la 4.
- Claude Design no ejecuta skills locales ni subagentes de Claude Code. `~/Desktop` es un repositorio git vacío.

**Pendiente**
- Decisiones D1 a D15 (README §19), `check_gemini` por Eduardo y los commits de esta sesión (todo sigue sin versionar).

## Bitácora de puntos de control

- 2026-10-14 00:27 · entrega de la propuesta y del loop v3 · 5 h 92 % · semanal 65 % · contexto 57 % · PAUSO YA (se reinicia 02:30; dos subagentes terminan en segundo plano; si los corta el límite, se retoman con SendMessage)
- 2026-10-14 · subagente de Gemini terminó · PAUSO YA sigue vigente hasta las 02:30
- 2026-10-14 · reanudación tras el reinicio · 5 h 11 % · semanal 68 % · contexto 58 % · SIGO
- 2026-10-14 · textos y verificación final cerrados · SIGO
- 2026-10-14 · prompt de arranque y equipo del loop entregados · SIGO
- 2026-10-14 · kit movido a ~/kit-claude-design y prompt con verificación de archivos · SIGO
- 2026-10-14 · entrega parcial de Claude Design verificada (lotes 0 a 5) y traspaso a OpenCode · PAUSO (créditos)
- 2026-10-19 · M54 corregida y verificada (51 pruebas); commit pendiente de Eduardo por GGA · SIGO
- 2026-10-23 · M54 endurecida y verificada (86 pruebas), commit `6380d52` y etiqueta `m54` publicados, PR #3 abierto a `practicas-ebac` · SIGO
