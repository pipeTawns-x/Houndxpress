# Loop 2 · Claude Code: del rediseño al código (Sonnet implementa, Opus revisa)

**Para qué:** convertir el `.zip` del [Loop 1 de Claude Design](01-LOOP-CLAUDE-DESIGN.md) en el frontend real del repositorio. Tiene que cumplir el documento oficial de EBAC y mantener verde el backend de M52.

**Cómo usarlo:**

1. Abre Claude Code en el repositorio `pipeTawns-x/Houndxpress`, en local o en la nube.
2. Descomprime el `.zip` de Claude Design en `docs/diseno/claude-design/` y haz commit.
3. Pon el modelo en **Sonnet 5.5** (`/model`).
4. Pega el bloque "Prompt".
5. Cuando el loop llegue a una fase de revisión, cambia a **Opus 5.5** (`/model`) y vuelve a Sonnet al terminarla.

## Estado de partida (no se reescribe, se adapta)

El repositorio ya tiene la versión 1 funcionando: React 19 + TypeScript + Sass con BEM + Redux Toolkit + Jest, rastreo, panel de guías, Docker y CI con 7 jobs. El loop **adapta** esa base al nuevo diseño; no empieza un proyecto nuevo.

---

## Herramientas (opcional, se instalan una vez)

Los comandos se copiaron de los README de cada proyecto el 30 de septiembre de 2026; el detalle está en [`docs/herramientas/INVESTIGACION.md`](../herramientas/INVESTIGACION.md).

```text
/plugin marketplace add Hainrixz/abogado-del-diablo
/plugin install abogado-del-diablo@abogado-del-diablo
/plugin marketplace add Hainrixz/the-architect
/plugin install the-architect@soyenriquerocha
npx impeccable install
```

`abogado-del-diablo` y `the-architect` se usan en la fase 0. `impeccable` audita el diseño en la fase 6 (`/impeccable init` la primera vez).

## Prompt

Vas a implementar el rediseño de Hound Express que está en `docs/diseno/claude-design/` sobre el frontend existente en `frontend/`. Antes de escribir código lee, en este orden y una sola vez:

1. `CLAUDE.md`
2. `docs/REQUISITOS_EBAC.md`
3. `docs/diseno/claude-design/DESIGN.md` y `plus.md`
4. `frontend/README.md`

No pegues esos documentos en el chat: cítalos por ruta. Todo lo que aprendas del proyecto va a `CLAUDE.md` o `docs/`, no a otro lado.

### Reglas del loop

1. **Una pieza por iteración:** un bloque BEM o una pantalla. Al terminarla corre solo lo que tocaste:
   ```bash
   npx jest <archivos> && npm run lint && npm run typecheck
   ```
   La suite completa y el build se corren al cerrar cada fase.
2. **Nunca declares algo hecho sin su salida:** pega el resumen de Jest, el código de salida de cada comando y la ruta de cada captura.
3. **Stack obligatorio** (documento oficial): Sass con BEM, React + TypeScript, Redux para el estado de las guías, Jest para las pruebas. Nada de Tailwind, CSS-in-JS ni otra librería de estado.
4. **Regla de negocio intocable:** una guía solo avanza a la etapa siguiente. La regla vive en `src/domain/`.
5. **Datos:** siguen siendo de demostración hasta M64 y la interfaz lo dice. No inventes endpoints en el backend.
6. **Detente y pregúntame solo si:**
   - el diseño contradice `REQUISITOS_EBAC.md`;
   - un plus necesita backend;
   - una dependencia nueva tiene licencia GPL o AGPL.
7. **Respuestas cortas:** qué cambiaste, resultado de las puertas y siguiente paso. Sin repetir el plan.
8. **Subagentes:**
   - Trabajo mecánico repetitivo (renombrar clases BEM en muchos archivos, capturas): subagente Sonnet.
   - Leer documentación externa: subagente Haiku.
   - Revisiones: siempre Opus.

### Fases

| Fase | Modelo | Qué se hace | Puerta de salida |
|---|---|---|---|
| 0. Handoff | **Opus** | Escribe `docs/diseno/06-handoff.md` con: tokens nuevos contra `src/styles/abstracts/_tokens.scss`; pantallas contra `src/pages/`; componentes contra bloques BEM (existe, cambia o nuevo); plus aceptados; orden de trabajo; pruebas nuevas. | Mi aprobación del handoff |
| 1. Tokens y base | Sonnet | `_tokens.scss`, tipografía, espaciado, breakpoints y modo oscuro si entró como plus. Actualiza `src/content/designTokens.ts` y la prueba de contraste. | Suite completa, build y `/disenos` coherente con `DESIGN.md` |
| 2. Componentes | Sonnet | Un bloque BEM por iteración, con prueba de comportamiento si tiene lógica. | Por iteración: pruebas del bloque, lint y typecheck |
| 3. Pantallas | Sonnet | Una pantalla por iteración. Captura en 390 y 1440 px, compárala con la del diseño y corrige. | Sin desplazamiento horizontal, un `h1`, cero errores de consola |
| 4. Plus | Sonnet | Los plus aceptados, uno por iteración. | Pruebas nuevas en verde |
| 5. Accesibilidad y SEO | Sonnet | Teclado, foco, `aria-live`, contraste. `robots.txt`, `sitemap.xml`, Open Graph y datos estructurados `Organization`. | Recorrido con teclado documentado y metadatos presentes en el build |
| 6. Revisión | **Opus** | `/code-review high` sobre el diff completo, más revisión visual de las 12 pantallas contra el diseño. Corrige cada hallazgo con una prueba que falle sin la corrección. | Cero hallazgos abiertos |
| 7. Entrega | Sonnet | Actualiza `docs/diseno/05-revision-del-rediseno.md`, `docs/diseno/indice.md` y sus capturas, `docs/REQUISITOS_EBAC.md` y `docs/STACK_HOUND_EXPRESS.md` si hay dependencias nuevas. Un commit por fase, push y PR. | CI en verde en GitHub |

### Puertas completas (fin de cada fase)

```bash
cd frontend && npm ci && npm run lint && npm run typecheck && npm test && npm run build
cd ../backend && python manage.py test && python -m ruff check . && python -m ruff format --check .
cd .. && docker compose up --build --detach --wait && curl -fsS http://127.0.0.1:8080/api/v1/health/ && docker compose down
```

### Definición de terminado

- Las 12 pantallas coinciden con el diseño en 390 y 1440 px, con capturas en `docs/diseno/capturas/`.
- Los requisitos de frontend de `docs/REQUISITOS_EBAC.md` están marcados como cumplidos, con evidencia.
- JS inicial menor a 150 KB gzip.
- CI en verde.
- El backend de M52 sigue intacto: 13 pruebas y la etiqueta `m52` sin mover.
