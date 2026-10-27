# M54.1 · OWASP ASVS 5.0.0, nivel 1, contra el backend actual

## Alcance

- **Fuente:** `OWASP/ASVS`, carpeta `5.0/en`, leída con `gh api` el 2026-10-27. Se tomaron las filas de nivel 1 de los capítulos V2, V3, V4, V6, V7, V8, V12, V13, V15 y V16: 44 requisitos. Los 44 están en la tabla, repartidos en 31 filas; cuando una fila agrupa varios, los nombra a todos. V16 no tiene requisitos de nivel 1.
- **No leídos todavía:** V1, V5 (no hay carga de archivos), V9 a V11, V14 y V17.
- **Código revisado:** rama `backend`, commit `0fc74ad`.
- **Pruebas:** cada prueba nueva se escribe en rojo antes del cambio y corre con `manage.py test`, el runner del proyecto (`.github/workflows/ci.yml:44`).

## Requisitos

| ASVS | Control | Estado hoy | Evidencia | Prueba (etapa 2) |
|---|---|---|---|---|
| 2.1.1 | Reglas de validación documentadas | **Parcial** | El docstring de `tracking/models.py` documenta el formato del número de guía; no hay un documento de reglas | Documento en la etapa 4 |
| 2.2.1, 2.2.2 | Validación positiva en una capa confiable | Cumple | `tracking/models.py:34`, `:185-189` | Las existentes de formato |
| 2.3.1 | Flujo en orden, sin saltar pasos | Cumple | `tracking/models.py:354-376` | `tracking/tests/test_models.py:358` |
| 3.2.1 | Contexto de renderizado (`nosniff`) | Cumple por defecto | `SecurityMiddleware` en `config/settings.py:85` | Nueva: la API envía `X-Content-Type-Options: nosniff` |
| 3.2.2 | Mostrar texto con funciones seguras (`textContent`) | No aplica al backend | La API devuelve JSON y el admin usa el autoescape de Django | Frontend, en M66 |
| 3.3.1 | Cookies `Secure` con prefijo `__Host-` o `__Secure-` | **Parcial** | `Secure` solo en producción (`config/settings.py:66-67`); los nombres no llevan prefijo | Nueva: en producción, las cookies con `Secure` y prefijo `__Host-` |
| 3.4.1 | HSTS de al menos un año | **No cumple** | `config/settings.py:64` lo deja para M66 | Nueva: en producción, `SECURE_HSTS_SECONDS >= 31536000` |
| 3.4.2 | CORS con origen fijo | Cumple: no hay CORS, todo es del mismo origen | No hay `django-cors-headers` en `pyproject.toml` | Nueva: la API no envía `Access-Control-Allow-Origin` |
| 3.5.1, 3.5.2 | Protección contra CSRF | Cumple | `CsrfViewMiddleware` en `config/settings.py:88`; DRF con `SessionAuthentication` exige CSRF | Nueva: un POST sin token CSRF devuelve 403 |
| 3.5.3 | Métodos HTTP adecuados | Cumple | `health` solo acepta GET (`core/views.py`) | Nueva: POST a `health` devuelve 405 |
| 4.1.1 | `Content-Type` con `charset` | **Parcial** | `JSONRenderer` de DRF no agrega `charset` | Decidir en la etapa 2: un renderer con `charset=utf-8` |
| 4.4.1 | WebSocket sobre TLS | No aplica | No hay WebSockets | — |
| 6.1.1, 6.3.1 | Límite de intentos y freno a la fuerza bruta | **No cumple** | No hay throttling de DRF ni límite en el login del admin | Nueva, cuando se elija el control (DRF throttling y/o `django-axes`, que es una dependencia nueva: riesgo 5) |
| 6.2.1 | Contraseña de 8 caracteres o más | Cumple | `MinimumLengthValidator` en `config/settings.py:133` | Nueva: una contraseña de 7 caracteres se rechaza |
| 6.2.4 | Rechazo de contraseñas comunes | Cumple | `CommonPasswordValidator` en `config/settings.py:134` | Nueva |
| 6.2.5 | Sin reglas de composición | **Revisar** | `NumericPasswordValidator` (`config/settings.py:135`) rechaza contraseñas que son solo dígitos | Decidir en la etapa 2 |
| 6.2.2, 6.2.3, 6.2.8 | Cambio de contraseña con la actual; verificación exacta | Cumple (admin de Django) | `django.contrib.admin` | Nueva |
| 6.2.6, 6.2.7 | El campo de contraseña la oculta y se puede pegar o usar un gestor de contraseñas | Cumple (login del admin) | `PasswordInput` de Django, sin bloquear el pegado | — |
| 6.3.2 | Sin cuentas por defecto | Cumple | El fixture trae 4 guías y 13 filas de historial, sin usuarios ni contraseñas | Nueva: el fixture no crea usuarios |
| 6.4.1 | Contraseñas iniciales generadas por el sistema | No aplica | No se generan; `createsuperuser` las pide | — |
| 6.4.2 | Sin pistas de contraseña ni preguntas secretas | Cumple | No existen | — |
| 7.2.1, 7.2.2, 7.2.3, 7.2.4 | Sesión del lado del servidor, aleatoria y nueva al iniciar sesión | Cumple (Django) | `SessionMiddleware` | Nueva: la clave de sesión cambia al iniciar sesión |
| 7.4.1, 7.4.2 | Cerrar sesión la invalida; un usuario desactivado la pierde | Cumple (Django) | `ModelBackend` rechaza `is_active=False` | Nuevas: dos pruebas |
| 8.1.1 | Reglas de autorización documentadas | **No cumple** | No existen | Documento en la etapa 4 |
| 8.2.1, 8.3.1 | Acceso por función, aplicado en el servidor | Cumple | `IsAuthenticated` por defecto (`config/settings.py:157`) | Nueva: una vista protegida sin sesión devuelve 403 |
| 8.2.2 | Acceso por objeto (IDOR) | No aplica hasta M64 | Todavía no hay endpoints de objetos | M64 |
| 12.1.1, 12.2.1, 12.2.2 | TLS | No aplica en local | `SECURE_SSL_REDIRECT` en producción (`config/settings.py:65`) | M66 |
| 13.4.1 | Sin `.git` en el despliegue | No aplica hasta M66 | No hay Dockerfile | M66 |
| 15.1.1 | Plazos de remediación documentados | **No cumple** | No hay política de seguridad | Documento en la etapa 2 |
| 15.2.1 | Componentes dentro de esos plazos | **No cumple** | Django 5.2.17 y DRF 3.18.1 (Engram #1154) | OSV en 0 después de T5 |
| 15.3.1 | Devolver solo los campos necesarios | Cumple | `health` devuelve solo `status` y `database` | Las existentes de `health` |

## Choque con una decisión anterior

`config/settings.py:64` deja HSTS y `check --deploy` para M66. El loop de la etapa 2 pide `check --deploy` en 0 desde ahora. Activar HSTS y el prefijo `__Host-` solo cambia la configuración de producción, y el modo local no se toca. Esto se resuelve en la etapa 2, con evidencia.
