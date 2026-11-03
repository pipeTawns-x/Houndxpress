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
| Guías y alias de compatibilidad | Solo usuarios activos con sesión e `is_staff`, también para lectura | `IsAuthenticated` e `IsAdminUser`, en `backend/tracking/api/views.py` |
| Rastreo público | Solo lectura, de 1 a 10 números; sin destinatario, notas, autor ni ubicaciones libres | Serializers explícitos en `backend/tracking/api/serializers.py` |
| Inicio de sesión | CSRF obligatorio incluso sin sesión; fallos con mensaje genérico; máximo 5 intentos/minuto por IP | `LoginView` y scope `login`, en `backend/accounts/api/views.py` |
| Cierre de sesión y perfil | Sesión requerida; CSRF obligatorio para cerrar | `LogoutView` y `MeView`, en `backend/accounts/api/views.py` |

Una vista nueva de la API hereda `IsAuthenticated`. Para abrirla al público hay que declararlo en la propia vista.


El rastreo consume una unidad por número, incluidos los repetidos y los inexistentes,
con un límite de 60/minuto por IP además de los límites ordinarios. Los límites DRF
usan la caché configurada: la caché local de desarrollo no proporciona un límite
atómico entre procesos. Antes de producción se requiere caché compartida y
configurar el proxy de confianza; `NUM_PROXIES=0` no confía en cabeceras del cliente.
El login del admin comparte el límite de 5/minuto del login de la API.

Las nuevas respuestas de negocio y autenticación incluyen `Cache-Control: no-store`.
El filtro de `backend/config/logging.py` elimina la query del rastreo público en el
registro `django.server`. El proxy y el servidor de producción deben omitirla también
en sus registros de acceso; este worktree no configura esos servidores.
