---
name: ebac-practicas-hound
description: "Trigger: M54, M64, M66, entregables, LMS. Prepara prácticas Hound con trazabilidad y filtro escolar."
license: Apache-2.0
metadata:
  author: "Hound Express"
  version: "1.0"
---

## Activation Contract
Usa esta skill para preparar o revisar entregas M54, M64 y M66.
Inputs: título de asignación LMS, consigna completa, requisito y evidencias reales.

## Hard Rules
- Prioriza REQUISITOS_EBAC; no confundas numeración del PDF y del LMS ni inventes M59.
- M54: Guide, StatusHistory y User; entrega models.py o SQL adjuntos.
- M64: viewsets, prefijo api/, crear-guia, actualizar-guia/ID, obtener-guia/ID; eliminar es opcional. Entrega ZIP o URL y evidencia Postman.
- M66: Axios con URL base, POST validado en ambas capas, PUT, contadores automáticos, componentes sincronizados, errores claros y pruebas de flujo; entrega app publicada, repo y README local.
- Evita IntegerField como PK sin declararla, AutoDateTimeField inexistente, relaciones como enteros sueltos, trackingNumber de 15 y contraseñas en texto plano.
- Conserva fecha y hora; verifica capacidad para guías de 16 dígitos o 22 alfanuméricos contra la fuente.
- Nunca muevas etiquetas m52/m54/m64/m66 sin autorización; enlaza la etiqueta de entrega, no solo main.
- Nunca traslades loops, mensajes LMS, notas, Word, capturas escolares ni prompts a producto.
- Nunca reutilices agentes o supuestos de carni como plantilla.

## Decision Gates
Si fuente, etiqueta o publicación no están verificadas, deja el punto pendiente; no declares entrega completada.

## Execution Steps
1. Contrasta la consigna y su contexto con el apéndice A.
2. Relaciona cada requisito con archivo, capa y evidencia; separa demo de backend real.
3. Revisa el filtro escolar antes de proponer integración a pruebas y main.

## Output Contract
Entrega checklist verificable, adjuntos/enlaces comprobados y borrador LMS en español profesional.
Indica qué se ejecutó, qué se reportó y qué falta; nunca inventes calificaciones.

## References
- `CLAUDE.md`: ramas, permisos y hoja de ruta.
- `docs/REQUISITOS_EBAC.md`: autoridad de requisitos.
- `docs/loops/05-LOOP-CODEX.md`: apéndice A.
