# 05 · Segunda revisión: abogado del diablo sobre el rediseño y versión final del arquitecto

Fecha: 30 de septiembre de 2026. Esta vuelta revisa lo que se construyó en `frontend/` a partir de [`03-arquitecto.md`](03-arquitecto.md) y [`04-sistema-de-diseno.md`](04-sistema-de-diseno.md). Lo implementó un agente (Claude Sonnet) y lo auditó otro (Claude Opus) de tres formas:

1. Con las pruebas y la compilación del agente, repetidas desde una instalación limpia.
2. Con capturas de las 12 pantallas en 390 y 1440 px, revisadas una por una. Son las del [índice de diseños](indice.md).
3. Con una revisión de código de todo `frontend/src`, hecha con la skill `code-review`.

## Objeciones sobre el rediseño

| # | Objeción | Evidencia | Confianza | Veredicto del arquitecto | Cambio aplicado |
|---|---|---|---|---|---|
| R1 | En móvil, el resultado del rastreo queda enterrado | En 390 px, el aviso de demostración con las 8 guías de ejemplo iba antes del resultado y lo empujaba unos 1000 px hacia abajo (`rastreo-resultado-movil`) | alta | **Se atiende** | Antes de buscar, el aviso va arriba para invitar a probar; después de buscar, el resultado va primero y el aviso debajo (`pages/Tracking.tsx`) |
| R2 | La ilustración del héroe compite con el texto en teléfonos | En 390 px, el avión y la caja quedaban detrás del título y del párrafo al 30% de opacidad | media | **Se atiende** | La ilustración se oculta por debajo de 640 px; de 640 a 1023 px queda al 30% a la derecha (`pages/Home.tsx`) |
| R3 | Terminar el avance de una guía reactivaba el botón de otra | `GuidesTable` guardaba una sola guía "ocupada". Avanzar A y luego B, y que A termine primero, volvía a habilitar B con su petición pendiente: un segundo clic la avanzaba dos etapas | alta | **Se atiende** | Un `Set` de guías en curso más una referencia que bloquea el doble clic. Prueba nueva: sin la corrección falla y con ella pasa |
| R4 | El formulario de registro no validaba antes de enviar | Los errores por campo solo aparecían porque el repositorio de demostración valida. Con `VITE_DATA_SOURCE=api`, los datos inválidos llegarían al servidor sin marcar ningún campo | alta | **Se atiende** | `RegisterGuideForm` valida con `validateNewGuideInput` antes de llamar al repositorio y enfoca el primer campo con error. Prueba nueva: el repositorio no se llama |
| R5 | Una fecha inválida tiraba la página de rastreo | `isGuide` solo comprobaba que `createdAt` y `at` fueran texto, y `estimatedDeliveryWindow` lanza una excepción con una fecha que no se puede leer | media | **Se atiende** | `isGuide` exige fechas que `Date.parse` entienda. Prueba nueva |
| R6 | Versiones por debajo de la última | react-router 7.18 y no 8.4; jest-dom 6.9; TypeScript 6.0 | media | **Se acepta** | Son las últimas compatibles con `engines: node >=20.19`, que el README promete, y se verificaron con Node 20.20 y 22.22. Subir exige Node 22.22 en todo el equipo; se documenta en `frontend/README.md` |
| R7 | lightningcss tiene licencia MPL-2.0 | Árbol del lockfile | baja | **Se acepta y se documenta** | Solo se usa al compilar y no se modifica. La explicación está en `docs/STACK_HOUND_EXPRESS.md` |
| R8 | El horario de atención no coincide entre fuentes | El pie del sitio actual dice lunes a viernes 09:00–18:00; su página de preguntas frecuentes dice 08:00–18:00 para la línea 55 4000 1920 opción 2 | media | **Pendiente de Hound Express** | Se conservan las dos redacciones tal como están en el sitio de la empresa. Es la primera pregunta para el contacto de la empresa |
| R9 | La asignación de alianzas es una inferencia | El sitio actual no dice qué texto corresponde a Walmart Marketplace | baja | **Pendiente de Hound Express** | "Vende y envía de México a EE. UU." quedó en Walmart Marketplace y "Vende en Amazon LATAM" en Amazon LATAM |

## Verificación final

Los comandos de esta sección se corrieron después de aplicar los cambios.

| Comprobación | Resultado |
|---|---|
| `npm run lint` | sin errores ni advertencias |
| `npm run typecheck` | sin errores |
| `npm test` | 20 archivos, 235 pruebas en verde (232 del agente más 3 de regresión de esta revisión) |
| `npm run build` | JavaScript inicial ≈118 KB comprimido (entrada 91.5 KB, bloque compartido 26.6 KB, runtime 0.4 KB); panel e índice de diseños cargan aparte (6.2 y 5.0 KB) |
| 12 pantallas × 2 anchos | sin desplazamiento horizontal, un `h1` por página y cero errores en consola, con el backend real respondiendo `/api/v1/health/` |
| `docker compose up` | las dos imágenes construyen. nginx sirve el SPA y sus rutas (`/rastreo` incluida) y reenvía `/api/v1/health/` con respuesta `{"status":"ok","database":"ok"}`. El login del admin pasa la validación CSRF a través de `:8080`, y los recursos de `/assets/` salen con caché de un año |

## Lo que no se verificó

- Firefox y Safari: solo Chromium.
- Lectores de pantalla y auditoría automática con axe: la accesibilidad se probó con roles y atributos en las pruebas, con el contraste calculado y con navegación por teclado.
- El repositorio HTTP contra una API real: los endpoints de guías llegan en M64 y hoy se prueba con `fetch` simulado.

## Versión final

El sistema de diseño de [`04-sistema-de-diseno.md`](04-sistema-de-diseno.md) queda como está. La implementación agregó cinco tokens, documentados en `/disenos`:

- `edge` (`#75849A`), el borde de los campos, con 3.8:1 sobre blanco (mínimo 3:1 para componentes).
- Cuatro fondos suaves de estado (`success`, `warning`, `danger` y `sky` en versión *soft*), con texto de 4.5:1 o más.

El anillo de foco suma un aro marino entre el aqua y el fondo claro, porque el aqua solo da 2.2:1 sobre blanco.
