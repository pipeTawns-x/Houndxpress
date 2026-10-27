# Requisitos del proyecto de empresa aliada (EBAC)

Fuente: *Desarrollo Full Stack Python · Proyecto de empresa aliada*, documento en PDF de 32 páginas de EBAC, entregado por el alumno el 30 de septiembre de 2026. Aquí van los requisitos citados tal cual (entre comillas) y el estado de cada uno en el repositorio. Esta tabla manda sobre cualquier decisión técnica anterior que la contradiga.

## Lo que pide el proyecto

> "Se propone desarrollar una aplicación web para el seguimiento de paquetes, donde los usuarios podrán consultar el estado de sus envíos a través de una interfaz."
>
> "El sistema permitirá que cualquier usuario con acceso al sistema actualice el estatus de las guías, asegurando que el flujo de estados siga un orden lógico predefinido."
>
> "Entre las funciones que tendrá son: registro de guías; actualización del estatus durante el proceso de entrega; consulta del estado de envíos; y un historial de cambios de estado para asegurar transparencia y control en cada entrega."

Criterio de evaluación: "la calidad del producto final y la capacidad de satisfacer las expectativas del cliente".

## Frontend

| Requisito del documento | Módulo | Estado | Evidencia |
|---|---|---|---|
| "Registrar nuevas guías a través de un formulario" | 21 | Cumple | `/panel`, `RegisterGuideForm` |
| "Actualizar el estado de una guía seleccionando la siguiente etapa en el flujo" | 21 | Cumple | Botón "Avanzar a {siguiente etapa}", regla en `src/domain/guide.ts` |
| "Consultar el estado actual de una guía y su historial de cambios" | 21 | Cumple | `/rastreo` y cajón de historial del panel |
| HTML "semánticamente correcto, enfocándose en la jerarquía del contenido y la accesibilidad" | 6 | Cumple | Un `h1` por página, landmarks, enlace para saltar al contenido |
| "Uso de SASS" y "aplicar la metodología BEM y refactorizar los estilos a Sass" | 10 | Cumple | Sass con BEM y carpetas 7-1 en `frontend/src/styles/`; `sass` reemplazó a Tailwind |
| "Completamente responsiva" | 10 | Cumple | Capturas en 390 y 1440 px, sin desbordes horizontales en 360 a 1440 px |
| JavaScript: "validación de formularios y dinamismo en la UI" | 21 | Cumple | Validación del registro, del rastreo y del contacto |
| "Migrar la aplicación a React y TypeScript" | 30 | Cumple | React 19 + TypeScript estricto |
| "Integrar Redux para manejar el flujo de información entre componentes" | 32 | Cumple | `frontend/src/store/`: slice de guías con thunks; `useGuides` lee del almacén |
| "Implementar pruebas unitarias con Jest" | 34 | Cumple | Jest 30: 278 pruebas, incluidas las del slice, los thunks y el almacén |
| "Optimizar el sistema para SEO y accesibilidad" | 38 | Cumple en parte | Título y descripción por página, contraste AA, teclado. Falta `robots.txt`, `sitemap.xml` y metadatos Open Graph |
| "Alojar el proyecto en un servicio estático y guardarlo en un repositorio de Github" | 39 | Pendiente | El repositorio está en GitHub; falta publicar (por ejemplo GitHub Pages) |

## Backend

| Requisito del documento | Módulo | Estado | Evidencia |
|---|---|---|---|
| "Generar un proyecto en Django con la estructura general el cual contendrá los elementos iniciales" | 52 | Cumple | `backend/`, etiqueta `m52` |
| "Crear las tablas y estructura de las tablas… y ejecutar las migraciones correspondientes" | 54 | Pendiente | `backend/tracking/models.py` vacío a propósito |
| Endpoints "GET (Obtener la información del estado actual de una guía), POST (Registrar una guía), PUT (Actualizar el estatus de una guía)" con Django REST Framework | 64 | Pendiente | El frontend ya tiene `httpRepository` para este contrato |
| "README.md en el cual se describirá la documentación necesaria para clonar el repositorio y ejecutarlo en un ambiente local haciendo uso de un ambiente virtual" | 66 | Cumple desde M52 | README, probado por los jobs `readme (bash)` y `readme (powershell)` |

Nota: el documento escribe `manager.py`; el archivo real de Django es `manage.py`.

## Condiciones

Participar implica autorizar la cesión del proyecto a Hound Express y compartir nombre, teléfono y correo con la empresa para contacto interno; no implica remuneración ni contratación. Por eso el repositorio no lleva licencia propia hasta formalizar la cesión (README, "Derechos de uso").
