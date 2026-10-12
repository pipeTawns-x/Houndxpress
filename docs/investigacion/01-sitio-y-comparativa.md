# 01 · Sitio actual y comparativa

**Fecha de consulta:** 2026-10-12  
**Alcance:** preparación de fase 2. Inventario actualizado con la evidencia aportada de Playwright; las lecturas de contenido anteriores siguen siendo parciales. Sin nueva investigación, navegación autenticada, consultas de guías ni invocaciones de API en esta actualización.

## 1. Resultado y límites

**Sitemap verificado: 26 URLs; contenido auditado de forma parcial.** La evidencia aportada registra lectura real del [sitemap oficial](https://www.hound-express.com/hx/page-sitemap.xml) con Playwright, mediante `browser_navigate` y `evaluate`, el **2026-10-12T22:34Z**. Esta actualización documental no repitió esa navegación.

Los intentos anteriores por web/MCP fallaron (incluido `fetch failed`); la lectura posterior con Playwright resuelve el inventario, no los fallos de extracción de cada página ni la revisión de seguridad. El antecedente histórico #816 queda como referencia, no como fuente del inventario actual.

**26 menos cuatro exclusiones históricas = 22 páginas a conservar.** Las exclusiones son `/inicio/`, `/nosotros_anterior/`, `/servicio-ecommerce-anterior/` y `/banners/`; su pertenencia al sitemap está verificada, pero la decisión de excluirlas sigue siendo histórica.

**“Lectura” significa texto público extraído, no interacción ni validación visual.** Un fallo del lector no demuestra que la página esté caída. El sitemap no equivale a contenido auditado de todas sus entradas.

## 2. Inventario exacto del sitemap: 26 URLs

Todas las filas pertenecen al XML verificado a las 22:34Z. La última columna conserva el alcance de las lecturas parciales anteriores; no describe una nueva auditoría de contenido.

| # | URL oficial | Lectura de contenido / límite |
|---|---|---|
| 1 | [https://www.hound-express.com/hx/](https://www.hound-express.com/hx/) | Texto leído |
| 2 | [https://www.hound-express.com/hx/amazonspn/](https://www.hound-express.com/hx/amazonspn/) | Fuente inaccesible mediante lector |
| 3 | [https://www.hound-express.com/hx/blog/](https://www.hound-express.com/hx/blog/) | Texto leído |
| 4 | [https://www.hound-express.com/hx/alianzas/](https://www.hound-express.com/hx/alianzas/) | Fuente inaccesible mediante lector |
| 5 | [https://www.hound-express.com/hx/tracking/](https://www.hound-express.com/hx/tracking/) | Fuente inaccesible mediante lector |
| 6 | [https://www.hound-express.com/hx/noticias/](https://www.hound-express.com/hx/noticias/) | Texto leído; fuente extraída antigua |
| 7 | [https://www.hound-express.com/hx/terminos-y-condiciones/](https://www.hound-express.com/hx/terminos-y-condiciones/) | Fallo: timeout |
| 8 | [https://www.hound-express.com/hx/privacidad/](https://www.hound-express.com/hx/privacidad/) | Documento recuperado; no auditoría legal |
| 9 | [https://www.hound-express.com/hx/servicio-cargo/](https://www.hound-express.com/hx/servicio-cargo/) | Fallo: timeout |
| 10 | [https://www.hound-express.com/hx/servicio-customs/](https://www.hound-express.com/hx/servicio-customs/) | Texto leído |
| 11 | [https://www.hound-express.com/hx/servicio-parcel/](https://www.hound-express.com/hx/servicio-parcel/) | Texto leído |
| 12 | [https://www.hound-express.com/hx/preguntas-frecuentes/](https://www.hound-express.com/hx/preguntas-frecuentes/) | Texto leído |
| 13 | [https://www.hound-express.com/hx/inicio/](https://www.hound-express.com/hx/inicio/) | Exclusión histórica; contenido no reconsultado |
| 14 | [https://www.hound-express.com/hx/nosotros/](https://www.hound-express.com/hx/nosotros/) | Texto leído |
| 15 | [https://www.hound-express.com/hx/servicio-ecommerce-anterior/](https://www.hound-express.com/hx/servicio-ecommerce-anterior/) | Exclusión histórica; contenido no reconsultado |
| 16 | [https://www.hound-express.com/hx/nosotros_anterior/](https://www.hound-express.com/hx/nosotros_anterior/) | Exclusión histórica; contenido no reconsultado |
| 17 | [https://www.hound-express.com/hx/servicio-ecommerce/](https://www.hound-express.com/hx/servicio-ecommerce/) | Texto leído |
| 18 | [https://www.hound-express.com/hx/cross-border-mexico/](https://www.hound-express.com/hx/cross-border-mexico/) | Texto leído |
| 19 | [https://www.hound-express.com/hx/cross-border-argentina/](https://www.hound-express.com/hx/cross-border-argentina/) | Texto recuperado; extracción acotada |
| 20 | [https://www.hound-express.com/hx/cross-border-colombia/](https://www.hound-express.com/hx/cross-border-colombia/) | Texto leído |
| 21 | [https://www.hound-express.com/hx/cross-border-chile/](https://www.hound-express.com/hx/cross-border-chile/) | Fallo: `Cache miss` |
| 22 | [https://www.hound-express.com/hx/cross-border-brasil/](https://www.hound-express.com/hx/cross-border-brasil/) | Fallo: `Cache miss` |
| 23 | [https://www.hound-express.com/hx/contactanos/](https://www.hound-express.com/hx/contactanos/) | Texto leído; formulario no enviado |
| 24 | [https://www.hound-express.com/hx/banners/](https://www.hound-express.com/hx/banners/) | Exclusión histórica; contenido no reconsultado |
| 25 | [https://www.hound-express.com/hx/alianza-amazon-latam/](https://www.hound-express.com/hx/alianza-amazon-latam/) | Contenido no revalidado en esta actualización |
| 26 | [https://www.hound-express.com/hx/walmart-marketplace/](https://www.hound-express.com/hx/walmart-marketplace/) | Contenido no revalidado en esta actualización |

**Fuentes adicionales, fuera de estas 26 entradas:**

- [Tracking raíz](https://www.hound-express.com/tracking.html): extracción anterior limitada al encabezado; un resultado indexado muestra campo de guía, acción de rastrear y modalidad múltiple. `tracking.html` **no es una de las 26 URLs del sitemap**.
- [Alias histórico de tracking](https://www.hound-express.com/hx/tracking.html/): 404 heredado de #816, no revalidado; tampoco pertenece a estas 26 entradas.
- [Inicio en inglés](https://www.hound-express.com/hx/en/): texto recuperado anteriormente; no se verificó todo el espejo y no integra esta lista.

### Diferencias frente al mapa 1 a 1 y las lecturas parciales

| Hallazgo | Implicación para fase 2 |
|---|---|
| El sitemap incluye el índice `/alianzas/` y tres instancias: `/alianza-amazon-latam/`, `/walmart-marketplace/` y `/amazonspn/` | No son entradas sustitutas: conservar las cuatro. No inferir equivalencias ni redirecciones ni dar su contenido por auditado. |
| Cargo, Customs y Parcel no tienen filas propias en el mapa anterior | Resolver conservación de contenido antes de afirmar réplica completa. |
| Blog y Noticias se agrupan en el mapa | Separar artículos propios de menciones externas. |
| La documentación menciona tres URLs de rastreo | Solo `/hx/tracking/` pertenece a estas 26; distinguir página del sitemap, URL externa al inventario y alias histórico. |
| `/en/` figura como extensión opcional | No confundir prioridad de implementación con ausencia de contenido; espejo completo no auditado. |

## 3. Arquitectura de contenido observada

| Familia | Contenido y estructura | Transferencia propuesta |
|---|---|---|
| Inicio | Propuesta comercial, cobertura, cifras, portal, alianzas y contacto. [Fuente](https://www.hound-express.com/hx/) | Dos accesos claros: destinatario que rastrea y empresa que contrata |
| Nosotros | Filosofía, cultura, ambiente e impacto social. [Fuente](https://www.hound-express.com/hx/nosotros/) | Conservar secciones; no limitarse a los seis ejes del inventario anterior |
| Ecommerce | Cross-border, aéreo, logística inversa, última milla y almacén. [Fuente](https://www.hound-express.com/hx/servicio-ecommerce/) | Plantilla de servicio con navegación interna |
| País | Contexto del mercado y argumentos comerciales; comprobado en México y Colombia. [México](https://www.hound-express.com/hx/cross-border-mexico/), [Colombia](https://www.hound-express.com/hx/cross-border-colombia/) | Plantilla compartida con contenido específico; no inventar tiempos por país |
| Servicios adicionales | Customs describe comercio exterior; Parcel, mensajería y PO Box. [Customs](https://www.hound-express.com/hx/servicio-customs/), [Parcel](https://www.hound-express.com/hx/servicio-parcel/) | Preservar su contenido, aunque cambie la agrupación |
| Editorial | Noticias enlaza medios; Blog presenta artículos propios con fecha y categoría. [Noticias](https://www.hound-express.com/hx/noticias/), [Blog](https://www.hound-express.com/hx/blog/) | Dos modelos editoriales, no una colección indistinta |
| Ayuda y contacto | FAQ operativa; formulario con identidad, asunto, guía, mensaje y privacidad. [FAQ](https://www.hound-express.com/hx/preguntas-frecuentes/), [Contacto](https://www.hound-express.com/hx/contactanos/) | Ayuda contextual y contacto separado de la contratación |

Las cifras comerciales son **afirmaciones del sitio**, no datos auditados. El portal anuncia capacidades, pero **no se verificaron tras autenticación**.

## 4. Tracking: flujo y estados

### Evidencia disponible

1. **Entrada:** campo de guía y acción de rastrear; modalidad múltiple visible en contenido indexado. No se enviaron búsquedas. [Tracking](https://www.hound-express.com/tracking.html)
2. **Ayuda:** la FAQ explica cómo obtener la guía y menciona formatos habituales de 16 o 22 caracteres. Esto no prueba una validación exhaustiva del formulario. [FAQ](https://www.hound-express.com/hx/preguntas-frecuentes/)
3. **Resultado documentado:** la documentación pública de Sabueso describe historial con código, descripción y fecha, además de errores. **Contrato documental, no respuesta observada.** [TrackOrder](https://apis.hound-express.com/reference/trackorder)

### Estados: no mezclar categorías

| Categoría | Evidencia / alcance |
|---|---|
| Incidencias operativas | FAQ: detenido en aduana, importación prohibida, entregado sin recibir, extraviado y devuelto |
| Historial de eventos | Documentado por Sabueso; presentación actual no comprobada |
| Vacío, validando, cargando, sin resultados, fallo de red | **Estados propuestos para el rediseño**, no observados mediante interacción |
| Cinco etapas secuenciales del proyecto | Regla local de demostración; no equivalen al catálogo completo de Sabueso |

**Flujo propuesto:** ingresar guía → validar → cargar → mostrar estado e historial → ofrecer ayuda pertinente. Separar “guía no encontrada” de “servicio no disponible”; no convertir incidentes en etapas obligatorias.

## 5. Seguridad: observada, documentada y heredada

| Nivel | Hallazgo | Límite |
|---|---|---|
| Observado en contenido | Contacto presenta aceptación de privacidad; FAQ contiene enlace textual HTTP al rastreo | No prueba validación del consentimiento ni comportamiento de redirección |
| Documentado oficialmente | Sabueso describe autenticación mediante identificador de cliente y clave de socio, roles y límites de acceso | No se probó su aplicación efectiva. [Documentación](https://apis.hound-express.com/docs/getting-started) |
| Heredado del repositorio | Investigación anterior reporta una clave de socio en el JS público, dependencias antiguas e inyección de navegación con jQuery | **No revalidado en esta sesión**; no se leyó ni reprodujo ningún valor |
| No verificable aquí | [JS público del rastreo](https://www.hound-express.com/js/hound_express_tracking_addon.js) | Web: `Cache miss`; MCP: tipo `application/javascript` no admitido |
| No evaluado | Autorización por guía, enumeración, CORS, CSP, cookies, límites reales y exposición de datos personales | No afirmar vulnerabilidad ni protección sin evidencia |

**Criterio para fase 2:** no portar credenciales ni conectar Sabueso real. Mantener datos de demostración. Una eventual integración requiere autorización y secretos fuera del cliente; no asumir que un proxy, por sí solo, resuelve autorización o abuso.

## 6. Comparativa de siete referentes

**Las capacidades documentadas no se presentan como flujos ejecutados.**

| Referente y fuente oficial | Evidencia leída | Patrón transferible / límite |
|---|---|---|
| [Kakobuy](https://www.kakobuy.com/) | Solo aviso de aplicación dependiente de JavaScript | **Sin patrón funcional verificable**. No atribuir login, almacén, consolidación ni tracking |
| [17TRACK](https://www.17track.net/en/widget) · [ayuda pública](https://buyer.17track.net/en/myshipment) | Campo + acción; ayuda para transportista desconocido o detección incorrecta | Entrada simple y recuperación ante ambigüedad; no requiere adoptar su integración |
| [AfterShip](https://www.aftership.com/track) | Documenta estados normales y excepciones; incluye mensaje de cuota excedida | Separar progreso logístico de errores del servicio; no prometer ETA predictiva sin datos |
| [DHL México](https://www.dhl.com/mx-es/home/rastreo.html) | FAQ sobre identificador, formato y demora hasta la aparición de eventos | Explicar “todavía sin información”; no copiar sus plazos como SLA de Hound |
| [FedEx México](https://www.fedex.com/es-mx/tracking.html) | Campo de rastreo; distingue consulta pública y rastreo avanzado con sesión | Separar rastreo de destinatarios y herramientas de cuenta; login no probado |
| [Estafeta](https://www.estafeta.com/rastrear-envio) | Ayuda sobre identificadores, ausencia de información y advertencia antifraude; rastreo en iframe | Ayuda junto a la tarea y aviso antifraude contextual; resultado del iframe no probado |
| [99minutos](https://www.99minutos.com/) · [rastreo](https://tracking.99minutos.com/) | Portada separa “Rastrear envío” de contacto comercial; rastreo sin texto extraíble | Diferenciar destinatario y comprador B2B; no atribuir estados ni funciones al rastreador |

## 7. Cierre de preparación

La evidencia permite preparar **familias de contenido, separación de audiencias y estados de interfaz**. El inventario del sitemap sí está verificado (26/26); no permite certificar réplica 22/22, lectura completa de contenido ni seguridad actual del JS.

Pendientes concretos:

- Completar las lecturas de contenido fallidas, incluidas las páginas de alianzas; sus rutas ya están verificadas en el sitemap.
- Revisar por separado alias y exclusiones históricas sin confundirlos con la pertenencia al XML.
- Mantener separados contenido observado, documentación oficial y antecedentes históricos.

## Key Learnings:

1. Blog y Noticias tienen estructuras distintas; fusionarlos exige conservar esa diferencia.
2. Un fallo de lectura no demuestra una caída, y un contrato de API no demuestra un flujo ejecutado.
3. La exposición histórica de una clave no debe presentarse como hallazgo actual sin revalidación.
