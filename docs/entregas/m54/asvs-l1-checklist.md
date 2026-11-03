# M54.3 · OWASP ASVS 5.0.0, nivel 1, contra el código actual

**Resultado:** de las 31 filas, 24 cumplen, 4 son parciales, 1 sigue pendiente y 2 no aplican. Lo que falta está en [Pendientes](#pendientes). Ninguna fila se da por cumplida sin revisar el código citado.

## Alcance

- **Fuente:** `OWASP/ASVS`, carpeta `5.0/en`, leída con `gh api` el 2026-10-27. Se tomaron las filas de nivel 1 de los capítulos V2, V3, V4, V6, V7, V8, V12, V13, V15 y V16: 44 requisitos, repartidos en 31 filas. V16 no tiene requisitos de nivel 1.
- **No leídos todavía:** V1, V5, V9 a V11, V14 y V17.
- **Código revisado:** versión M54.3 de esta edición, commit `59f0470`. Las rutas son relativas a `backend/`, salvo `frontend/`, `.github/`, `docker-compose.yml`, `backend/.dockerignore` y `SECURITY.md`, que parten de la raíz.
- **Pruebas:** corren con `python manage.py test` desde `backend/` (`.github/workflows/ci.yml:44`). Resultado observado en esta revisión: `Ran 193 tests` y `OK`.

## Requisitos

| ASVS | Control | Estado | Evidencia del control | Prueba |
|---|---|---|---|---|
| 2.1.1 | Reglas de validación documentadas | **Parcial** | Las reglas están en `tracking/models.py:36-40`, `tracking/values.py:19-23` y `tracking/api/serializers.py:19-33`; el blueprint las resume, pero no hay un documento único de reglas | No aplica: es documentación |
| 2.2.1, 2.2.2 | Validación positiva en una capa confiable | Cumple | `tracking/models.py:36-40`, `:196-199`; `tracking/values.py:19-23`; `tracking/api/serializers.py:10-16`, `:75-79` | `tracking/tests/test_api.py:79`, `:255`, `:445`; `core/tests/test_asvs_controls.py:92` |
| 2.3.1 | Flujo en orden, sin saltar pasos | Cumple | `tracking/models.py:61-69`, `:367-408`; `tracking/services.py:80-91` | `tracking/tests/test_models.py:358`; `tracking/tests/test_api.py:137`, `:141`, `:146`, `:384` |
| 3.2.1 | Contexto de renderizado (`nosniff`) | Cumple | `config/settings.py:106`; `frontend/nginx.conf:11` | `core/tests/test_security.py:32` |
| 3.2.2 | Mostrar texto con funciones seguras | Cumple, sin prueba propia | React escapa el texto: no hay `dangerouslySetInnerHTML` ni `innerHTML` en `frontend/src`; el admin usa el autoescape de Django | Sin prueba propia |
| 3.3.1 | Cookies `Secure` con prefijo `__Host-` | Cumple en la configuración de producción | `config/settings.py:85-88`. El modo local conserva HTTP y los nombres por defecto | `core/tests/test_settings.py:94`, `:103` |
| 3.4.1 | HSTS de al menos un año | Cumple en la configuración de producción | `config/settings.py:80-82`. Sin despliegue real todavía | `core/tests/test_settings.py:89` |
| 3.4.2 | CORS con origen fijo | Cumple: no hay CORS, todo es del mismo origen | Sin `django-cors-headers` en `pyproject.toml:6-10`; proxy en `frontend/vite.config.ts:8-12` y `frontend/nginx.conf:23-24` | `core/tests/test_security.py:36` |
| 3.5.1, 3.5.2 | Protección contra CSRF | Cumple | `config/settings.py:109`, `:182`; `accounts/api/views.py:41`; orígenes en `config/settings.py:66-71` | `core/tests/test_security.py:56`; `tracking/tests/test_api.py:293`; `accounts/tests/test_csrf_origins.py:30`; `accounts/tests/test_admin_login_throttle.py:140` |
| 3.5.3 | Métodos HTTP adecuados | Cumple | `core/views.py:27`; `tracking/api/urls.py:7-8`, `:14-19` | `core/tests/test_health.py:37`; `tracking/tests/test_api.py:233` |
| 4.1.1 | `Content-Type` con `charset` | Cumple | `config/renderers.py:15`; `config/settings.py:187` | `core/tests/test_security.py:41` |
| 4.4.1 | WebSocket sobre TLS | No aplica | No hay WebSockets en el backend | No aplica |
| 6.1.1, 6.3.1 | Límite de intentos y freno a la fuerza bruta | **Parcial** | API: `config/settings.py:198-203`, `accounts/api/views.py:19-24`, `:38`. Admin: `config/admin_throttle.py:13-28`, `config/urls.py:11-12`. Falta P2 | `tracking/tests/test_api.py:352`; `accounts/tests/test_admin_login_throttle.py:38`, `:52`, `:93`, `:112`; `core/tests/test_security.py:79`, `:88` |
| 6.2.1 | Contraseña de 8 caracteres o más | Cumple: el mínimo es 12 | `config/settings.py:155-158` | `accounts/tests/test_password_policy.py:17`, `:20` |
| 6.2.4 | Rechazo de contraseñas comunes | Cumple | `config/settings.py:159` | `accounts/tests/test_password_policy.py:23` |
| 6.2.5 | Sin reglas de composición | Cumple | `NumericPasswordValidator` retirado: `config/settings.py:160-161` | `accounts/tests/test_password_policy.py:26` |
| 6.2.2, 6.2.3, 6.2.8 | Cambio de contraseña con la actual; verificación exacta | Cumple por Django, sin prueba propia del flujo | Solo el admin cambia contraseñas (`config/urls.py:13`); la API no tiene esa ruta (`accounts/api/urls.py:7-12`) | Solo la verificación: `core/tests/test_asvs_controls.py:137` |
| 6.2.6, 6.2.7 | El campo oculta la contraseña y se puede pegar o usar un gestor | Cumple, sin prueba propia | `frontend/src/pages/Access.tsx:67-68`, sin bloqueo de pegado; `PasswordInput` en el admin | Sin prueba propia |
| 6.3.2 | Sin cuentas por defecto | Cumple | El fixture `tracking/fixtures/demo_guides.json` no crea usuarios | `accounts/tests/test_authentication.py:75` |
| 6.4.1 | Contraseñas iniciales generadas por el sistema | No aplica | No se generan; `createsuperuser` las pide | No aplica |
| 6.4.2 | Sin pistas de contraseña ni preguntas secretas | Cumple | No existen en `accounts/models.py:14-24` | Sin prueba propia |
| 7.2.1, 7.2.2, 7.2.3, 7.2.4 | Sesión del lado del servidor, aleatoria y nueva al iniciar sesión | Cumple | `config/settings.py:107`; `accounts/api/views.py:50` | `accounts/tests/test_authentication.py:37`; `tracking/tests/test_api.py:301` |
| 7.4.1, 7.4.2 | Cerrar sesión la invalida; un usuario desactivado la pierde | Cumple | `accounts/api/views.py:56`; `ModelBackend` de Django | `accounts/tests/test_authentication.py:52`, `:64` |
| 8.1.1 | Reglas de autorización documentadas | Cumple | `SECURITY.md`, sección *Reglas de autorización vigentes* | No aplica: es documentación |
| 8.2.1, 8.3.1 | Acceso por función, aplicado en el servidor | Cumple | `config/settings.py:183`; `tracking/api/views.py:32` | `core/tests/test_security.py:69`; `tracking/tests/test_api.py:171`, `:178`, `:425`; `tracking/tests/test_archived_list.py:25` |
| 8.2.2 | Acceso por objeto (IDOR) | **Parcial** | Todo el personal ve todas las guías por diseño (`tracking/api/views.py:32`). El rastreo público responde por número (`tracking/api/views.py:81-93`). Falta P3 | `tracking/tests/test_api.py:233`, `:425` |
| 12.1.1, 12.2.1, 12.2.2 | TLS | **Pendiente** | Solo hay configuración: `config/settings.py:76`. Docker Compose sirve HTTP local (`docker-compose.yml:10-11`, `frontend/nginx.conf:2`). Falta P5 | `core/tests/test_settings.py:111` comprueba la configuración, no un despliegue |
| 13.4.1 | Sin `.git` en el despliegue | Cumple en Docker local | Contexto `./backend` (`docker-compose.yml:7`), `backend/.dockerignore:9-10`; nginx responde 404 a los dotfiles (`frontend/nginx.conf:18-20`) | `core/tests/test_asvs_controls.py:184`; `.github/workflows/ci.yml:172-175` |
| 15.1.1 | Plazos de remediación documentados | Cumple | `SECURITY.md`, sección *Plazos para corregir componentes vulnerables* | No aplica: es documentación |
| 15.2.1 | Componentes dentro de esos plazos | **Parcial** | Django 5.2.18 y DRF 3.18.3 (`requirements.txt:5`, `:9`); job `security` en `.github/workflows/ci.yml:140-152`. Falta P4 | Sin prueba unitaria: lo comprueba el job |
| 15.3.1 | Devolver solo los campos necesarios | Cumple | `tracking/api/serializers.py:36-43`, `:66-69`; `accounts/api/views.py:15-16`; `core/views.py:29` | `tracking/tests/test_api.py:233`, `:393`; `core/tests/test_asvs_controls.py:167` |

## Pendientes

| ID | Qué falta | Evidencia | Qué lo cierra |
|---|---|---|---|
| P1 | `DEBUG` vale `true` por defecto. Un despliegue que olvide `DJANGO_DEBUG=false` arranca en modo de depuración con la clave de desarrollo | `config/settings.py:42`, `:46-52`; `core/tests/test_settings.py:56` | Invertir el valor por defecto, o exigir la variable antes del primer despliegue |
| P2 | Con `NUM_PROXIES=0` el límite usa `REMOTE_ADDR`. Detrás de un proxy, todos los clientes comparten el mismo límite, y 5 intentos fallidos de uno bloquean el acceso de los demás. No hay `CACHES`, así que el límite vive en la memoria de cada proceso | `config/settings.py:206`; `frontend/nginx.conf:24`, `:30` | Caché compartida y el número real de proxies al desplegar |
| P3 | Los tokens opacos de rastreo no están construidos. El rastreo público responde al número de guía; lo acotan el límite y los campos mínimos | `tracking/api/views.py:81-93`; `tracking/api/throttles.py:6-30`; `tracking/api/serializers.py:66-69` | Decidir y construir los tokens, junto con el portal de cliente |
| P4 | La vigilancia de dependencias depende solo del job `security`, que es nuevo. Revisa las dependencias de ejecución, npm solo falla desde severidad alta, y no hay Dependabot | `.github/workflows/ci.yml:140-152` | Comprobar su primera corrida en GitHub y decidir Dependabot |
| P5 | TLS, HSTS y cookies `__Host-` no se han probado en un despliegue real | `config/settings.py:73-88` | El primer despliegue con HTTPS |
| P6 | La CSP y `Referrer-Policy` solo salen de nginx. Django en `:8000`, publicado por Docker Compose, y Vite en `:5173` no las envían | `frontend/nginx.conf:11-14`; `docker-compose.yml:10-11` | Enviarlas desde el servidor de producción y no publicar `:8000` |
| P7 | El registro de acceso de nginx no omite la query del rastreo público; Django sí | `config/logging.py:10-29`; `frontend/nginx.conf` no define `access_log` | Configurar ese registro en el proxy de producción |
| P8 | Faltan pruebas propias de 3.2.2, 6.2.2, 6.2.3, 6.2.6 y 6.2.7 | Tabla de requisitos | Agregarlas cuando esos flujos dejen de ser solo de Django o de React |
| P9 | Faltan por leer los capítulos V1, V5, V9 a V11, V14 y V17 | Sección *Alcance* | Leerlos y ampliar esta tabla |

## Cruce con el curso de hacking ético de Big School

Fuente: el checklist defensivo de 20 controles de las clases de Mario Álvarez y Chema Alonso (Engram #1172). La fuente mapea a ASVS de forma aproximada; aquí se usa la numeración verificada de este archivo cuando existe. Se cumplen 11, hay 5 parciales y 4 no aplican. Todas las pruebas corren contra nuestra aplicación, en local.

| # | Control | ASVS | Estado en M54.3 | Evidencia | Prueba |
|---|---|---|---|---|---|
| 1 | SQL crudo o `.extra()` | 2.2.x (V1 no leído) | Cumple | Solo `cursor.execute("SELECT 1")` constante (`core/views.py:14`); ORM en el resto | `core/tests/test_asvs_controls.py:64`, `:71`, `:82`, `:92`, `:99`, `:109`, `:120` |
| 2 | Inyección por cabeceras guardadas | Sin requisito ASVS | No aplica | Ninguna vista ni middleware propio guarda `request.META` | No aplica |
| 3 | IDOR en endpoints de objeto | 8.2.2 | **Parcial** | Guías solo para personal (`tracking/api/views.py:32`), sin dueño por objeto; ver P3 | `tracking/tests/test_api.py:425` |
| 4 | Cambio de contraseña con usuario destino | 6.2.2, 6.2.3 | Cumple (admin de Django) | La API no tiene ese endpoint (`accounts/api/urls.py:7-12`) | Sin prueba propia |
| 5 | Flag de MFA confiado desde el cliente | 6.x | No aplica | No hay MFA | No aplica |
| 6 | Contraseñas con hash | V11 no leído | Cumple (PBKDF2 de Django) | `accounts/models.py:14` | `core/tests/test_asvs_controls.py:139`, `:144`, `:149`, `:167` |
| 7 | `SECRET_KEY` débil o en el código | V13 | Cumple | `config/settings.py:46-56`: la clave de desarrollo se rechaza en producción | `core/tests/test_settings.py:61`, `:66` |
| 8 | JWT forjado para escalar el rol | 7.2.x, 8.3.1 | Cumple: no hay JWT | Sesión del servidor (`config/settings.py:182`); el rol se lee de la base | No aplica |
| 9 | `.git` o respaldos expuestos | 13.4.1 | Cumple en Docker local | `frontend/nginx.conf:18-20`; `backend/.dockerignore:9-10` | `core/tests/test_asvs_controls.py:184`; `.github/workflows/ci.yml:172-175` |
| 10 | Secretos en el repo o en el bundle | V13 | Cumple | gitleaks en `.github/workflows/ci.yml:131-136`; la única variable del bundle es `VITE_DATA_SOURCE` (`frontend/src/vite-env.d.ts:5`) | Lo comprueba el job `security` |
| 11 | Inclusión de archivos o path traversal | V5 no leído | No aplica | No hay vistas que sirvan archivos | No aplica |
| 12 | Inyección de plantillas | V1 no leído | Cumple | Ninguna plantilla se construye con datos del usuario | Sin prueba propia |
| 13 | Ejecución remota (`eval`, `pickle`, `subprocess`) | V15 | Cumple | Sin esas llamadas fuera de las pruebas; bandit en `.github/workflows/ci.yml:145-146` | Lo comprueba el job `security` |
| 14 | Fuerza bruta en el login | 6.1.1, 6.3.1 | **Parcial** | API y admin comparten el límite (`config/admin_throttle.py:16-18`); ver P2 | `accounts/tests/test_admin_login_throttle.py:112`, `:120`, `:129` |
| 15 | Subida de archivos | V5 no leído | No aplica | No hay `FileField` ni `ImageField` | No aplica |
| 16 | CORS | 3.4.2 | Cumple | No hay CORS | `core/tests/test_security.py:36` |
| 17 | Cabeceras de seguridad | 3.4.1, 3.2.1 | **Parcial** | HSTS en producción (`config/settings.py:80-82`); `nosniff`, CSP y `X-Frame-Options` en nginx (`frontend/nginx.conf:11-14`); ver P6 | `core/tests/test_settings.py:89`; `.github/workflows/ci.yml:168-171` |
| 18 | Errores con trazas internas | V16 (sin nivel 1) | **Parcial** | Con `DEBUG` apagado no salen trazas, pero `DEBUG` vale `true` por defecto; ver P1 | `core/tests/test_asvs_controls.py:207`, `:215`, `:223`, `:231`, `:245` |
| 19 | CVE de dependencias sin vigilar | 15.1.1, 15.2.1 | **Parcial** | Plazos en `SECURITY.md`; pip-audit y npm audit en `.github/workflows/ci.yml:140-152`; ver P4 | Lo comprueba el job `security` |
| 20 | Enumeración de cuentas | 6.x | Cumple | Mensaje genérico (`accounts/api/views.py:48-49`); no hay recuperación de contraseña | `tracking/tests/test_api.py:329`; `core/tests/test_asvs_controls.py:109` |
