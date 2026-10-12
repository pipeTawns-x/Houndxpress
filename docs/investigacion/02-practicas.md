# Fase 2 · Contraste de prácticas Hound

**Resultado:** M54 y M64 pendientes; M66 tiene base de frontend, pero no integración real demostrada.

**Alcance:** lectura estática, sin Git, npm, instalaciones, tests, examen ni cambios en el proyecto. PDF extraído a stdout, sin archivos intermedios.

**LMS no verificado en vivo:** la herramienta disponible abrió M54, pero redirigió a login. No accedí a credenciales. Las consignas siguientes provienen de Engram **#850/#851**, no de una sesión autenticada actual.

## 1. Fuentes

- **PDF oficial, 32 páginas:** :codex-file-citation{path="/Users/felipeeduardotorresaguilar/Desktop/houndxpress.pdf" purpose="source"}
- **Registro de requisitos:** :codex-file-citation{path="/Users/felipeeduardotorresaguilar/Desktop/houndxpress-practicas/docs/REQUISITOS_EBAC.md" purpose="source"} — líneas 34–41.
- **Loop, apéndices A/B y entregas:** :codex-file-citation{path="/Users/felipeeduardotorresaguilar/Desktop/houndxpress-practicas/docs/loops/05-LOOP-CODEX.md" purpose="source"} — líneas 219–234, 200–207 y 77–78.
- **Engram:** #850, consigna M54; #851, prácticas completas; #855, contexto general; #856, mejoras propuestas. **#856 contiene hipótesis de producto, no requisitos escolares.**

## 2. Matriz de cumplimiento

Las comillas indican extractos documentales; el contenido LMS está **recuperado de memoria**, no revalidado hoy.

| Práctica | Requisito y literal breve | Fuente / página | Cumplimiento actual | Pendiente |
|---|---|---|---|---|
| **M54 · Entregable 10** | “Crear las tablas y estructura de las tablas… y ejecutar las migraciones correspondientes.” | PDF p. 22; requisitos L37 | **No cumple:** modelos de tracking vacíos. | `Guide`, `StatusHistory`, migraciones y evidencia de aplicación. |
| M54 | “Generar las entidades de Base de Datos”: `Guide`, `StatusHistory`, `User`. | Engram #850/#851; LMS sin página | **Parcial:** existe `accounts.User(AbstractUser)` y migración inicial; no equivale todavía al esquema completo solicitado. | Mapear campos de la consigna, documentar adaptaciones y reutilizar el usuario existente. |
| **M64 · Entregable 11** | “GET”, “POST”, “PUT”: consulta, registro y actualización del estado. | PDF p. 22; requisitos L38 | **No cumple:** configuración URL sin endpoints de guías. | API DRF, validaciones del servidor y consulta de historial. |
| M64 | “Creación de los Endpoints”: viewsets, prefijo `api/`, rutas por acción; Postman. | Engram #851; apéndice A L223 | **No cumple:** adaptador frontend anticipado, pero usa otras rutas y POST para avanzar. | Implementar contrato escolar o compatibilidad explícita; actualización mediante PUT; evidencia Postman. |
| **M66 · Entregable 12** | “Publicar tu proyecto en GitHub… documentación necesaria para ser ejecutado en un ambiente local.” | PDF p. 22; entorno virtual en p. 21 | **Parcial documental:** README incluye arranque de ambas partes. No ejecutado ni publicación comprobada en esta revisión. | Documentación final coherente y reproducibilidad de la versión entregada. |
| M66 | Axios con URL base; POST validado, PUT, componentes sincronizados y errores claros. | Engram #851; apéndice A L223 | **Base existente:** Redux relee después de escrituras. Transporte actual `fetch`; datos demo por defecto. | Axios, API real, validaciones equivalentes y verificación del flujo completo. |
| M66 | Panel con activas, en tránsito y entregadas, actualizado automáticamente. | Engram #851; apéndice B L234 | **Desalineado:** panel cuenta “En tránsito” como etapas 1–4; loop establece solamente etapa 4. | Separar activas de tránsito; definir tratamiento de archivadas. |
| M66 | URL de aplicación publicada y repositorio actualizado. | Engram #851; apéndice A L224 | **No verificado:** no se comprobó despliegue funcional. | URL accesible con frontend, backend y persistencia operativos. |

### Evidencia de código

| Evidencia | Hallazgo |
|---|---|
| **Backend:** :codex-file-citation{path="/Users/felipeeduardotorresaguilar/Desktop/houndxpress-practicas/backend/tracking/models.py" purpose="source"} L1 | Vacío deliberadamente hasta M54. |
| **Usuario:** :codex-file-citation{path="/Users/felipeeduardotorresaguilar/Desktop/houndxpress-practicas/backend/accounts/models.py" purpose="source"} L6–10; :codex-file-citation{path="/Users/felipeeduardotorresaguilar/Desktop/houndxpress-practicas/backend/accounts/migrations/0001_initial.py" purpose="source"} L18–30 | Usuario propio existente; campo de contraseña de 128 caracteres. Migración presente no prueba que esté aplicada. |
| **Rutas:** :codex-file-citation{path="/Users/felipeeduardotorresaguilar/Desktop/houndxpress-practicas/backend/config/urls.py" purpose="source"} L7–11 | Incluye admin y `core`, no tracking. |
| **HTTP:** :codex-file-citation{path="/Users/felipeeduardotorresaguilar/Desktop/houndxpress-practicas/frontend/src/services/httpRepository.ts" purpose="source"} L6, 50–51, 102–119 | `/api/v1/guides/`; consulta por número; avance con **POST** a `/{number}/advance/`. |
| **Contrato:** :codex-file-citation{path="/Users/felipeeduardotorresaguilar/Desktop/houndxpress-practicas/frontend/src/domain/types.ts" purpose="source"} L42–65 | Usa `number`, `currentStage`, `history`; LMS describe `trackingNumber`, `currentStatus`, `StatusHistory`. Hace falta mapeo explícito. |
| **Sincronización:** :codex-file-citation{path="/Users/felipeeduardotorresaguilar/Desktop/houndxpress-practicas/frontend/src/store/guidesSlice.ts" purpose="source"} L63–96 | Registro y avance disparan nueva lectura; evidencia estática, no prueba de integración. |
| **Contadores:** :codex-file-citation{path="/Users/felipeeduardotorresaguilar/Desktop/houndxpress-practicas/frontend/src/components/panel/StageSummary.tsx" purpose="source"} L25–27 | Total incluye todas; tránsito = total − entregadas. |
| **README:** :codex-file-citation{path="/Users/felipeeduardotorresaguilar/Desktop/houndxpress-practicas/README.md" purpose="source"} L28–61, 107–117 | Arranque documentado; reconoce datos de demostración. |

## 3. Trampas y correcciones al apéndice A

1. **CRUD está en la p. 20, no en la 21.** Incluye “Eliminar”. La p. 22 enumera únicamente GET/POST/PUT; Engram #851 registra DELETE como **opcional**. No convertirlo en obligación inequívoca.

2. **El PDF escribe `manager.py` en p. 21.** Es una errata ya advertida por requisitos L41: el archivo del proyecto es `manage.py`.

3. **Contraseñas:** “20 caracteres solo guarda texto plano” es una conclusión incorrecta del apéndice. El tamaño no determina cómo se almacena la contraseña. La evidencia local es un campo de **128**, y no hay fundamento para exigir un hash universal de exactamente 89 caracteres.

4. **M54 trae ejemplos problemáticos**, según #850: `IntegerField` para ID sin PK, `AutoDateTimeField`, relación como entero y `DateField` donde se solicita fecha y hora. Son advertencias históricas; **no reproduje errores ni ejecuté comprobaciones Django** en esta sesión.

5. **No hay ejemplos de números de guía en el PDF.** El formato de 16 dígitos/22 alfanuméricos aparece en el frontend y en memoria; no atribuirlo al PDF ni afirmar que “ningún número real” cabe en 15 sin una fuente operativa adicional.

6. **El problema empresarial sí está explícito:** cinco etapas y responsables en p. 4; saltos y fechas posteriores, 31% de cumplimiento y pérdidas de 200k MXN en p. 5. Transacción, fechas del servidor e historial inmutable son respuestas técnicas documentadas en el loop, no citas literales del PDF.

7. **M66 exige más en LMS que en PDF**, según #851: integración y aplicación desplegada, además de GitHub/README. Cambiar `fetch` por Axios **no alcanza**: también divergen rutas, verbo de actualización, campos y contadores.

## 4. Entregables y etiquetas

| Práctica | Entrega registrada en las fuentes | Etiqueta prevista |
|---|---|---|
| M54 | Adjuntar `models.py` o scripts SQL; completar tablas y migraciones del PDF. | `m54` |
| M64 | ZIP o URL del repositorio; comprobación con Postman. | `m64` |
| M66 | URL de aplicación publicada + repositorio; README para ejecución local de ambas partes. | `m66` |

Las etiquetas son **convención del proyecto**, no exigencia identificada en el PDF. No comprobé su existencia ni sus destinos porque Git estaba excluido. El loop pide enlazar la versión etiquetada y que Eduardo envíe los mensajes LMS.

**Dictamen:** el apéndice A conserva el alcance principal, pero necesita corregir formulaciones y distinguir fuentes. La discrepancia más concreta es **POST de avance frente al PUT requerido**; la segunda, **tránsito 1–4 frente a etapa 4**.

## Key Learnings:

1. Una demo y un adaptador HTTP preparado no demuestran cumplimiento del backend.
2. Las consignas LMS siguen pendientes de revalidación autenticada; memoria histórica no equivale a evidencia en vivo.
