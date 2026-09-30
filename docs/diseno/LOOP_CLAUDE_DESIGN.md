# Loop para Claude Design

Prompt listo para pegar en Claude Design cuando haya créditos. Sirve para iterar el rediseño visual sobre lo que ya existe en `frontend/`, sin empezar de cero. Si Claude Design entrega un `.zip`, se descomprime en `docs/diseno/claude-design/` y se compara contra la ruta `/disenos` de la aplicación.

---

## Prompt

Eres el equipo de diseño de **Hound Express**, empresa de logística cross-border para ecommerce entre Estados Unidos y América Latina (hubs en Laredo y Miami, 10 puntos de entrada en LATAM, más de 15,000 m² de almacenes). Vas a rediseñar su sitio web y un panel interno de guías. Trabaja en español de México.

### Contexto fijo (no lo cambies)

- Marca: logotipo del sabueso en marino `#18233E` y aqua `#4CBED8`. El aqua nunca es texto sobre fondo claro (contraste 2.2:1); sobre claro usa `#167088`.
- Tipografías: Plus Jakarta Sans (títulos) e Inter (texto). Nada más.
- El proceso de cada guía tiene cinco etapas en orden estricto, cada una con su responsable: 1 Recepción de carga (Aduana), 2 Vehículo cargado (Aduana), 3 Vehículo liberado (Operaciones), 4 Vehículo en camino (Seguridad), 5 Carga entregada (KAM). La interfaz solo permite avanzar a la etapa siguiente.
- Número de guía: 16 dígitos que inician con 21, o 22 caracteres alfanuméricos.
- Usuarios: vendedor de ecommerce que evalúa el servicio, destinatario que rastrea su paquete desde el celular, personal que registra y avanza guías.

### Pantallas

Inicio, Rastreo (simple y múltiple, con línea de tiempo de las cinco etapas y estado "no encontrada"), Servicios, Cobertura, Nosotros, Preguntas frecuentes, Contacto, Panel de operaciones (resumen por etapa, registro de guía, lista con filtro, avanzar etapa, historial en cajón lateral), Índice de diseños y 404. Diseña cada una en 390 px y 1440 px.

### Criterios de aceptación

1. Contraste AA en todo texto; ningún estado comunicado solo con color.
2. Sin desplazamiento horizontal desde 360 px.
3. Foco visible y operable con teclado; animaciones apagables con `prefers-reduced-motion`.
4. Buscador de guía visible en la primera pantalla del Inicio, en móvil y escritorio.
5. Ilustraciones propias (rutas, nodos, paquetes), sin fotografías de banco.

### Loop de trabajo (repite hasta que el abogado no tenga objeciones de confianza alta)

1. **Propuesta**: presenta la dirección visual y las pantallas.
2. **Abogado del diablo**: ataca la propuesta. Por cada objeción da el supuesto que rompe, la evidencia (pantalla y elemento concretos), la consecuencia y la confianza (alta, media, baja). Revisa sobre todo: jerarquía del buscador, legibilidad de la línea de tiempo en 390 px, contraste, densidad del panel y coherencia entre sitio y panel.
3. **Arquitecto**: decide cada objeción (se atiende, se reduce o se descarta) con su razón, y define los cambios.
4. **Rediseño**: aplica los cambios del arquitecto.
5. **Segunda revisión del abogado** sobre el rediseño, con el mismo formato.
6. **Versión final del arquitecto**: entrega las pantallas ajustadas y una tabla de tokens (color, tipografía, radios, sombras, espaciado) que coincida con lo que se ve.

### Entregable

Un `.zip` con las pantallas en HTML (o imágenes a 1x y 2x), la tabla de tokens y un documento con las objeciones y decisiones de cada vuelta.

---

## Cómo se usó en este proyecto

Cuando se inició el rediseño no había créditos de Claude Design, así que el mismo loop se corrió dentro del repositorio:

| Paso del loop | Documento |
|---|---|
| Investigación | [`00-investigacion.md`](00-investigacion.md) |
| Propuesta | [`01-propuesta.md`](01-propuesta.md) |
| Abogado del diablo | [`02-abogado-del-diablo.md`](02-abogado-del-diablo.md) |
| Arquitecto | [`03-arquitecto.md`](03-arquitecto.md) |
| Rediseño | [`04-sistema-de-diseno.md`](04-sistema-de-diseno.md) y la aplicación en `frontend/` |
| Segunda revisión y versión final | [`05-revision-del-rediseno.md`](05-revision-del-rediseno.md) |
