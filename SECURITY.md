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
| Inicio de sesión del admin (`/admin/login/`) | Máximo 5 intentos/minuto por IP, compartidos con el inicio de sesión de la API | `throttled_admin_login`, en `backend/config/admin_throttle.py` |
| API (`/api/v1/`) | Por defecto, solo usuarios con sesión iniciada (`IsAuthenticated` con `SessionAuthentication`) | `REST_FRAMEWORK` en `backend/config/settings.py` |
| Punto de salud (`/api/v1/health/`) | Público, de solo lectura | `HealthView` con `AllowAny`, en `backend/core/views.py` |
| Guías y alias de compatibilidad | Solo usuarios activos con sesión e `is_staff`, también para lectura | `IsAuthenticated` e `IsAdminUser`, en `backend/tracking/api/views.py` |
| Rastreo público | Solo lectura, de 1 a 10 números; sin destinatario, notas, autor ni ubicaciones libres | Serializers explícitos en `backend/tracking/api/serializers.py` |
| Inicio de sesión de la API | CSRF obligatorio incluso sin sesión; fallos con mensaje genérico; máximo 5 intentos/minuto por IP | `LoginView` y scope `login`, en `backend/accounts/api/views.py` |
| Cierre de sesión y perfil | Sesión requerida; CSRF obligatorio para cerrar | `LogoutView` y `MeView`, en `backend/accounts/api/views.py` |

Una vista nueva de la API hereda `IsAuthenticated`. Para abrirla al público hay que declararlo en la propia vista.

## Límites de uso

El rastreo consume una unidad por número, incluidos los repetidos y los inexistentes, con un límite de 60/minuto por IP además de los límites ordinarios.

El inicio de sesión del admin y el de la API comparten un mismo límite de 5/minuto por IP.

## Cabeceras y registros

- Las respuestas de negocio y autenticación incluyen `Cache-Control: no-store`.
- nginx envía `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` y una CSP completa, y responde 404 a cualquier ruta que empiece con punto (`frontend/nginx.conf`).
- El filtro de `backend/config/logging.py` elimina la query del rastreo público en el registro `django.server`.

## Revisiones en el CI

El job `security` de `.github/workflows/ci.yml` corre gitleaks sobre todo el historial, pip-audit contra PyPI y OSV, bandit sobre el backend y `npm audit` de las dependencias de ejecución.

## Pendiente antes de producción

- `DJANGO_DEBUG` vale `true` por defecto: el despliegue debe definirlo en `false`.
- Los límites DRF usan la caché configurada, y la caché local no da un límite atómico entre procesos. Hace falta una caché compartida.
- `NUM_PROXIES=0` no confía en cabeceras del cliente, pero detrás de un proxy todos los clientes compartirían el mismo límite. Hay que configurar el número real de proxies.
- El proxy y el servidor de producción deben omitir la query del rastreo público en sus registros de acceso. El nginx de este repositorio todavía usa el registro por defecto.
- Django y Vite no envían la CSP de nginx: en producción, solo debe quedar expuesto el servidor que la envía.
