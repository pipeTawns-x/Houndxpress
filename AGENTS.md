@CLAUDE.md

OpenCode: lee `CLAUDE.md` antes de trabajar.

Codex: lee `CLAUDE.md` antes de trabajar. Trabaja únicamente en la rama y el worktree asignados: un agente por rama, sin limitación exclusiva a `frontend`. Las reglas de ramas, ejecución local y permisos de `CLAUDE.md` prevalecen sobre otras instrucciones. El agente solo ejecuta Git local, incluidos commits; Eduardo ejecuta Git con red, npm y Homebrew. Entrega un único bloque de comandos cuando necesites su intervención y espera la salida; nunca ejecutes `npm ci`, accedas a credenciales ni eludas el sandbox de mínimo privilegio.
