# Política de seguridad

## Plazos para corregir componentes vulnerables

Aplica a cada paquete que fija `backend/uv.lock` (OWASP ASVS 5.0, requisito 15.1.1). El plazo corre desde que se publica el aviso de seguridad.

| Severidad del aviso | Plazo para actualizar o mitigar |
|---|---|
| Crítica o alta | 7 días |
| Moderada | 30 días |
| Baja | La siguiente versión |

Para actualizar un paquete, desde `backend/`: `uv lock --upgrade-package <paquete>`, y luego se vuelven a exportar `requirements.txt` y `requirements-dev.txt` con el comando que cada archivo indica en su encabezado.

## Reglas de autorización vigentes

Requisito 8.1.1 de OWASP ASVS 5.0. Todas se aplican en el servidor.

| Recurso | Quién accede | Dónde se aplica |
|---|---|---|
| Panel de administración (`/admin/`) | Solo usuarios activos con `is_staff` | `django.contrib.admin`, en `backend/config/urls.py` |
| API (`/api/v1/`) | Por defecto, solo usuarios con sesión iniciada (`IsAuthenticated` con `SessionAuthentication`) | `REST_FRAMEWORK` en `backend/config/settings.py` |
| Punto de salud (`/api/v1/health/`) | Público, de solo lectura | `HealthView` con `AllowAny`, en `backend/core/views.py` |

Una vista nueva de la API hereda `IsAuthenticated`. Para abrirla al público hay que declararlo en la propia vista.
