---
name: system-design-logistica
description: "Trigger: idempotencia, colas, eventos, límites, strangler fig. Diseña evolución segura de guías Hound."
metadata:
  author: "Eduardo Torres"
  version: "1.0"
---

## Activation Contract
Usa esta skill para diseñar integración o evolución distribuida de guías.
Inputs: caso de uso, contrato vigente, volumen conocido, riesgos y restricciones de costo.

## Hard Rules
- Backend: python manage.py test y python -m ruff check . / format --check . autorizados en sandbox, desde backend/ y dentro del alcance asignado; ante bloqueo, detenerse. npm exclusivamente Eduardo.
- No ejecutar Git ni lanzar subagentes; no leer secretos, instalar, desplegar, modificar configuración personal ni iniciar fase 6. No eludir el sandbox.
- Carga hound-dominio antes de decidir; una cola no reemplaza la validación transaccional.
- Define clave de idempotencia, alcance, caducidad y respuesta a payload distinto con la misma clave.
- Evita duplicar cambios e historial en reintentos; considera concurrencia sobre una guía.
- Publica eventos coherentes con la transacción; evalúa outbox si existe un consumidor real.
- Define reintentos acotados, deduplicación, orden por guía, cola de fallos y recuperación antes de agregar colas.
- Aplica límites por actor y endpoint sin exponer existencia de guías; especifica rechazo y observabilidad.
- Nunca inventes volumen, SLA, equivalencias de estados o garantías exactly-once.
- Nunca introduzcas infraestructura, dependencias ni servicios de pago sin decisión aprobada.

## Decision Gates
Prefiere una transacción local si basta. Usa colas solo con necesidad demostrada.
Migra con strangler fig por contrato y corte reversible; no reescribas todo.

## Execution Steps
1. Documenta invariantes y límites de confianza del flujo actual.
2. Compara la solución mínima con la distribuida: consistencia, costo, operación y rollback.
3. Especifica fallos: timeout tras commit, duplicado, evento desordenado y consumidor caído.
4. Verifica el diseño contra las fuentes y define evidencia pendiente, con pruebas backend autorizadas dentro del alcance.

## Output Contract
Entrega decisión con tradeoffs, flujo, contratos, amenazas y criterios verificables de aceptación y rollback.
Distingue arquitectura vigente de propuesta; no declares AWS desplegado.

## References
- `.agents/skills/hound-dominio/SKILL.md`: invariantes.
- `CLAUDE.md`: restricciones y stack vigente.
- `docs/STACK_HOUND_EXPRESS.md`: decisiones y licencias.
- `docs/loops/05-LOOP-CODEX.md`: sección 4 y apéndices B/C; C es propuesta, no despliegue.
