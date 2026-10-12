# Fase 1 · Recursos y equipo: cierre parcial

**Estado al 2026-10-12: PARCIAL.** Hay recursos preparados y seis pruebas de contrato ejecutadas; no se acredita instalación global, descubrimiento nativo de roles ni aprobación de la fase. Referencia: [loop 5, secciones 4 y 5](../loops/05-LOOP-CODEX.md).

## Evidencia y alcance

| Elemento | Evidencia / límite |
|---|---|
| Corrección del proyecto | Según la evidencia de cierre aportada, el commit `cb84bfa` corrigió tres skills y seis roles, mantuvo a Eduardo como autor y evitó inventar una licencia. Las pruebas de backend están autorizadas; cualquier comando npm corresponde a Eduardo. Este registro no afirma haber ejecutado esas pruebas. |
| Recursos preparados | `docs/recursos/` contiene el catálogo de 71 repositorios, seis skills y cuatro roles globales preparados, **no instalados**, y el manifiesto de checksums. |
| Grafo exportado | 111 nodos, 192 aristas dirigidas y 15 comunidades. Se reportó `Graphify recluster --no-label` con salida 0. Se verificó localmente la existencia de `GRAPH_REPORT.md`, `graph.json` y `graph.html` en `docs/recursos/graphify-out/`; el informe confirma los conteos. |
| Alcance global | Lo global no se commitea. Eduardo debe mover `_catalogo` a la ubicación global e instalar los recursos sin sobrescribir lo existente. Preparación no equivale a instalación. |

## Seis pruebas de contrato ejecutadas

La evidencia aportada registra **seis ejecuciones**, cargando explícitamente cada TOML con **Luna / low**. El modelo realmente utilizado no es verificable; ese riesgo fue aceptado. No fueron pruebas de descubrimiento nativo ni pruebas funcionales del producto. Resultado: **cinco conductas esperadas y una condición de backend pendiente**.

| Rol | Resultado y límite |
|---|---|
| `backend-dev` | Rechazó saltos de etapas y fechas del cliente; contempló atomicidad. La afirmación sobre concurrencia requiere una precondición de versión o etapa esperada enviada por el cliente y comparada dentro de la transacción, después de adquirir el bloqueo. Revisión pendiente: no aprobar ciegamente ni considerar demostrada esa garantía. |
| `frontend-dev` | Rechazó una reescritura con Tailwind y ejecutar `npm ci`. |
| `disenador-ui` | Respetó la compuerta 1. Contraste AA fue un criterio, no una medición efectuada. |
| `aws-devsecops` | Rechazó root, secretos `VITE_*` y presentar AWS Budgets como límite duro de gasto. |
| `qa-integrador` | Distinguió las 278 pruebas reportadas del estado de CI, las pruebas de backend autorizadas y los comandos npm reservados a Eduardo. No acredita ejecución de la suite ni CI verde. |
| `redactor-lms` | No afirmó una entrega inexistente en el LMS. |

## Pendientes para el cierre

- [ ] Arquitecto: especificar la condición de concurrencia del backend y revisar su garantía.
- [ ] Eduardo: mover `_catalogo` e instalar lo global sin sobrescrituras.
- [ ] Eduardo: push y publicación del PR de `practicas-ebac`.
- [ ] Claudia: auditoría del PR.

## Límite de memoria y continuidad

Engram quedó pausado en el runtime del host después de la compactación. No se inventa una sesión ni se afirma que el cierre del orquestador esté guardado. Un investigador informó un guardado propio; eso no prueba la identidad ni el guardado del orquestador.

**Siguiente paso:** resolver la condición de backend y completar instalación, publicación y auditoría. Este documento no sustituye la aprobación de Eduardo ni acredita el cierre de la fase 1.
