"""Genera los candidatos JSON de Archify para Hound Express.

Uso, desde la raíz del repositorio:
    ARCHIFY_HOME=<carpeta-de-archify> python3 docs/diagramas/fuentes/generar.py
    node <carpeta-de-archify>/bin/archify.mjs finalize <tipo> docs/diagramas/fuentes/<nombre>.json docs/diagramas/<nombre>.html --quality showcase --json

ARCHIFY_HOME es la carpeta donde está instalado Archify (la que contiene `bin/` y `examples/`).
Si no se define, se usa `.claude/skills/archify` dentro del repositorio.
"""

import json
import os
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
ARCHIFY_HOME = Path(os.environ.get("ARCHIFY_HOME") or ROOT / ".claude/skills/archify")
ES = json.loads((ARCHIFY_HOME / "examples/locales/es.json").read_text(encoding="utf-8"))
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


def architecture() -> dict:
    y, h = 300, 64
    main = [
        ("users", "external", "Visitantes y personal", "navegador · móvil", 170, None),
        ("spa", "frontend", "Frontend React", "Vite · Sass · Redux · Router", 170, "HTTPS"),
        ("proxy", "cloud", "Proxy /api", "Vite :5173 · nginx :8080", 170, "fetch /api"),
        ("api", "backend", "API Django + DRF", "Django 5.2 · :8000", 170, "HTTP :8000"),
        ("db", "database", "SQLite", "db.sqlite3", 150, "ORM · SQL"),
    ]
    components, x = [], 40
    for node_id, kind, label, sub, width, incoming in main:
        if incoming:
            x += gap(incoming)
        components.append({"id": node_id, "type": kind, "label": label, "sublabel": sub,
                           "pos": [x, y], "size": [width, h]})
        x += width
    pos = {c["id"]: c["pos"] for c in components}
    components += [
        {"id": "storage", "type": "database", "label": "localStorage", "sublabel": "guías de demostración",
         "pos": [pos["spa"][0], 470], "size": [170, h]},
        {"id": "tracking", "type": "backend", "label": "App tracking", "sublabel": "guías e historial · Fase 1",
         "pos": [pos["api"][0], 470], "size": [170, h], "tag": "modelos"},
        {"id": "health", "type": "backend", "label": "HealthView", "sublabel": "GET /api/v1/health/",
         "pos": [pos["api"][0], 130], "size": [170, h], "tag": "público"},
    ]
    return {
        "schema_version": 1,
        "diagram_type": "architecture",
        "meta": meta("Hound Express · arquitectura del proyecto", "arquitectura"),
        "components": components,
        "boundaries": [
            {"kind": "region", "label": "Navegador", "wraps": ["spa", "storage"]},
            {"kind": "region", "label": "Servidor · local o Docker Compose",
             "wraps": ["proxy", "api", "db", "tracking", "health"]},
        ],
        "connections": [
            {"id": "users-spa", "from": "users", "to": "spa", "label": "HTTPS", "variant": "emphasis"},
            {"id": "spa-proxy", "from": "spa", "to": "proxy", "label": "fetch /api"},
            {"id": "proxy-api", "from": "proxy", "to": "api", "label": "HTTP :8000"},
            {"id": "api-db", "from": "api", "to": "db", "label": "ORM · SQL"},
            {"id": "spa-storage", "from": "spa", "to": "storage", "label": "guías demo", "variant": "dashed",
             "fromSide": "bottom", "toSide": "top", "labelAt": [416, 378]},
            {"id": "api-tracking", "from": "api", "to": "tracking", "label": "modelos", "variant": "dashed",
             "fromSide": "bottom", "toSide": "top", "labelAt": [982, 378]},
            {"id": "api-health", "from": "api", "to": "health", "label": "sin sesión", "variant": "security",
             "fromSide": "top", "toSide": "bottom"},
        ],
        "cards": [
            {"dot": "cyan", "title": "Frontend", "items": [
                "Sitio público, rastreo y panel de operaciones en una sola SPA",
                "Guías de demostración en localStorage hasta que exista la API de guías",
                "VITE_DATA_SOURCE=api cambia al repositorio HTTP previsto para la Fase 2"]},
            {"dot": "emerald", "title": "Backend · Fase 0 y Fase 1", "items": [
                "Fase 0 · base del proyecto: config con apps accounts, core y tracking",
                "Fase 1 · base de datos: guías e historial de etapas que no se edita ni se borra",
                "Todo endpoint exige sesión salvo /api/v1/health/"]},
            {"dot": "amber", "title": "Siguientes fases", "items": [
                "Fase 2 · API: GET, POST y PUT de guías con validación del orden de etapas",
                "Fase 3 · integración y despliegue: frontend contra la API y entrega final",
                "Interfaz para operadores sobre la API de guías"]},
        ],
    }


def lifecycle() -> dict:
    stages = [
        ("cargo_received", "start", "Recepción de carga", "Aduana"),
        ("vehicle_loaded", "active", "Vehículo cargado", "Aduana"),
        ("vehicle_released", "active", "Vehículo liberado", "Operaciones"),
        ("vehicle_in_transit", "active", "Vehículo en camino", "Seguridad"),
        ("cargo_delivered", "success", "Carga entregada", "KAM"),
    ]
    states = [
        {"id": code, "type": kind, "label": label, "sublabel": f"responsable: {owner}", "lane": "main",
         "col": i, "step": f"0{i + 1}", "tag": code}
        for i, (code, kind, label, owner) in enumerate(stages)
    ]
    transitions = [
        {"from": stages[i][0], "to": stages[i + 1][0], "label": "siguiente"}
        for i in range(len(stages) - 1)
    ]
    return {
        "schema_version": 2,
        "diagram_type": "lifecycle",
        "meta": meta("Ciclo de vida de una guía", "ciclo-de-vida-guia"),
        "lanes": [{"id": "main", "label": "Etapas en orden estricto"}],
        "states": states,
        "transitions": transitions,
        "cards": [
            {"dot": "cyan", "title": "Regla de avance", "items": [
                "La única etapa válida es la siguiente",
                "Una guía entregada ya no avanza",
                "El panel solo ofrece el botón de la etapa siguiente"]},
            {"dot": "emerald", "title": "Historial", "items": [
                "Cada avance agrega un evento con fecha y lugar",
                "Los eventos no se editan ni se borran",
                "Las fechas se guardan en UTC"]},
            {"dot": "amber", "title": "Por qué importa", "items": [
                "Solo 31 de cada 100 guías seguían el proceso en orden",
                "Saltar pasos causó pérdidas de 200k pesos MXN",
                "Fuente: contexto del negocio (README)"]},
        ],
    }


def sequence() -> dict:
    return {
        "schema_version": 1,
        "diagram_type": "sequence",
        "meta": meta("Consultas del frontend: estado de la API y rastreo", "secuencia-consultas",
                     column_fit="spread"),
        "participants": [
            {"id": "user", "type": "external", "label": "Usuario", "sublabel": "visitante o personal"},
            {"id": "web", "type": "frontend", "label": "Frontend React", "sublabel": "páginas y hooks"},
            {"id": "repo", "type": "frontend", "label": "GuideRepository", "sublabel": "demo o HTTP"},
            {"id": "api", "type": "backend", "label": "API Django", "sublabel": "/api/v1/"},
            {"id": "db", "type": "database", "label": "SQLite", "sublabel": "db.sqlite3"},
        ],
        "segments": [
            {"from": 150, "to": 310, "label": "Estado de la API · real desde la Fase 0"},
            {"from": 325, "to": 465, "label": "Rastreo · datos de demostración"},
            {"from": 480, "to": 710, "label": "Rastreo · VITE_DATA_SOURCE=api (Fase 2)"},
        ],
        "messages": [
            {"id": "health-get", "from": "web", "to": "api", "y": 175, "label": "GET /api/v1/health/", "variant": "emphasis"},
            {"id": "health-select", "from": "api", "to": "db", "y": 205, "label": "SELECT 1"},
            {"id": "health-row", "from": "db", "to": "api", "y": 235, "label": "fila", "variant": "return"},
            {"id": "health-ok", "from": "api", "to": "web", "y": 265, "label": "200 · status ok", "variant": "return"},
            {"id": "health-chip", "from": "web", "to": "user", "y": 295, "label": "API en línea", "variant": "return"},
            {"id": "demo-input", "from": "user", "to": "web", "y": 360, "label": "número de guía"},
            {"id": "demo-get", "from": "web", "to": "repo", "y": 390, "label": "get(número)"},
            {"id": "demo-result", "from": "repo", "to": "web", "y": 420, "label": "Guide o null", "variant": "return"},
            {"id": "demo-render", "from": "web", "to": "user", "y": 450, "label": "línea de tiempo", "variant": "return"},
            {"id": "api-input", "from": "user", "to": "web", "y": 515, "label": "número de guía"},
            {"id": "api-get", "from": "web", "to": "repo", "y": 545, "label": "get(número)"},
            {"id": "api-http", "from": "repo", "to": "api", "y": 575, "label": "GET /api/v1/guides/{n}/", "variant": "dashed"},
            {"id": "api-query", "from": "api", "to": "db", "y": 605, "label": "guía e historial", "variant": "dashed"},
            {"id": "api-rows", "from": "db", "to": "api", "y": 635, "label": "filas", "variant": "return"},
            {"id": "api-json", "from": "api", "to": "repo", "y": 665, "label": "200 JSON o 404", "variant": "return"},
            {"id": "api-result", "from": "repo", "to": "web", "y": 695, "label": "Guide o null", "variant": "return"},
        ],
        "activations": [
            {"participant": "web", "from": 170, "to": 301, "type": "frontend"},
            {"participant": "api", "from": 175, "to": 271, "type": "backend"},
            {"participant": "db", "from": 200, "to": 241, "type": "database"},
            {"participant": "web", "from": 355, "to": 456, "type": "frontend"},
            {"participant": "repo", "from": 385, "to": 426, "type": "frontend"},
            {"participant": "web", "from": 510, "to": 701, "type": "frontend"},
            {"participant": "repo", "from": 540, "to": 701, "type": "frontend"},
            {"participant": "api", "from": 570, "to": 671, "type": "backend"},
            {"participant": "db", "from": 600, "to": 641, "type": "database"},
        ],
        "cards": [
            {"dot": "emerald", "title": "Real hoy", "items": [
                "El panel y el pie consultan /api/v1/health/",
                "La vista hace SELECT 1 y responde 503 si la base falla",
                "Vite o nginx reenvían /api al puerto 8000: mismo origen, sin CORS"]},
            {"dot": "amber", "title": "Demostración", "items": [
                "demoRepository lee y escribe guías en localStorage",
                "La interfaz lo indica con el aviso de datos de demostración"]},
            {"dot": "cyan", "title": "Cuando llegue la Fase 2", "items": [
                "httpRepository llama a /api/v1/guides/",
                "404 se muestra como guía no encontrada",
                "Los mensajes punteados todavía no existen en el backend"]},
        ],
    }


# Evidence for both diagrams: branch `backend`, commit aed7967 (Fase 1). The commit is public,
# so the source markers become permalinks on GitHub.
BACKEND_REPOSITORY = {
    "url": "https://github.com/pipeTawns-x/Houndxpress.git",
    "revision": "aed7967dd0d3730d1feab3162d00c94033dd9685",
    "link_mode": "web",
}
MODELS = "backend/tracking/models.py"
ACCOUNTS = "backend/accounts/models.py"


def src(path: str, line: int, end: int | None = None, label: str | None = None) -> dict:
    ref = {"path": path, "line": line}
    if end is not None:
        ref["end_line"] = end
    if label:
        ref["label"] = label
    return ref


def data_model() -> dict:
    y_top, y_main, y_low, h = 110, 300, 490, 64
    incident_x, incident_w = 40, 190
    guide_x = incident_x + incident_w + gap("guide · FK")
    guide_w = 230
    history_x = guide_x + guide_w + gap("guide · FK PROTECT")
    history_w = 230
    user_x = history_x + history_w + gap("updated_by · FK PROTECT")
    user_w = 210
    components = [
        {"id": "incident", "type": "database", "label": "Incident (propuesta)", "sublabel": "contador con alerta · Fase 3",
         "pos": [incident_x, y_main], "size": [incident_w, h], "tag": "propuesta"},
        {"id": "guide", "type": "database", "label": "Guide", "sublabel": "tracking_number único · current_stage",
         "pos": [guide_x, y_main], "size": [guide_w, h], "tag": "CheckConstraint ×2",
         "sources": [src(MODELS, 162, 193, "Guide, campos y restricciones"),
                     src(MODELS, 185, 192, "CheckConstraint de formato y etapa"),
                     src(MODELS, 198, 240, "save_base: etapa solo por historial")]},
        {"id": "history", "type": "database", "label": "StatusHistory", "sublabel": "solo inserción · una fila por etapa",
         "pos": [history_x, y_main], "size": [history_w, h], "tag": "UniqueConstraint(guide, stage)",
         "sources": [src(MODELS, 326, 343, "StatusHistory y unique_stage_per_guide"),
                     src(MODELS, 348, 352, "save fuerza INSERT"),
                     src(MODELS, 354, 397, "save_base valida el prefijo")]},
        {"id": "user", "type": "database", "label": "User (accounts)", "sublabel": "AbstractUser · department",
         "pos": [user_x, y_main], "size": [user_w, h], "tag": "framework",
         "sources": [src(ACCOUNTS, 14, 22, "User con department"),
                     src(ACCOUNTS, 7, 11, "Department: cuatro áreas")]},
        {"id": "guide_qs", "type": "security", "label": "GuideQuerySet", "sublabel": "analogía de Proxy · vigila current_stage",
         "pos": [guide_x, y_top], "size": [guide_w, h], "tag": "analogía de Proxy",
         "sources": [src(MODELS, 111, 124, "update exige la autorización"),
                     src(MODELS, 126, 131, "bulk_update rechaza current_stage"),
                     src(MODELS, 133, 159, "bulk_create fija la etapa inicial")]},
        {"id": "history_qs", "type": "security", "label": "StatusHistoryQuerySet",
         "sublabel": "analogía de Proxy · sin update ni delete",
         "pos": [history_x, y_top], "size": [history_w, h], "tag": "analogía de Proxy",
         "sources": [src(MODELS, 243, 253, "delete y update bloqueados"),
                     src(MODELS, 255, 323, "bulk_create valida cada guía")]},
        {"id": "advance", "type": "backend", "label": "_advance_current_stage",
         "sublabel": "State simple · UPDATE condicional",
         "pos": [history_x, y_low], "size": [history_w, h], "tag": "State simple · compare-and-set",
         "sources": [src(MODELS, 93, 108, "UPDATE condicional"),
                     src(MODELS, 54, 56, "ContextVar de autorización"),
                     src(MODELS, 59, 67, "_validate_stage_transition")]},
    ]
    return {
        "schema_version": 1,
        "diagram_type": "architecture",
        "meta": meta("Modelo de datos · guías, historial y usuarios", "modelo-de-datos",
                     repository=BACKEND_REPOSITORY),
        "components": components,
        "boundaries": [
            {"kind": "region", "label": "App tracking · tracking/models.py",
             "wraps": ["incident", "guide", "history", "guide_qs", "history_qs", "advance"]},
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
             "fromSide": "bottom", "toSide": "top"},
            {"id": "advance-guide", "from": "advance", "to": "guide", "label": "avanza current_stage",
             "variant": "security", "fromSide": "left", "toSide": "bottom"},
        ],
        "cards": [
            {"dot": "cyan", "title": "Restricciones en la base", "items": [
                "tracking_number: único, 22 caracteres y formato con CheckConstraint (models.py:163, :185)",
                "current_stage solo admite las cinco etapas (models.py:189)",
                "Una fila por etapa y guía: unique_stage_per_guide (models.py:341)",
                "PROTECT impide borrar una guía o un usuario con historial (models.py:327, :330)"]},
            {"dot": "emerald", "title": "Patrones que el código usa", "items": [
                "State, forma simple: Stage y solo la etapa siguiente (models.py:41, :59)",
                "Template Method del framework: save_base sobrescrito (models.py:198, :354)",
                "Compare-and-set, no GoF: UPDATE condicional (models.py:97-101)",
                "Analogía de Proxy de protección: QuerySet que vigila escrituras (models.py:111, :243)"]},
            {"dot": "amber", "title": "Planeado, todavía no existe", "items": [
                "Incident para el contador con alerta (Fase 3)",
                "Registro de intentos de avance rechazados (Fase 2)",
                "Área del autor copiada en cada fila del historial (Fase 2)",
                "Rol de PostgreSQL sin UPDATE ni DELETE sobre el historial (Fase 3)"]},
            {"dot": "rose", "title": "Límites conocidos", "items": [
                "SQL directo, raw y loaddata saltan las validaciones (models.py:12-16)",
                "En recepción de carga una guía puede tener 0 o 1 filas (models.py:79-82)",
                "El historial se ordena por timestamp y pk (models.py:380)"]},
        ],
    }


def lifecycle_v2() -> dict:
    doc = lifecycle()
    doc["meta"]["repository"] = BACKEND_REPOSITORY
    doc["lanes"] = [{"id": "main", "label": "Etapas de una guía"}]
    names = ["CARGO_RECEIVED", "VEHICLE_LOADED", "VEHICLE_RELEASED", "VEHICLE_IN_TRANSIT", "CARGO_DELIVERED"]
    for index, state in enumerate(doc["states"]):
        refs = [src(MODELS, 42 + index, label=f"Stage.{names[index]}")]
        if index == 0:
            refs.append(src(MODELS, 224, 226, "el alta empieza en recepción"))
        if index == len(names) - 1:
            refs.append(src(MODELS, 61, 62, "entregada: no admite más etapas"))
        refs.append(src(MODELS, 59, 67, "solo la etapa siguiente"))
        state["sources"] = refs
    doc["cards"] += [
        {"dot": "violet", "title": "Patrones en el código", "items": [
            "State, forma simple: Stage con cinco valores (models.py:41)",
            "Solo la etapa siguiente es válida (models.py:59-67)",
            "UPDATE condicional, compare-and-set, no GoF (models.py:93-108)",
            "Propuestas: Command para avances auditables y Observer para avisos"]},
    ]
    return doc


if __name__ == "__main__":
    for name, doc in {
        "arquitectura": architecture(),
        "modelo-de-datos": data_model(),
        "ciclo-de-vida-guia": lifecycle_v2(),
        "secuencia-consultas": sequence(),
    }.items():
        (HERE / f"{name}.json").write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("escrito", name)
