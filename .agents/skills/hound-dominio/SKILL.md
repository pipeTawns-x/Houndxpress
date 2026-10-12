---
name: hound-dominio
description: "Trigger: guías, etapas, historial, contadores, antifraude. Aplica las reglas de negocio de Hound."
metadata:
  author: "Eduardo Torres"
  version: "1.0"
---

## Activation Contract
Usa esta skill al modelar guías, transiciones, eventos o métricas.
Inputs: requisito, capa afectada, contrato actual y evidencia disponible.

## Hard Rules
- Backend: python manage.py test y python -m ruff check . / format --check . autorizados en sandbox, desde backend/ y dentro del alcance asignado; ante bloqueo, detenerse. npm exclusivamente Eduardo.
- No ejecutar Git ni lanzar subagentes; no leer secretos, instalar, desplegar, modificar configuración personal ni iniciar fase 6. No eludir el sandbox.
- Permite únicamente la etapa siguiente: cargo_received → vehicle_loaded → vehicle_released → vehicle_in_transit → cargo_delivered.
- Responsables, en ese orden: Aduana, Aduana, Operaciones, Seguridad, KAM.
- Genera fechas en el servidor; conserva el historial inmutable y valida permisos por responsable.
- Distingue etapa, evento interno (ubicación, transporte y descripción) y estado público; no inventes equivalencias públicas.
- Define activas como etapas 1–4 sin archivadas; en tránsito como etapa 4; entregadas como etapa 5; con alerta como incidencias abiertas.
- Nunca aceptes saltos, retrocesos, fechas del cliente ni edición del historial.
- Nunca declares cumplimiento de API por una demostración del frontend.

## Decision Gates
Si falta una regla de archivo, estado público o excepción, marca la decisión pendiente antes de implementarla.

## Execution Steps
1. Lee las fuentes y localiza la capa que hace cumplir cada invariante.
2. Diseña transición e historial atómicos; considera concurrencia y reintentos.
3. Verifica casos de salto, retroceso, doble envío y acceso no autorizado; ejecuta las pruebas backend autorizadas dentro del alcance.

## Output Contract
Entrega matriz regla → capa → evidencia, cambios propuestos y pendientes.
Separa evidencia ejecutada, reportada y no verificada.

## References
- `CLAUDE.md`: reglas vigentes y precedencia.
- `docs/loops/05-LOOP-CODEX.md`: apéndice B.
- `docs/REQUISITOS_EBAC.md`: requisitos oficiales.
