# 01 · Propuesta de rediseño

Tesis que se somete al abogado del diablo:

> Hound Express necesita una sola aplicación web que junte lo que hoy está repartido: el sitio comercial, el rastreo de paquetes y una vista para el personal que registra y avanza las guías. Esa aplicación es el frontend del proyecto y el primer consumidor de la API Django.

## Para quién es cada parte

| Parte | Usuario | Tarea principal | Hoy |
|---|---|---|---|
| Sitio público | Vendedor de ecommerce que evalúa a Hound Express | Entender servicios, cobertura y cómo contactar | WordPress con cinco tipografías |
| Rastreo | Destinatario que espera un paquete | Saber en qué etapa va su guía | Página aparte con otro menú (`tracking.html`) |
| Panel de operaciones | Personal de Aduana, Operaciones, Seguridad y KAM | Registrar guías y avanzarlas por las cinco etapas en orden | No existe |

El panel ataca directamente el problema que el negocio reporta: "de 100 guías solo el 31% siguen el proceso como debe ser". Si la interfaz solo ofrece avanzar a la etapa siguiente, saltarse un paso deja de ser posible desde la pantalla, igual que el backend lo impedirá desde la API en M64.

## Pantallas propuestas

1. **Inicio**: propuesta de valor, buscador de guía en la primera pantalla, cifras, servicios, cómo viaja un paquete (las cinco etapas), cobertura, llamada al panel y contacto.
2. **Rastreo**: búsqueda simple o múltiple, línea de tiempo con las cinco etapas, historial de eventos, estados de "no encontrada".
3. **Servicios**: cross border, transporte aéreo, logística inversa, última milla y almacén.
4. **Cobertura**: hubs en Estados Unidos y México, países de LATAM.
5. **Nosotros**: filosofía y los seis ejes de cultura.
6. **Preguntas frecuentes**: acordeón con filtro.
7. **Contacto**: formulario, teléfonos por país y horarios.
8. **Panel de operaciones**: resumen por etapa, registro de guía, lista con búsqueda y filtro, avanzar etapa, historial y estado de la API.
9. **Índice de diseños**: guía de estilo viva con todas las pantallas y componentes.
10. **Página no encontrada**.

## Dirección visual

- Moderna y sobria: fondos claros con bloques en azul marino de marca, acentos aqua, mucho aire, esquinas redondeadas, sombras suaves.
- Dos tipografías: Plus Jakarta Sans para títulos, Inter para texto.
- Ilustraciones SVG propias: rutas y nodos sobre una retícula, no fotos de catálogo.
- Primero móvil: el 75–80% de las compras en México se hacen desde smartphone (dato del propio sitio, página Cross Border México), y el destinatario rastrea desde el teléfono.

## Qué no incluye

- Conexión al servicio de rastreo real de la empresa.
- Inicio de sesión del personal: llega con los endpoints protegidos de M64.
- Versión en inglés.
