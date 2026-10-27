# Investigación: Herramientas para Loop Claude Design y Loop Claude Code

**Fecha:** 2026-09-30  
**Método:** READMEs clonados en shallow clone (--depth 1 --filter=blob:limit=300k) desde github.com, 30 repositorios. Se leyeron README.md, SKILL.md, CLAUDE.md, AGENTS.md y LICENSE de cada uno.  
**Fallos en clone:** Ninguno. Todos los repositorios se clonaron exitosamente.

---

## Herramientas de Diseño

Para el loop Claude Design (Opus diseña rediseño web), se evaluaron skills, MCPs y herramientas de interfaz.

| Proyecto | Qué es | Licencia | Instalación | Dónde encaja | Veredicto |
|---|---|---|---|---|---|
| [impeccable](https://github.com/pbakaus/impeccable) | Skill de diseño: 24 comandos, auditoría, crítica UX, anti-patrones deterministas | Apache 2.0 | `npx impeccable install` | Loop Claude Design | **Usar** — lo más maduro, 61 reglas de detección sin LLM, establece PRODUCT.md como fuente de verdad |
| [hallmark](https://github.com/nutlope/hallmark) | Skill de diseño: genera UI con 21 temas, rechaza AI-generated look, 57 gates de calidad | MIT | `npx skills add nutlope/hallmark` | Loop Claude Design | **Usar** — enfoque en anti-plantillas, custom mode para briefs creativos |
| [open-design](https://github.com/nexu-io/open-design) | App desktop/MCP: Claude Design alternativa open-source, prototipos web, decks, móvil | Apache 2.0 | `od mcp install claude` o descargar app | Loop Claude Design | **Opcional** — completa pero requiere instalación local; útil si necesitas más que skill |
| [stitch-mcp](https://github.com/davideast/stitch-mcp) | CLI para llevar diseños AI a desarrollo, preview local, build integrado | Apache 2.0 | `npm install -g @_davideast/stitch-mcp` | Loop Claude Design + Code | **Usar** — puente directo diseño→código, enfoque en workflow |
| [cult-ui](https://github.com/nolly-studio/cult-ui) | Librería de componentes copiables, accesibles, open source | MIT | `with shadcn` (integración) | Loop Claude Code | **Opcional** — referencia de componentes para React, no es skill de diseño |
| [claude-webkit](https://github.com/Hainrixz/claude-webkit) | Herramienta para prototipos web en Claude Code | MIT | `npm install -g @anthropic-ai/claude-code` | Loop Claude Code | **No usar** — nombre confuso, parece ser tooling, no skill de diseño |
| [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | (sin descripción clara en README) | MIT | sin instrucción en el README | No aplica | **No usar** — documentación insuficiente |
| [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) | Lista compilada de recursos de diseño | MIT | sin instrucción en el README | No aplica | **No usar** — es un índice, no una herramienta ejecutable |

---

## Herramientas de Proceso

Para el loop Claude Code (Sonnet convierte diseño en React+TS+Sass/BEM+Redux+Jest), se evaluaron metodologías, blueprints y flujos de subagentes.

| Proyecto | Qué es | Licencia | Instalación | Dónde encaja | Veredicto |
|---|---|---|---|---|---|
| [the-architect](https://github.com/Hainrixz/the-architect) | Meta-agente que genera blueprints de arquitectura en markdown, 20 secciones con pasos de build | MIT | `/plugin install the-architect@soyenriquerocha` o `git clone` + `claude` | Loop Claude Code | **Usar** — genera blueprints accionables con "Done when" específicos, gates adversariales |
| [abogado-del-diablo](https://github.com/Hainrixz/abogado-del-diablo) | Skill en español que critica ideas sin filtro, red team por 8 ángulos, veredicto + grietas | MIT | `/plugin install abogado-del-diablo@abogado-del-diablo` | Loop Claude Code | **Opcional** — útil para pre-mortem en arquitectura, requiere integración en loop |
| [superpowers](https://github.com/obra/superpowers) | Metodología completa: spec→plan→subagentes autonomos, YAGNI+TDD, soporta 20+ harnesses | MIT | `/plugin install superpowers@claude-plugins-official` | Loop Claude Code | **Usar** — cubre todo el ciclo desarrollo, subagentes paralelos, verificación integrada |
| [spec-kit](https://github.com/github/spec-kit) | Kit de GitHub para escribir specs/PRDs estructuradas | MIT | sin instrucción clara | No aplica | **Opcional** — referencia GitHub, no integrable en loops |
| [OpenSpec](https://github.com/Fission-AI/OpenSpec) | (AGENTS.md presente, README poco claro) | MIT | sin instrucción en el README | No aplica | **No usar** — documentación insuficiente |
| [agent-teams-lite](https://github.com/Gentleman-Programming/agent-teams-lite) | Coordinación de subagentes ligera | MIT | `brew install gentleman-programming/tap/gentle-ai` | Loop Claude Code | **Opcional** — si necesitas orquestar múltiples agentes; suele ser overkill |
| [gentle-ai](https://github.com/Gentleman-Programming/gentle-ai) | CLI amigo para multi-agente orchestration, es la base de agent-teams-lite | MIT | sin instrucción en el README | No aplica | **No usar** — instalar vía marcado de dependencia, no directo |
| [Gentleman-Skills](https://github.com/Gentleman-Programming/Gentleman-Skills) | Compilación comunitaria de skills para múltiples plataformas | MIT | sin instrucción en el README | No aplica | **Opcional** — es un index, revisar skills individuales de interés |
| [gentleman-guardian-angel](https://github.com/Gentleman-Programming/gentleman-guardian-angel) | Agente guardian para auditar decisiones de otros agentes | MIT | `npm install -g @kilocode/cli` | Loop Claude Code | **Opcional** — revisor independiente, agrega overhead si no hay problemas recurrentes |

---

## Herramientas de Memoria, Contexto y Ahorro de Tokens

Para mantener contexto entre sesiones y reducir consumo de tokens, se evaluaron sistemas de memoria persistente y grafos de conocimiento.

| Proyecto | Qué es | Licencia | Instalación | Dónde encaja | Veredicto |
|---|---|---|---|---|---|
| [engram](https://github.com/Gentleman-Programming/engram) | Memoria persistente MCP: SQLite+FTS5, binario Go, compatible con 15+ plataformas | MIT | `brew install gentleman-programming/tap/engram` o descargar de Releases | Memoria | **Usar** — binario single, cero dependencias, MCP estándar, local-first con opción cloud |
| [graphify](https://github.com/Graphify-Labs/graphify) | Grafo de conocimiento: mapea proyecto (código, docs, PDFs) como graph queryable, tree-sitter | Apache 2.0 | `uv tool install graphifyy` o `pipx install graphifyy` | Memoria | **Usar** — parseo local (cero LLM para código), soporta tree-sitter AST, genera graph.json reutilizable |
| [caveman](https://github.com/juliusbrussee/caveman) | (CLAUDE.md presente, README poco claro) | MIT | sin instrucción en el README | No aplica | **No usar** — documentación insuficiente |
| [claude-token-efficient](https://github.com/drona23/claude-token-efficient) | Un archivo: hace respuestas tersas, reduce tokens en salida | MIT | "Drop it in your project" — copiar archivo | Ahorro de tokens | **Opcional** — enfoque minimalista, útil si tokens de salida son cuello de botella |
| [context-mode](https://github.com/mksglu/context-mode) | (Describido como "the other half", pero README poco detallado) | No especificada | sin instrucción en el README | No aplica | **No usar** — licencia y docs insuficientes |
| [rtk](https://github.com/rtk-ai/rtk) | Herramienta de línea de comandos para reducción de tokens | Apache 2.0 | `brew install rtk` | Ahorro de tokens | **Opcional** — requiere instalación local Homebrew, menos universal que graphify/engram |
| [code-review-graph](https://github.com/tirth8205/code-review-graph) | Grafo de revisión de código, visualiza patrones, depende de graphify parcialmente | MIT | `pip install code-review-graph` | Memoria | **Opcional** — especializado en reviews, no cubre memoria general del proyecto |

---

## Herramientas de Navegación Web y Verificación

Para que Sonnet pueda verificar diseños en vivo y comprobar funcionalidad de código compilado.

| Proyecto | Qué es | Licencia | Instalación | Dónde encaja | Veredicto |
|---|---|---|---|---|---|
| [playwright-mcp](https://github.com/microsoft/playwright-mcp) | MCP: Playwright automation, accesibility tree (no screenshots), determinista | Apache 2.0 | `claude mcp add playwright npx @playwright/mcp@latest` | Verificación | **Usar** — MCP estándar, compatible Cloud, sin visión necesaria, determinista |
| [agent-browser](https://github.com/vercel-labs/agent-browser) | CLI Rust nativo: browser automation rápida, optimizado para agentes | Apache 2.0 | `npm install -g agent-browser` | Verificación | **Opcional** — más rápido que Playwright, requiere Node, vale si rendimiento es crítico |
| [Scrapling](https://github.com/D4Vinci/Scrapling) | (README poco claro, MCP probable) | BSD | sin instrucción en el README | No aplica | **No usar** — documentación insuficiente |

---

## Skills de Anthropic (Referencia)

Anthropic mantiene una colección official en [anthropics/skills](https://github.com/anthropics/skills). De interés para diseño/frontend:

- `skills/frontend-design/` — Skill original de diseño frontend (base de impeccable)
- `skills/react-typescript-guide/` — Guía para React+TypeScript
- Otros: node-dev-workflow, python-dev-workflow, error-analysis, etc.

**Veredicto:** Usar impeccable+hallmark en lugar de frontend-design directo (han mejorado y agregado determinismo).

---

## Top 8 para estos loops

Ordenados por valor dentro de Loop Claude Design + Loop Claude Code:

| # | Proyecto | Primer comando | Cloud (Claude Code)? | Localmente? | Claude Design? |
|---|---|---|---|---|---|
| 1 | **impeccable** | `npx impeccable install` | Sí | Sí | Sí, es skill pura |
| 2 | **the-architect** | `/plugin install the-architect@soyenriquerocha` | Sí | Sí (plugin) | Sí, genera blueprints |
| 3 | **superpowers** | `/plugin install superpowers@claude-plugins-official` | Sí | Sí (plugin) | Sí, cubrir todo el ciclo |
| 4 | **engram** | `brew install gentleman-programming/tap/engram` | Sí (MCP) | Sí | No consta explícitamente |
| 5 | **graphify** | `uv tool install graphifyy && graphify install` | Sí (skill) | Sí | Sí, mapeo de proyecto |
| 6 | **hallmark** | `npx skills add nutlope/hallmark` | Sí | Sí | Sí, skill de diseño |
| 7 | **playwright-mcp** | `claude mcp add playwright npx @playwright/mcp@latest` | Sí | Sí | No consta |
| 8 | **stitch-mcp** | `npm install -g @_davideast/stitch-mcp` | Sí (si Node en cloud) | Sí | Sí, puente diseño→código |

---

## Advertencias Críticas

### Licencias
- **Copyleft / GPL / AGPL:** Ninguno en los repos recomendados. Todos MIT o Apache 2.0.
- **Licencias poco claras:** context-mode (no está etiquetada explícitamente), Scrapling (BSD, menos común).

### Dependencias y Configuración
- **Requieren navegador local:** open-design (app desktop), playwright-mcp y agent-browser (necesitan navegador headless/Chromium).
- **Requieren cuentas / API keys:** graphify ofrece plataforma paga (app.graphify.com), pero CLI es local-first sin requisitos.
- **Planes pagos:** Engram Cloud es opcional (no necesario para uso local), graphify Cloud es opcional.
- **Node.js:** impeccable, hallmark, stitch-mcp, agent-browser, playwright-mcp. Instalar `node@18+` de una sola vez.
- **Python:** graphify, code-review-graph. Instalar `python@3.10+` y `uv` o `pipx`.

### Compatibilidad Cloud (Claude Code en web)
- ✅ Todos los skills/plugins (impeccable, hallmark, the-architect, superpowers, abogado-del-diablo, engram, graphify) funcionan en cloud.
- ✅ playwright-mcp funciona en cloud (MCP nativo).
- ⚠️ agent-browser puede requerir verificación de Node en container cloud; graphify requiere Python. Revisar docs de entorno antes de usar.

### Herramientas que solo funcionan localmente (no en Claude Code web)
- open-design (aplicación desktop).
- rtk (requiere Homebrew).

---

## Recomendación Integrada

**Para Loop Claude Design:**
1. Instala **impeccable** (`npx impeccable install`, ejecuta `/impeccable init`)
2. Considera **hallmark** como skill alternativa si necesitas temas predefinidos.

**Para Loop Claude Code:**
1. Instala **the-architect** (plugin) para generar blueprints accionables.
2. Instala **superpowers** (plugin official) para metodología end-to-end.
3. Usa **abogado-del-diablo** (opcional, antes de confirmar arquitectura).

**Para Memoria y Contexto:**
1. Instala **engram** (MCP) para sesiones largas.
2. Corre **graphify** una sola vez al inicio de proyecto (genera graph.json reutilizable).

**Para Verificación:**
1. Instala **playwright-mcp** (cloud-compatible, MCP nativo).

**Puente Diseño→Código:**
1. Usa **stitch-mcp** si generas prototipos HTML/CSS desde el design loop y necesitas moveaos a `src/`.

---

## Licencias Resumidas

| Licencia | Repos | Restricción |
|---|---|---|
| MIT | impeccable, hallmark, abogado-del-diablo, the-architect, superpowers, caveman, claude-token-efficient, code-review-graph, spec-kit, OpenSpec, agent-teams-lite, Gentleman-Skills | Usable libremente en proyectos privados y comerciales |
| Apache 2.0 | open-design, stitch-mcp, engram, graphify, rtk, playwright-mcp, agent-browser | Igual a MIT + patente explícita |
| BSD | Scrapling | Similar a MIT, revisar LICENSE exacto |
| Otros | context-mode | No especificado, revisar README |

---

## Próximos Pasos

1. Clonar este repositorio de investigación para referencia offline.
2. Instalar impeccable + hallmark antes de Loop Claude Design.
3. Instalar the-architect + superpowers antes de Loop Claude Code.
4. Probar engram + graphify con un proyecto pequeño primero.
5. Documentar en STACK_HOUND_EXPRESS.md cualquier nueva dependencia y su propósito.
