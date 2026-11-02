# 04 · Sistema de diseño y pantallas

Especificación visual del rediseño. Los tokens viven en `frontend/src/styles/abstracts/_tokens.scss` (variables de Sass, también expuestas como propiedades personalizadas en `:root`) y la ruta `/disenos` de la aplicación los muestra en vivo.

## 1. Color

Base: los dos colores del logotipo (`#18233E` marino y `#4CBED8` aqua). Contrastes calculados con la fórmula WCAG 2.2.

| Token | Valor | Uso | Contraste |
|---|---|---|---|
| `navy-950` | `#0B1426` | fondos oscuros profundos (héroe, pie) | blanco encima: 18.4:1 |
| `navy-900` | `#111C33` | tarjetas sobre fondo oscuro | — |
| `navy-800` | `#18233E` | **marino de marca**, títulos sobre claro | sobre blanco: 15.6:1 |
| `navy-700` | `#24324F` | bordes y divisores en oscuro | — |
| `navy-300` | `#AFC0D6` | texto secundario sobre marino | sobre `navy-800`: 8.4:1 |
| `aqua-500` | `#4CBED8` | **aqua de marca**: botón principal, acentos, etapa activa | `navy-950` encima: 8.5:1 |
| `aqua-400` | `#6FD0E4` | hover del botón principal | — |
| `aqua-100` | `#E8F7FB` | fondos suaves de acento | `navy-800` encima: 14.2:1 |
| `aqua-700` | `#167088` | **texto y enlaces aqua sobre claro** | sobre blanco: 5.7:1 |
| `sky-600` | `#2F6FC0` | información, enlaces secundarios | sobre blanco: 5.1:1 |
| `ink` | `#0F172A` | texto principal sobre claro | — |
| `muted` | `#475569` | texto secundario sobre claro | sobre blanco: 7.6:1 |
| `line` | `#E2E8F0` | bordes | — |
| `surface` | `#F6F8FB` | fondo de secciones alternas | — |
| `success` | `#15803D` | entregada | 5.0:1 |
| `warning` | `#B45309` | en espera, datos de demostración | 5.0:1 |
| `danger` | `#B91C1C` | errores, no encontrada | 6.5:1 |

Reglas:

1. **El aqua `#4CBED8` nunca es color de texto sobre fondo claro** (2.2:1). Sobre claro se usa `aqua-700`.
2. El botón principal es aqua con texto `navy-950`; el secundario es contorno.
3. Ningún estado se comunica solo con color: cada estado lleva icono o texto.

## 2. Tipografía

| Estilo | Familia | Peso | Tamaño / interlineado |
|---|---|---|---|
| Display (héroe) | Plus Jakarta Sans | 800 | `clamp(2.25rem, 5vw, 4rem)` / 1.05 |
| H1 de página | Plus Jakarta Sans | 800 | `clamp(2rem, 4vw, 3rem)` / 1.1 |
| H2 de sección | Plus Jakarta Sans | 700 | `clamp(1.5rem, 3vw, 2.25rem)` / 1.15 |
| H3 | Plus Jakarta Sans | 700 | 1.25rem / 1.3 |
| Cuerpo | Inter | 400 | 1rem / 1.6 |
| Cuerpo destacado | Inter | 400 | 1.125rem / 1.6 |
| Etiqueta | Inter | 600 | 0.875rem / 1.4 |
| Sobretítulo | Inter | 600 | 0.75rem, mayúsculas, tracking 0.12em, color `aqua-700` (o `aqua-500` en oscuro) |
| Número de guía | Inter con `tabular-nums` | 600 | — |

## 3. Espacio, forma y movimiento

- Retícula de 4 px. Secciones: 80 px de relleno vertical en escritorio y 56 px en móvil. Contenedor de 1200 px con 16 px de margen lateral en móvil.
- Radios: 12 px (controles), 16 px (tarjetas), 24 px (bloques grandes y héroe), completo para insignias.
- Sombras: suave (`0 1px 2px` + `0 8px 24px` con marino al 6–8%). Sin sombras duras.
- Movimiento: 150–250 ms, `ease-out`. Aparición suave de secciones y trazado de rutas en el héroe. Todo se apaga con `prefers-reduced-motion: reduce`.
- Foco: anillo de 3 px `aqua-500` con separación de 2 px, visible siempre con teclado.

## 4. Componentes

| Componente | Descripción | Estados |
|---|---|---|
| Encabezado | Fijo, fondo blanco translúcido con desenfoque al hacer scroll. Logo, navegación (Servicios, Cobertura, Rastreo, Nosotros, Preguntas, Contacto), botones "Rastrear" (principal) y "Panel" (contorno). | En móvil: botón de menú que abre un cajón a pantalla completa; se cierra con `Esc` y al navegar. |
| Botón | Principal (aqua), secundario (contorno marino o blanco en oscuro), fantasma. Alturas 40 y 48 px. | hover, foco, deshabilitado, cargando |
| Campo de texto | Etiqueta visible arriba, ayuda y error debajo con `aria-describedby`. | error con icono y texto |
| Buscador de guía | Campo grande con icono, botón "Rastrear", interruptor "Rastreo múltiple" que cambia a área de texto (hasta 10 guías, una por línea). | validación de formato antes de buscar |
| Línea de tiempo de etapas | Las cinco etapas con número, nombre, departamento y fecha. Completadas: círculo aqua con palomita. Actual: anillo pulsante. Pendientes: gris. Horizontal desde 768 px, vertical en móvil. | — |
| Insignia de etapa | Píldora con punto de color y nombre corto de la etapa. Entregada en verde. | — |
| Tarjeta de cifra | Número grande en Plus Jakarta Sans y descripción. | — |
| Tarjeta de servicio | Icono en cuadro aqua suave, título, texto y lista de puntos. | hover eleva la tarjeta |
| Mapa de red | SVG propio: retícula de puntos, nodos en coordenadas reales de cada ciudad (proyección equirrectangular), arcos entre hubs. | nodo con etiqueta |
| Tabla de guías | Número, destinatario, ruta, servicio, etapa, última actualización y acciones. En móvil se convierte en tarjetas. | vacía, filtrada sin resultados |
| Cajón de historial | Panel lateral con el detalle y los eventos de una guía. Atrapa el foco, se cierra con `Esc` o clic fuera. | — |
| Aviso de demostración | Banda `warning` con icono: "Datos de demostración: se guardan solo en este navegador". | — |
| Estado de la API | Punto y texto: "API en línea · BD ok", "API sin conexión". Consulta `/api/v1/health/`. | cargando, en línea, sin conexión |
| Acordeón | `<details>`/`<summary>` con estilo propio y filtro de texto. | abierto, cerrado |
| Pie | Fondo `navy-950`: logo blanco, lema "We move ecommerce globally!", enlaces, contacto por país, horario, estado de la API y aviso de proyecto académico. | — |

## 5. Pantallas

### Inicio `/`

1. **Héroe** sobre `navy-950` con degradado radial aqua muy tenue y la ilustración de rutas. Sobretítulo "Logística cross-border para ecommerce", título "Movemos tu ecommerce de local a global", texto de apoyo y el **buscador de guía** dentro de una tarjeta blanca. Debajo: "¿No tienes tu número? Está en el correo de tu compra".
2. **Cifras**: 2 hubs en USA · 10 puntos de entrada en LATAM · +15,000 m² de almacenes · +3,000 puntos de recolección.
3. **Servicios**: cinco tarjetas con enlace a `/servicios`.
4. **Cómo viaja tu paquete**: las cinco etapas con departamento y una frase de qué pasa en cada una.
5. **Cobertura**: mapa de red y lista de hubs; enlace a `/cobertura`.
6. **Panel**: bloque oscuro "Ten el control de tu operación" con vista previa del panel y botón.
7. **Alianzas y afiliaciones**: Amazon LATAM y Walmart Marketplace como tarjetas de texto; IATA, COFOCE y Aftership como insignias de texto.
8. **Preguntas**: tres preguntas frecuentes y enlace a todas.
9. **Contacto**: llamada a la acción con teléfono y botón.

### Rastreo `/rastreo`

Título "Rastrea tu paquete", buscador y lista de guías de ejemplo para probar. Acepta `?guia=NUMERO` (y varias separadas por coma) para compartir el resultado. Resultado por guía: tarjeta con número (copiable), insignia de etapa, origen → destino, servicio, fecha estimada, línea de tiempo y eventos del más reciente al más antiguo. Guía inexistente: estado vacío con ilustración y los pasos de la pregunta frecuente correspondiente.

### Servicios `/servicios`

Encabezado de página y cinco secciones alternadas (texto e ilustración/icono): Cross border, Transporte aéreo, Logística inversa, Última milla, Almacén; cada una con sus cifras del sitio actual. Cierre con llamada a contacto.

### Cobertura `/cobertura`

Mapa de red grande, tarjetas de hubs (Laredo, Miami, Nuevo Laredo, Ciudad de México, Monterrey, Guadalajara) con su función, y tarjetas de países de LATAM.

### Nosotros `/nosotros`

Filosofía en dos columnas y rejilla de los seis ejes con icono.

### Preguntas `/preguntas`

Buscador de texto y acordeón con las preguntas del sitio actual; si el filtro no encuentra nada, estado vacío con enlace a contacto.

### Contacto `/contacto`

Formulario (nombre, correo, teléfono, asunto, número de guía opcional, mensaje, aceptación de privacidad) con validación en el cliente. Como no hay backend de mensajes, al enviar abre el cliente de correo con `mailto:` y el mensaje armado, y lo dice antes de enviar. Al lado: tarjetas de contacto por país y horario.

### Panel de operaciones `/panel`

1. Encabezado del panel: título, estado de la API y aviso de demostración con botón "Restablecer datos de ejemplo".
2. Resumen: total de guías, en tránsito (etapas 1–4), entregadas, y barra de distribución por etapa.
3. Registrar guía: número (con botón "Generar"), origen, destino, destinatario, servicio. Toda guía nueva nace en "Recepción de carga".
4. Lista: búsqueda por número o destinatario, filtro por etapa, orden por última actualización. Acciones por fila: "Avanzar a {siguiente etapa}" (deshabilitado si ya se entregó) y "Historial".
5. Cajón de historial con la línea de tiempo vertical.

### Índice de diseños `/disenos`

Guía de estilo viva: lista de todas las pantallas con enlace y descripción, paleta con contrastes, escala tipográfica, botones, campos, insignias, línea de tiempo y tarjetas.

### No encontrada `*`

Mensaje, ilustración del paquete extraviado y enlaces a Inicio y Rastreo.
