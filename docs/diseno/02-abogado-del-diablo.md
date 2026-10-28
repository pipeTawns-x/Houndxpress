# 02 · Abogado del diablo sobre la propuesta

Tesis atacada: la de [`01-propuesta.md`](01-propuesta.md). Cada objeción cita la evidencia que la sostiene y termina con la confianza que merece. El veredicto de cada una está en [`03-arquitecto.md`](03-arquitecto.md).

## Objeción 1: el alcance inicial es un backend base, no un frontend

- **Supuesto que rompe:** que agregar un frontend completo encaja en el alcance de la Fase 0.
- **Evidencia:** el README define la Fase 0 como "el esqueleto del proyecto" y su tabla solo menciona Django, `manage.py`, entorno virtual y GitHub. La base del backend ya está publicada.
- **Consecuencia:** si alguien abre el repositorio y lo primero que ve es `frontend/`, puede no encontrar la base del backend.
- **Confianza:** alta.

## Objeción 2: una SPA en React agrega una segunda cadena de herramientas a un proyecto de Python

- **Supuesto que rompe:** que Node es gratis para quien clona el proyecto.
- **Evidencia:** el README promete "Necesitas Git y Python 3.10 o superior". Un frontend con Vite exige Node 20.19 o superior y `npm`.
- **Consecuencia:** quien solo tiene Python no puede ver el frontend, y el CI tarda más.
- **Confianza:** alta.

## Objeción 3: los datos de demostración pueden pasar por rastreo real

- **Supuesto que rompe:** que el visitante distingue una guía de ejemplo de una real.
- **Evidencia:** el backend no tiene tablas de guías hasta la Fase 1 ni endpoints hasta la Fase 2 (README, "Estado por fase").
- **Consecuencia:** una captura del rastreo "funcionando" en un documento afirma algo que el sistema no hace.
- **Confianza:** alta.

## Objeción 4: el frontend inventa un modelo de datos antes que el backend

- **Supuesto que rompe:** que los campos que hoy use la interfaz serán los de la Fase 1.
- **Evidencia:** `backend/tracking/models.py` estaba vacío a propósito: el esquema llegaba con la Fase 1.
- **Consecuencia:** retrabajo doble si la Fase 1 elige otros nombres, o un backend forzado a copiar decisiones tomadas en la interfaz.
- **Confianza:** media. Las cinco etapas, su orden y su responsable sí están fijados por el negocio (README, "Contexto del negocio").

## Objeción 5: usar la marca de la empresa en un rediseño no oficial

- **Supuesto que rompe:** que todo el material del sitio es reutilizable.
- **Evidencia:** fotografías, ilustraciones del perro y textos son de Hound Express; el README indica que no hay licencia hasta formalizar la cesión.
- **Consecuencia:** copiar el sitio completo mezcla material ajeno con código propio.
- **Confianza:** media.

## Objeción 6: "moderna, atractiva y responsiva" no se puede verificar

- **Supuesto que rompe:** que el resultado se puede declarar terminado.
- **Evidencia:** no hay criterio medible en la propuesta.
- **Consecuencia:** la revisión se vuelve de gusto y nunca cierra.
- **Confianza:** alta.

## Objeción 7: Docker contradice una decisión ya documentada

- **Supuesto que rompe:** que levantar el proyecto con Docker es coherente con el stack.
- **Evidencia:** `docs/STACK_HOUND_EXPRESS.md` descartó la plantilla Docker de terceros (`nickjj/docker-django-example`).
- **Consecuencia:** dos formas de ejecutar el proyecto que pueden divergir.
- **Confianza:** baja. Lo que se descartó fue esa plantilla (PostgreSQL, Redis, Celery, Tailwind y licencia ajena), no Docker.

## Objeción 8: el panel sin inicio de sesión es un panel abierto

- **Supuesto que rompe:** que el panel puede publicarse.
- **Evidencia:** la API exige sesión por defecto (`IsAuthenticated` en `REST_FRAMEWORK`), pero una pantalla de demostración no.
- **Consecuencia:** si alguien despliega el frontend tal cual, cualquiera "registra guías" (aunque solo en su navegador).
- **Confianza:** media.
