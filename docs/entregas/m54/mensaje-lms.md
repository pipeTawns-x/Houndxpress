# M54 · Entregable 10: mensaje para el LMS

Lección: "Proyecto Empresa Aliada - M54 Entregable 10" (Generar las entidades de Base de Datos).
Adjuntos: `backend/tracking/models.py`, `backend/accounts/models.py` y `tracking.sql`.
Los enlaces funcionan cuando la etiqueta `m54` esté publicada en GitHub.

---

Hola, Salvador:

Te comparto la entrega del M54. Las entidades viven en dos apps de Django:

- `tracking`: `Guide` (la guía) y `StatusHistory` (el historial de etapas).
- `accounts`: el `User` del proyecto, al que agregué el área (Aduana, Operaciones, Seguridad o KAM).

Adjunto los `models.py` y el SQL que genera Django a partir de las migraciones.

Seguí la consigna, con seis ajustes para que el modelo funcione en Django y con datos reales:

1. `id`: uso la llave primaria automática de Django. Un `IntegerField` sin `primary_key` no pasa la validación del framework.
2. `AutoDateTimeField` no existe en Django. Las fechas las pone el servidor con `auto_now_add` y `auto_now`, así nadie puede mandar fechas atrasadas.
3. Contraseña: reutilizo el `User` del proyecto, que guarda la contraseña cifrada (un hash de 89 caracteres). En un campo de 20 solo cabría en texto plano.
4. Número de guía de 22 caracteres: los números reales tienen 16 dígitos o 22 caracteres, y con 15 se cortarían.
5. `guideId` es una `ForeignKey` real con `PROTECT`: no se puede borrar una guía que tiene historial.
6. `createdAt` es fecha y hora (`DateTimeField`), porque la consigna pide ambas.

Además:

- Una guía solo avanza a la etapa siguiente: el modelo rechaza saltos, retrocesos y etapas después de "Carga entregada". Es el problema que describe el documento del proyecto (solo 31 de cada 100 guías seguían el orden).
- El historial es de solo inserción: no se puede editar ni borrar, ni desde el código ni desde el admin.
- La etapa actual no se puede escribir a mano: se deriva del historial. Cualquier intento de cambiarla por una vía alternativa queda bloqueado y la base de datos también lo rechaza.
- El número de guía se valida (16 dígitos que empiezan con 21, o 22 caracteres alfanuméricos en mayúscula) también en la base de datos.
- Hay un fixture con cuatro guías de demostración en etapas distintas.
- Agregué 73 pruebas automáticas de estas reglas; junto con las del M52 son 86, todas en verde.

Para revisarlo, desde `backend/`:

```
python manage.py migrate
python manage.py loaddata demo_guides
python manage.py test
```

Código: https://github.com/pipeTawns-x/Houndxpress/tree/m54/backend
PR con el detalle: https://github.com/pipeTawns-x/Houndxpress/pull/3
Etiqueta de la entrega: https://github.com/pipeTawns-x/Houndxpress/tree/m54

Saludos,
Eduardo Torres
