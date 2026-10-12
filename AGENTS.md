@CLAUDE.md

OpenCode: lee `CLAUDE.md` y `docs/loops/03-LOOP-OPENCODE.md` antes de trabajar.

Codex: lee `CLAUDE.md` y `docs/loops/05-LOOP-CODEX.md` antes de trabajar. Trabaja únicamente en la rama y el worktree asignados: un agente por rama, sin limitación exclusiva a `frontend`. Las reglas de ramas, filtro escolar, ejecución local y permisos de `CLAUDE.md` prevalecen sobre las instrucciones anteriores del loop. El agente solo ejecuta Git local, incluidos commits; Eduardo ejecuta Git con red, npm y Homebrew. Entrega un único bloque de comandos cuando necesites su intervención y espera la salida; nunca ejecutes `npm ci`, accedas a credenciales ni eludas el sandbox de mínimo privilegio.

## Enrutamiento Hound · fase 1

Rutas relativas desde este worktree. Skills generales y recursos globales se consultan en sitio: no se instalan ni copian.
Los agentes locales usan solo los campos requeridos del esquema oficial: https://learn.chatgpt.com/docs/agent-configuration/subagents.
No se fijan modelos opcionales ni se cambia configuración personal. Esta tabla no prueba la ejecución de agentes.

| Tarea | Agente (ruta) | Skills (rutas reales) | Recurso global (ruta) |
|---|---|---|---|
| Modelos, historial y API | `.codex/agents/backend-dev.toml` | `.agents/skills/hound-dominio/SKILL.md`; `.agents/skills/ebac-practicas-hound/SKILL.md`; `.agents/skills/system-design-logistica/SKILL.md`; `/Users/felipeeduardotorresaguilar/.agents/skills/django-drf/SKILL.md`; `/Users/felipeeduardotorresaguilar/.agents/skills/pytest/SKILL.md` | `/Users/felipeeduardotorresaguilar/Desktop/recursos-agentes/msitarzewski/agency-agents` (referencia, no plantilla) |
| Pantallas aprobadas e integración | `.codex/agents/frontend-dev.toml` | `.agents/skills/hound-dominio/SKILL.md`; `.agents/skills/ebac-practicas-hound/SKILL.md`; `/Users/felipeeduardotorresaguilar/.agents/skills/react-19/SKILL.md`; `/Users/felipeeduardotorresaguilar/.agents/skills/typescript/SKILL.md`; `/Users/felipeeduardotorresaguilar/.agents/skills/migracion-incremental/SKILL.md` | `/Users/felipeeduardotorresaguilar/Desktop/recursos-agentes/msitarzewski/agency-agents` (referencia, no plantilla) |
| Diseño antes de implementar | `.codex/agents/disenador-ui.toml` | `.agents/skills/hound-dominio/SKILL.md`; `/Users/felipeeduardotorresaguilar/.agents/skills/frontend-design/SKILL.md`; `/Users/felipeeduardotorresaguilar/.agents/skills/impeccable/SKILL.md`; `/Users/felipeeduardotorresaguilar/.agents/skills/hallmark/SKILL.md` | `/Users/felipeeduardotorresaguilar/Desktop/recursos-agentes/msitarzewski/agency-agents` (referencia, no plantilla) |
| Nube, IaC y pipeline | `.codex/agents/aws-devsecops.toml` | `.agents/skills/system-design-logistica/SKILL.md`; `.agents/skills/hound-dominio/SKILL.md`; `/Users/felipeeduardotorresaguilar/.agents/skills/supply-chain-risk-auditor/SKILL.md`; `/Users/felipeeduardotorresaguilar/.agents/skills/the-architect/SKILL.md` | `/Users/felipeeduardotorresaguilar/Desktop/recursos-agentes/msitarzewski/agency-agents` (referencia, no plantilla) |
| Integración y evidencia | `.codex/agents/qa-integrador.toml` | `.agents/skills/hound-dominio/SKILL.md`; `.agents/skills/ebac-practicas-hound/SKILL.md`; `.agents/skills/system-design-logistica/SKILL.md`; `/Users/felipeeduardotorresaguilar/.agents/skills/pytest/SKILL.md`; `/Users/felipeeduardotorresaguilar/.agents/skills/playwright/SKILL.md` | `/Users/felipeeduardotorresaguilar/Desktop/recursos-agentes/msitarzewski/agency-agents` (referencia, no plantilla) |
| Prácticas y mensajes LMS | `.codex/agents/redactor-lms.toml` | `.agents/skills/ebac-practicas-hound/SKILL.md`; `/Users/felipeeduardotorresaguilar/.agents/skills/cognitive-doc-design/SKILL.md` | `/Users/felipeeduardotorresaguilar/Desktop/recursos-agentes/msitarzewski/agency-agents` (referencia, no plantilla) |
| Datos externos antes de decidir | Orquestador: función investigador, sin agente local adicional | `/Users/felipeeduardotorresaguilar/.agents/skills/investigador/SKILL.md` | `/Users/felipeeduardotorresaguilar/Desktop/recursos-agentes` (inventario local; verificar fuente primaria) |

Pendiente de cierre: tarea de prueba por agente, revisión de Claudia y PR por el flujo autorizado; no ejecutados en esta fase.
