# M54 · Entregable 10: mensaje para el LMS

Lección: "Proyecto Empresa Aliada - M54 Entregable 10" (Generar las entidades de Base de Datos). Versión M54.3, etiqueta `m54.3`.
Adjuntos: `backend/tracking/models.py`, `backend/accounts/models.py` y `tracking.sql`.

---

Hola, Salvador:

Te comparto la entrega del M54 · Entregable 10 (entidades de la base de datos), versión M54.3. Además de las entidades, esta versión incluye la web completa de Hound Express funcionando con esos datos.

ENTIDADES
Guide, StatusHistory y User implementan todos los campos de la consigna. Los ajustes necesarios (llave primaria automática, número de guía de 22 caracteres, fechas con hora asignadas por el servidor, llaves foráneas reales y contraseña con hash) están explicados campo por campo en la matriz de requisitos:
https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/docs/entregas/m54/matriz-requisitos.md

Reglas del negocio: las etapas solo avanzan en orden, el historial es de solo inserción y el número de guía se valida en el modelo y en la base de datos.

CÓDIGO DE LAS ENTIDADES
Modelos de guías: https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/backend/tracking/models.py
Modelo de usuario: https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/backend/accounts/models.py
Migraciones de tracking: https://github.com/pipeTawns-x/Houndxpress/tree/practicas-ebac/backend/tracking/migrations
Migraciones de accounts: https://github.com/pipeTawns-x/Houndxpress/tree/practicas-ebac/backend/accounts/migrations
Script SQL: https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/docs/entregas/m54/tracking.sql

WEB COMPLETA
El sitio y el panel están hechos con React, TypeScript, Redux y Sass BEM, y usan una API en Django con datos reales de la base.
- Rastreo público de una o varias guías, con etapa, fecha y ciudad.
- Panel de personal con inicio de sesión: resumen, registro con búsqueda, alta de guías, avance de etapa, historial y archivo.
- Un salto de etapa se rechaza con error 409 y queda registrado.
- Diseño adaptado a móvil y escritorio. Las imágenes y el video son propios e ilustrativos; no son fotos reales de Hound Express.
Web: https://github.com/pipeTawns-x/Houndxpress/tree/practicas-ebac/frontend/src
API: https://github.com/pipeTawns-x/Houndxpress/tree/practicas-ebac/backend/tracking/api
Historias de usuario: https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/odd/tasks/web-completa.md

Alcance: aún no está desplegada en un servidor público, lo cual corresponde al M66. El portal de cliente, el blog y las alianzas quedan fuera porque todavía no hay contenido real confirmado.

DIAGRAMAS (ARCHIFY, CON LOS PATRONES DE DISEÑO DEL CÓDIGO)
Modelo de datos: https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/docs/diagramas/img/modelo-de-datos.png
Ciclo de vida de la guía: https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/docs/diagramas/img/ciclo-de-vida-guia.png
Arquitectura: https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/docs/diagramas/img/arquitectura.png
Secuencia de consultas: https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/docs/diagramas/img/secuencia-consultas.png

SEGURIDAD
Django 5.2.18 y DRF 3.18.3, controles de OWASP ASVS 5.0 nivel 1 cubiertos por pruebas y ningún archivo de configuración con secretos en el repositorio. La API y la sesión de la web pasaron por revisiones de seguridad independientes, y sus hallazgos se corrigieron con pruebas.
Checklist: https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/docs/entregas/m54/asvs-l1-checklist.md
Política de seguridad: https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/SECURITY.md

INVESTIGACIÓN
Estudio pasivo del sitio actual de Hound Express: https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/docs/investigacion/rea-sitio-actual.md

VERIFICACIÓN
157 pruebas de backend y 310 de frontend en verde, sin migraciones pendientes, check --deploy sin avisos, gitleaks sin hallazgos y CI en verde. El flujo completo también se probó en un navegador real contra la API.

VERSIÓN ENTREGADA
Etiqueta m54.3: https://github.com/pipeTawns-x/Houndxpress/tree/m54.3

Saludos,
Eduardo Torres
