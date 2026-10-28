# M54 · Entregable 10: mensaje para el LMS

Lección: "Proyecto Empresa Aliada - M54 Entregable 10" (Generar las entidades de Base de Datos). Versión M54.2, etiqueta `m54.2`.
Adjuntos: `backend/tracking/models.py`, `backend/accounts/models.py` y `tracking.sql`.

---

Hola, Salvador:
Te comparto la entrega del M54 · Entregable 10 (entidades de la base de datos), versión M54.2.
- Entidades: `Guide`, `StatusHistory` y `User` implementan todos los campos de la consigna. Los ajustes necesarios (llave primaria automática, número de guía de 22 caracteres, fechas con hora asignadas por el servidor, llaves foráneas reales y contraseña con hash) están explicados campo por campo en la [matriz de requisitos](https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/docs/entregas/m54/matriz-requisitos.md).
- Reglas del negocio: las etapas solo avanzan en orden, el historial es de solo inserción y el número de guía se valida en el modelo y en la base de datos.
- Código: [modelos de guías](https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/backend/tracking/models.py), [modelo de usuario](https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/backend/accounts/models.py), migraciones de [tracking](https://github.com/pipeTawns-x/Houndxpress/tree/practicas-ebac/backend/tracking/migrations) y de [accounts](https://github.com/pipeTawns-x/Houndxpress/tree/practicas-ebac/backend/accounts/migrations), y el script [tracking.sql](https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/docs/entregas/m54/tracking.sql).
- Diagramas con los patrones de diseño del código: [modelo de datos](https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/docs/diagramas/img/modelo-de-datos.png), [ciclo de vida de la guía](https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/docs/diagramas/img/ciclo-de-vida-guia.png), [arquitectura](https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/docs/diagramas/img/arquitectura.png) y [secuencia de consultas](https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/docs/diagramas/img/secuencia-consultas.png).
- Seguridad: Django 5.2.18 y DRF 3.18.3 con los parches más recientes, controles de OWASP ASVS 5.0 nivel 1 cubiertos por pruebas ([checklist](https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/docs/entregas/m54/asvs-l1-checklist.md) y [SECURITY.md](https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/SECURITY.md)) y ningún archivo de configuración con secretos en el repositorio.
- Investigación: [estudio pasivo del sitio actual de Hound Express](https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/docs/investigacion/rea-sitio-actual.md).
- Verificación: 109 pruebas en verde, sin migraciones pendientes, `check --deploy` sin avisos, OSV, gitleaks y semgrep sin hallazgos, y CI en verde.
- Versión entregada: [etiqueta `m54.2`](https://github.com/pipeTawns-x/Houndxpress/tree/m54.2).

Saludos,
Eduardo Torres
