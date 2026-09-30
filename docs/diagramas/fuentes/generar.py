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


def architecture() -> dict:
    y, h = 300, 64
    main = [
        ("users", "external", "Visitantes y personal", "navegador · móvil", 170, None),
        ("spa", "frontend", "Frontend React", "Vite · Tailwind · Router", 170, "HTTPS"),
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
        {"id": "tracking", "type": "backend", "label": "App tracking", "sublabel": "guías y etapas · M54",
         "pos": [pos["api"][0], 470], "size": [170, h], "tag": "planeado"},
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
            {"id": "api-tracking", "from": "api", "to": "tracking", "label": "M54 · modelos", "variant": "dashed",
             "fromSide": "bottom", "toSide": "top", "labelAt": [982, 378]},
            {"id": "api-health", "from": "api", "to": "health", "label": "sin sesión", "variant": "security",
             "fromSide": "top", "toSide": "bottom"},
        ],
        "cards": [
            {"dot": "cyan", "title": "Frontend", "items": [
                "Sitio público, rastreo y panel de operaciones en una sola SPA",
                "Guías de demostración en localStorage hasta que exista la API de guías",
                "VITE_DATA_SOURCE=api cambia al repositorio HTTP previsto para M64"]},
            {"dot": "emerald", "title": "Backend M52", "items": [
                "Proyecto config con apps accounts, core y tracking",
                "Modelo de usuario propio antes de la primera migración",
                "Todo endpoint exige sesión salvo /api/v1/health/"]},
            {"dot": "amber", "title": "Siguientes módulos", "items": [
                "M54: tablas de guías e historial que no se edita ni se borra",
                "M64: GET, POST y PUT de guías con validación del orden de etapas",
                "M66: entrega final y documentación"]},
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
                "Fuente: documento del proyecto (README, Contexto del negocio)"]},
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
            {"from": 150, "to": 310, "label": "Estado de la API · real desde M52"},
            {"from": 325, "to": 465, "label": "Rastreo · datos de demostración"},
            {"from": 480, "to": 710, "label": "Rastreo · VITE_DATA_SOURCE=api (M64)"},
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
            {"dot": "cyan", "title": "Cuando llegue M64", "items": [
                "httpRepository llama a /api/v1/guides/",
                "404 se muestra como guía no encontrada",
                "Los mensajes punteados todavía no existen en el backend"]},
        ],
    }


if __name__ == "__main__":
    for name, doc in {
        "arquitectura": architecture(),
        "ciclo-de-vida-guia": lifecycle(),
        "secuencia-consultas": sequence(),
    }.items():
        (HERE / f"{name}.json").write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("escrito", name)
