# M54 · Entregable 10: mensaje para el LMS

Lección: "Proyecto Empresa Aliada - M54 Entregable 10" (Generar las entidades de Base de Datos). Versión M54.1, etiqueta `m54.1`.
Adjuntos: `backend/tracking/models.py`, `backend/accounts/models.py` y `tracking.sql`.

---

Hola, Salvador:
Te comparto la entrega M54.1 de las entidades de base de datos.
- Modelo, sin cambios desde M54: `Guide` y `StatusHistory` en [models.py](https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/backend/tracking/models.py), más el campo de área en `User`. Etapas en orden estricto, historial de solo inserción, fechas asignadas por el servidor y número de guía validado en el modelo y en la base de datos.
- Migraciones y SQL: [migraciones](https://github.com/pipeTawns-x/Houndxpress/tree/practicas-ebac/backend/tracking/migrations) y [tracking.sql](https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/docs/entregas/m54/tracking.sql).
- Dependencias: Django 5.2.18 y DRF 3.18.3, actualizadas por avisos de seguridad.
- Seguridad: controles de OWASP ASVS 5.0 nivel 1 cubiertos por pruebas (HSTS, cookies `__Host-`, límite de peticiones, JSON en UTF-8 y política de contraseñas), [SECURITY.md](https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/SECURITY.md) con los plazos de parche y se eliminó `backend/.env.example`.
- Investigación y diseño: [matriz de requisitos](https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/docs/entregas/m54/matriz-requisitos.md), [checklist ASVS](https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/docs/entregas/m54/asvs-l1-checklist.md), [estudio pasivo del sitio actual con REA](https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/docs/investigacion/rea-sitio-actual.md) y [diagramas del modelo de datos y del ciclo de vida con patrones de diseño](https://github.com/pipeTawns-x/Houndxpress/blob/practicas-ebac/docs/diagramas/README.md).
- Verificación: `Ran 108 tests` OK; ruff limpio; `makemigrations` sin cambios pendientes; `check --deploy` con 0 avisos; OSV, gitleaks y semgrep con 0 hallazgos; CI en verde.
- Detalle: [etiqueta `m54.1`](https://github.com/pipeTawns-x/Houndxpress/tree/m54.1).

Saludos,
Eduardo Torres
