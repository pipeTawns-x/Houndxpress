# 02 · Abogado del diablo sobre la propuesta

Tesis atacada: la de [`01-propuesta.md`](01-propuesta.md). Cada objeción cita la evidencia que la sostiene y termina con la confianza que merece. El veredicto de cada una está en [`03-arquitecto.md`](03-arquitecto.md).

## Objeción 1: la entrega M52 pide un proyecto Django vacío, no un frontend

- **Supuesto que rompe:** que agregar un frontend completo ayuda a la calificación de M52.
- **Evidencia:** el README define M52 como "el esqueleto del proyecto" y su tabla de requisitos solo menciona Django, `manage.py`, entorno virtual y GitHub. La etiqueta `m52` ya está entregada.
- **Consecuencia:** si el revisor abre el repositorio y lo primero que ve es `frontend/`, puede no encontrar los requisitos que sí califica.
- **Confianza:** alta.

## Objeción 2: una SPA en React agrega una segunda cadena de herramientas a un programa de Python

- **Supuesto que rompe:** que Node es gratis para quien clona el proyecto.
- **Evidencia:** el README promete "Necesitas Git y Python 3.10 o superior". Un frontend con Vite exige Node 20.19 o superior y `npm`.
- **Consecuencia:** el revisor que solo tiene Python no puede ver el frontend, y el CI tarda más.
- **Confianza:** alta.

## Objeción 3: los datos de demostración pueden pasar por rastreo real

- **Supuesto que rompe:** que el visitante distingue una guía de ejemplo de una real.
- **Evidencia:** el backend no tiene tablas de guías hasta M54 ni endpoints hasta M64 (README, "Hoja de ruta").
- **Consecuencia:** una captura del rastreo "funcionando" en la entrega afirma algo que el sistema no hace.
- **Confianza:** alta.

## Objeción 4: el frontend inventa un modelo de datos antes que el backend

- **Supuesto que rompe:** que los campos que hoy use la interfaz serán los de M54.
- **Evidencia:** `backend/tracking/models.py` está vacío a propósito: "the schema lands in M54".
- **Consecuencia:** retrabajo doble si M54 elige otros nombres, o un backend forzado a copiar decisiones tomadas en la interfaz.
- **Confianza:** media. Las cinco etapas, su orden y su responsable sí están fijados por el negocio (README, "Contexto del negocio").

## Objeción 5: usar la marca de la empresa en un proyecto escolar

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
- **Evidencia:** `docs/STACK_HOUND_EXPRESS.md` descartó la plantilla Docker del curso (`nickjj/docker-django-example`).
- **Consecuencia:** dos formas de ejecutar el proyecto que pueden divergir.
- **Confianza:** baja. Lo que se descartó fue esa plantilla (PostgreSQL, Redis, Celery, Tailwind y licencia ajena), no Docker.

## Objeción 8: el panel sin inicio de sesión es un panel abierto

- **Supuesto que rompe:** que el panel puede publicarse.
- **Evidencia:** la API exige sesión por defecto (`IsAuthenticated` en `REST_FRAMEWORK`), pero una pantalla de demostración no.
- **Consecuencia:** si alguien despliega el frontend tal cual, cualquiera "registra guías" (aunque solo en su navegador).
- **Confianza:** media.
