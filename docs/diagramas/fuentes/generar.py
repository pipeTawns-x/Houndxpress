"""Genera los candidatos JSON de archify para Hound Express.

Uso, desde la raíz del repositorio:
    python3 docs/diagramas/fuentes/generar.py
    node .claude/skills/archify/bin/archify.mjs finalize <tipo> docs/diagramas/fuentes/<nombre>.json docs/diagramas/<nombre>.html --quality showcase --json
"""

import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
ES = json.loads((ROOT / ".claude/skills/archify/examples/locales/es.json").read_text(encoding="utf-8"))
TRANSLATIONS = ES.get("translations", ES)


def meta(title: str, name: str, **extra) -> dict:
    return {
        "title": title,
        "output": f"docs/diagramas/{name}.html",
        "locale": "es",
        "translations": TRANSLATIONS,
        "quality_profile": "showcase",
        **extra,
    }


def gap(label: str) -> int:
    # authoring-defaults: 6.5px per ASCII unit + 21px of clear gap, plus breathing room.
    return int(6.5 * len(label) + 21) + 24


# Evidence for the four diagrams: version M54.3 of this edition. Local-only because the
# diagrams are generated before that commit is published.
REPOSITORY = {
    "url": "https://github.com/pipeTawns-x/Houndxpress.git",
    "revision": "59f04705119e8875aea1c4e8ecffb0579b4b48e2",
    "link_mode": "local-only",
}
MODELS = "backend/tracking/models.py"
SERVICES = "backend/tracking/services.py"
VALUES = "backend/tracking/values.py"
ADMIN = "backend/tracking/admin.py"
GUIDE_VIEWS = "backend/tracking/api/views.py"
ACCOUNTS = "backend/accounts/models.py"
ACCOUNT_VIEWS = "backend/accounts/api/views.py"
HEALTH_VIEW = "backend/core/views.py"
SETTINGS = "backend/config/settings.py"
URLS = "backend/config/urls.py"
ADMIN_THROTTLE = "backend/config/admin_throttle.py"
NGINX = "frontend/nginx.conf"
VITE = "frontend/vite.config.ts"
APP = "frontend/src/App.tsx"
GUIDE_REPOSITORY = "frontend/src/services/guideRepository.ts"
HTTP_REPOSITORY = "frontend/src/services/httpRepository.ts"
PUBLIC_TRACKER = "frontend/src/services/publicTracking.ts"
AUTH_CLIENT = "frontend/src/services/auth.ts"
API_CLIENT = "frontend/src/services/apiClient.ts"
GUIDE_LOOKUP = "frontend/src/hooks/useGuideLookup.ts"
API_HEALTH = "frontend/src/hooks/useApiHealth.ts"


def src(path: str, line: int, end: int | None = None, label: str | None = None) -> dict:
    ref = {"path": path, "line": line}
    if end is not None:
        ref["end_line"] = end
    if label:
        ref["label"] = label
    return ref


def architecture() -> dict:
    y, h = 300, 64
    main = [
        ("users", "external", "Visitantes y personal", "navegador · móvil", 170, None),
        ("spa", "frontend", "Frontend React", "Vite · Sass · Redux · Router", 170, "HTTP local"),
        ("proxy", "cloud", "Proxy /api", "Vite :5173 · nginx :8080", 170, "fetch /api"),
        ("api", "backend", "API Django + DRF", "Django 5.2 · :8000", 170, "HTTP :8000"),
        ("db", "database", "SQLite", "db.sqlite3", 150, "sesiones · SELECT 1"),
    ]
    sources = {
        "spa": [src(APP, 25, label="App: rutas de la SPA"),
                src(GUIDE_REPOSITORY, 3, 18, "GuideRepository"),
                src(API_CLIENT, 64, 101, "cliente HTTP con sesión y CSRF")],
        "proxy": [src(NGINX, 23, 32, "nginx reenvía /api, /admin y /static"),
                  src(VITE, 8, 12, "proxy de Vite"),
                  src(NGINX, 11, 14, "cabeceras y CSP de nginx")],
        "api": [src(URLS, 9, 17, "rutas del proyecto"),
                src(SETTINGS, 105, 113, "MIDDLEWARE"),
                src(SETTINGS, 180, 207, "REST_FRAMEWORK")],
        "db": [src(SETTINGS, 136, 143, "SQLite en DATABASES")],
    }
    components, x = [], 40
    for node_id, kind, label, sub, width, incoming in main:
        if incoming:
            x += gap(incoming)
        node = {"id": node_id, "type": kind, "label": label, "sublabel": sub,
                "pos": [x, y], "size": [width, h]}
        if node_id in sources:
            node["sources"] = sources[node_id]
        components.append(node)
        x += width
    pos = {c["id"]: c["pos"] for c in components}
    api_x = pos["api"][0]
    components += [
        {"id": "services", "type": "backend", "label": "tracking.services", "sublabel": "casos de uso de las guías",
         "pos": [api_x, 130], "size": [170, h], "tag": "Facade",
         "sources": [src(SERVICES, 1, label="fachada transaccional"),
                     src(SERVICES, 59, 70, "create_guide"),
                     src(SERVICES, 73, 120, "advance_guide")]},
        {"id": "login_limit", "type": "security", "label": "Límite de login", "sublabel": "API y admin · 5/min por IP",
         "pos": [api_x - 200, 440], "size": [170, h], "tag": "analogía de Decorator",
         "sources": [src(ADMIN_THROTTLE, 13, 28, "throttled_admin_login"),
                     src(ACCOUNT_VIEWS, 19, 24, "LoginThrottle"),
                     src(URLS, 11, 12, "ruta antes de admin.site.urls")]},
        {"id": "health", "type": "backend", "label": "HealthView", "sublabel": "GET /api/v1/health/",
         "pos": [api_x, 560], "size": [170, h], "tag": "público",
         "sources": [src(HEALTH_VIEW, 21, 33, "HealthView con AllowAny")]},
    ]
    return {
        "schema_version": 1,
        "diagram_type": "architecture",
        "meta": meta("Hound Express · arquitectura del proyecto", "arquitectura", repository=REPOSITORY),
        "components": components,
        "boundaries": [
            {"kind": "region", "label": "Navegador", "wraps": ["spa"]},
            {"kind": "region", "label": "Servidor · local o Docker Compose",
             "wraps": ["proxy", "api", "db", "services", "login_limit", "health"]},
        ],
        "connections": [
            {"id": "users-spa", "from": "users", "to": "spa", "label": "HTTP local", "variant": "emphasis"},
            {"id": "spa-proxy", "from": "spa", "to": "proxy", "label": "fetch /api"},
            {"id": "proxy-api", "from": "proxy", "to": "api", "label": "HTTP :8000"},
            {"id": "api-db", "from": "api", "to": "db", "label": "sesiones · SELECT 1"},
            {"id": "api-services", "from": "api", "to": "services", "label": "casos de uso",
             "fromSide": "top", "toSide": "bottom"},
            {"id": "services-db", "from": "services", "to": "db", "label": "ORM · SQL",
             "fromSide": "right", "toSide": "top"},
            {"id": "api-login", "from": "api", "to": "login_limit", "label": "login", "variant": "security",
             "fromSide": "bottom", "toSide": "right"},
            {"id": "api-health", "from": "api", "to": "health", "label": "sin sesión", "variant": "security",
             "fromSide": "bottom", "toSide": "top"},
        ],
        "cards": [
            {"dot": "cyan", "title": "Frontend", "items": [
                "Sitio público, rastreo y panel de operaciones en una sola SPA",
                "Rastreo público y panel contra la API real, con sesión y CSRF",
                "Si la API rechaza la sesión, el panel se cierra y borra los datos en memoria"]},
            {"dot": "emerald", "title": "Backend", "items": [
                "Guías e historial que no se edita ni se borra; los rechazos se auditan",
                "API: guías, avance, historial, archivo, resumen, rastreo público y sesión",
                "Las guías exigen personal; salud, rastreo público y acceso son públicos",
                "El admin crea guías con la misma primera etapa (admin.py:47-51, services.py:49-56)"]},
            {"dot": "violet", "title": "Patrones que el código usa", "items": [
                "Facade: las vistas solo adaptan HTTP (services.py:1, api/views.py:1)",
                "Repository en el frontend, con dos implementaciones (guideRepository.ts:3-7)",
                "Value Object: TrackingNumber (values.py:19-23)",
                "Chain of Responsibility, del framework: MIDDLEWARE (settings.py:105-113)",
                "Strategy, del framework: renderers y throttles de DRF (settings.py:186-197)",
                "Analogía de Decorator: el límite envuelve el login del admin (admin_throttle.py:13-28)"]},
            {"dot": "amber", "title": "Siguientes pasos", "items": [
                "M66: despliegue en producción con HTTPS",
                "Caché compartida y NUM_PROXIES real antes de desplegar (settings.py:206)",
                "Portal de cliente con acceso por objeto",
                "Incidencias y alertas de operación"]},
        ],
    }


def lifecycle() -> dict:
    stages = [
        ("cargo_received", "start", "Recepción de carga", "Aduana", "CARGO_RECEIVED"),
        ("vehicle_loaded", "active", "Vehículo cargado", "Aduana", "VEHICLE_LOADED"),
        ("vehicle_released", "active", "Vehículo liberado", "Operaciones", "VEHICLE_RELEASED"),
        ("vehicle_in_transit", "active", "Vehículo en camino", "Seguridad", "VEHICLE_IN_TRANSIT"),
        ("cargo_delivered", "success", "Carga entregada", "KAM", "CARGO_DELIVERED"),
    ]
    states = []
    for i, (code, kind, label, owner, name) in enumerate(stages):
        refs = [src(MODELS, 44 + i, label=f"Stage.{name}")]
        if i == 0:
            refs.append(src(MODELS, 235, 237, "el alta empieza en recepción"))
        if i == len(stages) - 1:
            refs.append(src(MODELS, 63, 64, "entregada: no admite más etapas"))
        refs.append(src(MODELS, 61, 69, "solo la etapa siguiente"))
        states.append({"id": code, "type": kind, "label": label, "sublabel": f"responsable: {owner}",
                       "lane": "main", "col": i, "step": f"0{i + 1}", "tag": code, "sources": refs})
    states += [
        {"id": "guide_created", "type": "neutral", "label": "Alta de la guía", "sublabel": "API o admin",
         "lane": "outside", "col": 0, "tag": "record_first_stage",
         "sources": [src(SERVICES, 49, 56, "record_first_stage"),
                     src(SERVICES, 59, 70, "alta por la API"),
                     src(ADMIN, 47, 51, "alta por el admin")]},
        {"id": "attempt_rejected", "type": "failure", "label": "Avance rechazado", "sublabel": "409 · la etapa no cambia",
         "lane": "outside", "col": 2, "tag": "StageTransitionAttempt",
         "sources": [src(SERVICES, 80, 91, "motivos del rechazo"),
                     src(SERVICES, 94, 100, "registra el intento"),
                     src(MODELS, 417, 433, "StageTransitionAttempt")]},
        {"id": "guide_archived", "type": "neutral", "label": "Archivada", "sublabel": "DELETE · is_archived",
         "lane": "outside", "col": 4, "tag": "desde cualquier etapa",
         "sources": [src(SERVICES, 123, 128, "archive_guide"),
                     src(MODELS, 72, 74, "archivada: no admite etapas")]},
    ]
    transitions = [
        {"from": stages[i][0], "to": stages[i + 1][0], "label": "siguiente"}
        for i in range(len(stages) - 1)
    ]
    transitions += [
        {"from": "guide_created", "to": "cargo_received", "label": "primera fila"},
        {"from": "vehicle_released", "to": "attempt_rejected", "label": "salto o retroceso", "variant": "security"},
        {"from": "cargo_delivered", "to": "guide_archived", "label": "archivar", "variant": "dashed"},
        {"from": "guide_archived", "to": "attempt_rejected", "label": "no admite avance", "variant": "dashed"},
    ]
    return {
        "schema_version": 2,
        "diagram_type": "lifecycle",
        "meta": meta("Ciclo de vida de una guía", "ciclo-de-vida-guia", repository=REPOSITORY),
        "lanes": [
            {"id": "main", "label": "Etapas en orden estricto"},
            {"id": "outside", "label": "Alta, rechazos y archivo"},
        ],
        "states": states,
        "transitions": transitions,
        "cards": [
            {"dot": "cyan", "title": "Regla de avance", "items": [
                "La única etapa válida es la siguiente (services.py:88-91)",
                "Una guía entregada ya no avanza (services.py:86-87)",
                "El panel solo ofrece el botón de la etapa siguiente"]},
            {"dot": "emerald", "title": "Historial", "items": [
                "Cada avance agrega un evento con fecha, lugar y área del autor (services.py:110-116)",
                "Los eventos no se editan ni se borran (models.py:254-264)",
                "Las fechas se guardan en UTC (settings.py:169-171)"]},
            {"dot": "rose", "title": "Alta y rechazos", "items": [
                "La API y el admin crean la primera fila con record_first_stage (services.py:64, admin.py:51)",
                "Salto, retroceso, entregada o archivada: 409 y queda el intento (services.py:80-100)",
                "Una guía sin historial responde 409 y solo se registra en el log (services.py:82-83, :93)"]},
            {"dot": "amber", "title": "Por qué importa", "items": [
                "Solo 31 de cada 100 guías seguían el proceso en orden",
                "Saltar pasos causó pérdidas de 200k pesos MXN",
                "Fuente: documento del proyecto (README, Contexto del negocio)"]},
            {"dot": "violet", "title": "Patrones en el código", "items": [
                "State, forma simple: Stage con cinco valores (models.py:43-48)",
                "Solo la etapa siguiente es válida (models.py:61-69)",
                "UPDATE condicional, compare-and-set, no GoF (models.py:100-115)",
                "Facade: advance_guide decide, registra y audita (services.py:73-120)",
                "Propuesta: Observer para avisos; todavía no existe"]},
        ],
    }


def sequence() -> dict:
    return {
        "schema_version": 1,
        "diagram_type": "sequence",
        "meta": meta("Consultas de la web: estado de la API, rastreo, avance y acceso", "secuencia-consultas",
                     column_fit="spread", repository=REPOSITORY),
        "participants": [
            {"id": "user", "type": "external", "label": "Usuario", "sublabel": "visitante o personal"},
            {"id": "web", "type": "frontend", "label": "Frontend React", "sublabel": "páginas y hooks",
             "sources": [src(API_HEALTH, 7, 21, "useApiHealth"),
                         src(GUIDE_LOOKUP, 18, label="useGuideLookup llama a publicTracker")]},
            {"id": "http", "type": "frontend", "label": "Servicios HTTP", "sublabel": "tracker y repositorio",
             "sources": [src(PUBLIC_TRACKER, 7, 14, "publicTracker"),
                         src(HTTP_REPOSITORY, 66, 69, "advance con PUT"),
                         src(AUTH_CLIENT, 20, 21, "login con POST")]},
            {"id": "api", "type": "backend", "label": "API Django", "sublabel": "vistas de /api/v1/",
             "sources": [src(GUIDE_VIEWS, 81, 93, "PublicTrackView"),
                         src(GUIDE_VIEWS, 54, 60, "update de GuideViewSet"),
                         src(ACCOUNT_VIEWS, 40, 51, "LoginView")]},
            {"id": "svc", "type": "backend", "label": "Servicios", "sublabel": "tracking.services",
             "sources": [src(SERVICES, 141, 144, "public_guides"),
                         src(SERVICES, 73, 120, "advance_guide"),
                         src(SERVICES, 94, 100, "registra el rechazo")]},
            {"id": "db", "type": "database", "label": "SQLite", "sublabel": "db.sqlite3",
             "sources": [src(SETTINGS, 136, 143, "SQLite en DATABASES")]},
        ],
        "segments": [
            {"from": 150, "to": 310, "label": "Estado de la API · real desde M52"},
            {"from": 325, "to": 635, "label": "Rastreo público contra la API real"},
            {"from": 650, "to": 960, "label": "Avance de etapa · personal con sesión"},
            {"from": 975, "to": 1195, "label": "Acceso · API y admin con el mismo límite"},
        ],
        "messages": [
            {"id": "health-get", "from": "web", "to": "api", "y": 175, "label": "GET /api/v1/health/", "variant": "emphasis"},
            {"id": "health-select", "from": "api", "to": "db", "y": 205, "label": "SELECT 1"},
            {"id": "health-row", "from": "db", "to": "api", "y": 235, "label": "fila", "variant": "return"},
            {"id": "health-ok", "from": "api", "to": "web", "y": 265, "label": "200 · status ok", "variant": "return"},
            {"id": "health-chip", "from": "web", "to": "user", "y": 295, "label": "API en línea", "variant": "return"},
            {"id": "track-input", "from": "user", "to": "web", "y": 350, "label": "número de guía"},
            {"id": "track-call", "from": "web", "to": "http", "y": 380, "label": "publicTracker(números)"},
            {"id": "track-get", "from": "http", "to": "api", "y": 410, "label": "GET /public/track/?numbers=n"},
            {"id": "track-service", "from": "api", "to": "svc", "y": 440, "label": "public_guides(números)"},
            {"id": "track-query", "from": "svc", "to": "db", "y": 470, "label": "guías e historial"},
            {"id": "track-rows", "from": "db", "to": "svc", "y": 500, "label": "filas", "variant": "return"},
            {"id": "track-guides", "from": "svc", "to": "api", "y": 530, "label": "guías encontradas", "variant": "return"},
            {"id": "track-json", "from": "api", "to": "http", "y": 560, "label": "200 · campos mínimos o found: false", "variant": "return"},
            {"id": "track-result", "from": "http", "to": "web", "y": 590, "label": "resultados", "variant": "return"},
            {"id": "track-render", "from": "web", "to": "user", "y": 620, "label": "línea de tiempo o no encontrada", "variant": "return"},
            {"id": "advance-input", "from": "user", "to": "web", "y": 675, "label": "avanzar etapa"},
            {"id": "advance-call", "from": "web", "to": "http", "y": 705, "label": "advance(número, etapa)"},
            {"id": "advance-put", "from": "http", "to": "api", "y": 735, "label": "PUT /guides/n/ · CSRF"},
            {"id": "advance-service", "from": "api", "to": "svc", "y": 765, "label": "advance_guide(número)"},
            {"id": "advance-insert", "from": "svc", "to": "db", "y": 795, "label": "fila + UPDATE condicional"},
            {"id": "advance-reject", "from": "svc", "to": "db", "y": 825, "label": "o rechazo auditado", "variant": "security"},
            {"id": "advance-result", "from": "svc", "to": "api", "y": 855, "label": "guía o Conflict", "variant": "return"},
            {"id": "advance-json", "from": "api", "to": "http", "y": 885, "label": "200 o 409 invalid_transition", "variant": "return"},
            {"id": "advance-guide", "from": "http", "to": "web", "y": 915, "label": "Guide o RepositoryError", "variant": "return"},
            {"id": "advance-render", "from": "web", "to": "user", "y": 945, "label": "etapa nueva o aviso", "variant": "return"},
            {"id": "login-input", "from": "user", "to": "web", "y": 1000, "label": "usuario y contraseña"},
            {"id": "login-call", "from": "web", "to": "http", "y": 1030, "label": "login(usuario, contraseña)"},
            {"id": "login-post", "from": "http", "to": "api", "y": 1060, "label": "POST /auth/login/ · CSRF"},
            {"id": "login-json", "from": "api", "to": "http", "y": 1090, "label": "200, 403 genérico o 429", "variant": "return"},
            {"id": "login-render", "from": "http", "to": "web", "y": 1120, "label": "panel o aviso", "variant": "return"},
            {"id": "admin-post", "from": "user", "to": "api", "y": 1150, "label": "POST /admin/login/ · mismo límite", "variant": "security"},
            {"id": "admin-limit", "from": "api", "to": "user", "y": 1180, "label": "429 tras 5 intentos por minuto", "variant": "return"},
        ],
        "activations": [
            {"participant": "web", "from": 170, "to": 301, "type": "frontend"},
            {"participant": "api", "from": 175, "to": 271, "type": "backend"},
            {"participant": "db", "from": 200, "to": 241, "type": "database"},
            {"participant": "web", "from": 345, "to": 626, "type": "frontend"},
            {"participant": "http", "from": 375, "to": 596, "type": "frontend"},
            {"participant": "api", "from": 405, "to": 566, "type": "backend"},
            {"participant": "svc", "from": 435, "to": 536, "type": "backend"},
            {"participant": "db", "from": 465, "to": 506, "type": "database"},
            {"participant": "web", "from": 670, "to": 951, "type": "frontend"},
            {"participant": "http", "from": 700, "to": 921, "type": "frontend"},
            {"participant": "api", "from": 730, "to": 891, "type": "backend"},
            {"participant": "svc", "from": 760, "to": 861, "type": "backend"},
            {"participant": "db", "from": 790, "to": 831, "type": "database"},
            {"participant": "web", "from": 995, "to": 1126, "type": "frontend"},
            {"participant": "http", "from": 1025, "to": 1126, "type": "frontend"},
            {"participant": "api", "from": 1055, "to": 1096, "type": "backend"},
            {"participant": "api", "from": 1145, "to": 1186, "type": "security"},
        ],
        "cards": [
            {"dot": "emerald", "title": "Estado de la API", "items": [
                "La plantilla pública consulta /api/v1/health/ al cargar (useApiHealth.ts:7-21)",
                "La vista hace SELECT 1 y responde 503 si la base falla (core/views.py:10-33)",
                "Vite o nginx reenvían /api al puerto 8000: mismo origen, sin CORS (nginx.conf:23-24)"]},
            {"dot": "cyan", "title": "Rastreo y avance", "items": [
                "publicTracker normaliza de 1 a 10 números (publicTracking.ts:10-12)",
                "Un número inexistente responde found: false, no 404 (api/views.py:86-92)",
                "Un salto o retroceso responde 409 y queda auditado (services.py:88-100)"]},
            {"dot": "amber", "title": "Acceso", "items": [
                "CSRF obligatorio también al iniciar sesión (accounts/api/views.py:41)",
                "API y admin comparten 5 intentos por minuto y por IP (admin_throttle.py:16-18)",
                "Con NUM_PROXIES=0, detrás de un proxy todos comparten ese límite (settings.py:206)"]},
            {"dot": "violet", "title": "Patrones que el código usa", "items": [
                "Facade: la vista solo llama a tracking.services (api/views.py:59)",
                "Repository: httpRepository implementa GuideRepository (httpRepository.ts:12)",
                "Analogía de Decorator: el límite va antes del login del admin (urls.py:11-12)",
                "Compare-and-set, no GoF: UPDATE condicional (models.py:104-108)"]},
        ],
    }


def data_model() -> dict:
    y_top, y_main, y_low, y_bottom, h = 110, 280, 450, 620, 64
    incident_x, incident_w = 40, 190
    guide_x = incident_x + incident_w + gap("guide · FK")
    guide_w = 230
    history_x = guide_x + guide_w + gap("guide · FK PROTECT")
    history_w = 230
    user_x = history_x + history_w + gap("updated_by · FK PROTECT") + 40
    user_w = 210
    components = [
        {"id": "incident", "type": "database", "label": "Incident (propuesta)", "sublabel": "contador con alerta · D5",
         "pos": [incident_x, y_main], "size": [incident_w, h], "tag": "propuesta · D5"},
        {"id": "guide", "type": "database", "label": "Guide", "sublabel": "tracking_number único · current_stage",
         "pos": [guide_x, y_main], "size": [guide_w, h], "tag": "CheckConstraint ×3",
         "sources": [src(MODELS, 169, 184, "Guide y sus campos"),
                     src(MODELS, 191, 204, "CheckConstraint de servicio, formato y etapa"),
                     src(MODELS, 209, 251, "save_base: etapa solo por historial")]},
        {"id": "history", "type": "database", "label": "StatusHistory", "sublabel": "solo inserción · autor y department",
         "pos": [history_x, y_main], "size": [history_w, h], "tag": "UniqueConstraint(guide, stage)",
         "sources": [src(MODELS, 338, 355, "StatusHistory y unique_stage_per_guide"),
                     src(MODELS, 345, label="department del autor"),
                     src(MODELS, 367, 411, "save_base valida el prefijo")]},
        {"id": "user", "type": "database", "label": "User (accounts)", "sublabel": "AbstractUser · department",
         "pos": [user_x, y_main], "size": [user_w, h], "tag": "framework",
         "sources": [src(ACCOUNTS, 14, 24, "User con department y updated_at"),
                     src(ACCOUNTS, 7, 11, "Department: cuatro áreas")]},
        {"id": "guide_qs", "type": "security", "label": "GuideQuerySet", "sublabel": "analogía de Proxy · vigila current_stage",
         "pos": [guide_x, y_top], "size": [guide_w, h], "tag": "analogía de Proxy",
         "sources": [src(MODELS, 119, 131, "update exige la autorización"),
                     src(MODELS, 133, 138, "bulk_update rechaza current_stage"),
                     src(MODELS, 140, 166, "bulk_create fija la etapa inicial")]},
        {"id": "history_qs", "type": "security", "label": "StatusHistoryQuerySet",
         "sublabel": "analogía de Proxy · sin update ni delete",
         "pos": [history_x, y_top], "size": [history_w, h], "tag": "analogía de Proxy",
         "sources": [src(MODELS, 257, 264, "delete y update bloqueados"),
                     src(MODELS, 266, 335, "bulk_create valida cada guía")]},
        {"id": "advance", "type": "backend", "label": "_advance_current_stage",
         "sublabel": "State simple · UPDATE condicional",
         "pos": [guide_x + 170, y_low], "size": [guide_w, h], "tag": "State simple · compare-and-set",
         "sources": [src(MODELS, 100, 115, "UPDATE condicional"),
                     src(MODELS, 56, 58, "ContextVar de autorización"),
                     src(MODELS, 61, 69, "_validate_stage_transition")]},
        {"id": "services", "type": "backend", "label": "tracking.services", "sublabel": "API y admin · primera etapa y avance",
         "pos": [history_x + 148, y_low], "size": [history_w, h], "tag": "Facade",
         "sources": [src(SERVICES, 49, 56, "record_first_stage"),
                     src(SERVICES, 73, 120, "advance_guide"),
                     src(ADMIN, 47, 51, "el admin usa record_first_stage")]},
        {"id": "attempt", "type": "database", "label": "StageTransitionAttempt", "sublabel": "auditoría de avances rechazados",
         "pos": [history_x, y_bottom], "size": [history_w, h], "tag": "skip · backwards · delivered · archived",
         "sources": [src(MODELS, 417, 436, "StageTransitionAttempt"),
                     src(SERVICES, 94, 100, "se crea al rechazar un avance")]},
    ]
    return {
        "schema_version": 1,
        "diagram_type": "architecture",
        "meta": meta("Modelo de datos de M54.3 · guías, historial y usuarios", "modelo-de-datos", repository=REPOSITORY),
        "components": components,
        "boundaries": [
            {"kind": "region", "label": "App tracking · models.py y services.py",
             "wraps": ["incident", "guide", "history", "guide_qs", "history_qs", "advance", "services", "attempt"]},
            {"kind": "region", "label": "App accounts", "wraps": ["user"]},
        ],
        "connections": [
            {"id": "incident-guide", "from": "incident", "to": "guide", "label": "guide · FK", "variant": "dashed"},
            {"id": "history-guide", "from": "history", "to": "guide", "label": "guide · FK PROTECT",
             "variant": "emphasis"},
            {"id": "history-user", "from": "history", "to": "user", "label": "updated_by · FK PROTECT"},
            {"id": "guideqs-guide", "from": "guide_qs", "to": "guide", "label": "objects", "variant": "security",
             "fromSide": "bottom", "toSide": "top"},
            {"id": "historyqs-history", "from": "history_qs", "to": "history", "label": "objects",
             "variant": "security", "fromSide": "bottom", "toSide": "top"},
            {"id": "history-advance", "from": "history", "to": "advance", "label": "save_base",
             "fromSide": "bottom", "toSide": "right"},
            {"id": "advance-guide", "from": "advance", "to": "guide", "label": "avanza current_stage",
             "variant": "security", "fromSide": "top", "toSide": "right"},
            {"id": "services-history", "from": "services", "to": "history", "label": "crea la fila",
             "fromSide": "top", "toSide": "bottom"},
            {"id": "services-attempt", "from": "services", "to": "attempt", "label": "registra el rechazo",
             "variant": "security", "fromSide": "bottom", "toSide": "top"},
            {"id": "attempt-guide", "from": "attempt", "to": "guide", "label": "guide · FK PROTECT",
             "fromSide": "left", "toSide": "bottom"},
            {"id": "attempt-user", "from": "attempt", "to": "user", "label": "attempted_by · FK PROTECT",
             "fromSide": "right", "toSide": "bottom"},
        ],
        "cards": [
            {"dot": "cyan", "title": "Restricciones en la base", "items": [
                "tracking_number: único, 22 caracteres y formato con CheckConstraint (models.py:170-172, :196-199)",
                "current_stage solo admite las cinco etapas (models.py:200-203)",
                "Una fila por etapa y guía: unique_stage_per_guide (models.py:354)",
                "PROTECT impide borrar una guía o un usuario con historial o intentos (models.py:339, :343, :420, :423)"]},
            {"dot": "emerald", "title": "Patrones que el código usa", "items": [
                "State, forma simple: Stage y solo la etapa siguiente (models.py:43, :61)",
                "Template Method del framework: save_base sobrescrito (models.py:209, :367)",
                "Compare-and-set, no GoF: UPDATE condicional (models.py:104-108)",
                "Analogía de Proxy de protección: QuerySet que vigila escrituras (models.py:118, :254)",
                "Facade: casos de uso sobre las invariantes (services.py:1, :59, :73)",
                "Value Object: TrackingNumber normaliza y valida (values.py:19-23)"]},
            {"dot": "amber", "title": "Planeado, todavía no existe", "items": [
                "Incident para el contador con alerta (M66, decisión D5)",
                "Rol de PostgreSQL sin UPDATE ni DELETE sobre el historial (M66)"]},
            {"dot": "rose", "title": "Límites conocidos", "items": [
                "SQL directo, raw y loaddata saltan las validaciones (models.py:12-16)",
                "Una guía creada fuera de los servicios no tiene historial y responde 409 (services.py:82-83)",
                "El historial se valida por orden de inserción (models.py:394)"]},
        ],
    }


if __name__ == "__main__":
    for name, doc in {
        "arquitectura": architecture(),
        "modelo-de-datos": data_model(),
        "ciclo-de-vida-guia": lifecycle(),
        "secuencia-consultas": sequence(),
    }.items():
        (HERE / f"{name}.json").write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("escrito", name)
