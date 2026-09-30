# Loop 1 · Claude Design (Opus 5.5): rediseño de Hound Express, versión 2

**Para qué:** que Claude Design produzca el rediseño completo, 1 a 1 con el sitio actual, y lo entregue a Claude Code con su función de handoff. Después sigue el [Loop 2 de Claude Code](02-LOOP-CLAUDE-CODE.md).

## Qué cambió respecto a la versión 1 del loop

La primera corrida en Claude Design gastó uso y produjo poco. Estas son las causas probables y lo que hace esta versión:

| Versión 1 | Versión 2 | Por qué |
|---|---|---|
| Un solo prompt con 12 pantallas, 2 anchos, estados y siete pasos de debate | Seis lotes cortos, un mensaje por lote | Cada turno regenera HTML y arrastra el historial completo. Un pedido gigante se corta a medias |
| Diagnóstico, abogado del diablo y arquitecto dentro de Claude Design | Ya están hechos (`docs/diseno/00` a `05`). El brief trae las conclusiones y la crítica de cada lote la hace Claude Code con Opus 5.5 | Claude Design sirve para dibujar; el debate en prosa gasta el mismo uso sin producir pantallas |
| Adjuntar archivos sueltos en cada mensaje | Un kit armado por script que se enlaza una vez | El contexto vive en archivos del proyecto, no en el chat |
| Dos maquetas por pantalla y PNG a 1x y 2x | Un HTML responsivo por pantalla, revisado en 390 y 1440 px | La mitad del trabajo y es lo que Claude Code implementa |
| `.zip` armado a mano | Botón de handoff a Claude Code y exportación de carpeta como respaldo | Es la función nativa: pasa archivos, historial y README |
| 10 pantallas | 14 plantillas, incluidas País, Alianza, Medios y Legal | El sitio actual tiene 19 páginas; "1 a 1" exige cubrirlas todas |

Fuentes de las funciones de Claude Design que usa este loop: [anuncio de Anthropic](https://www.anthropic.com/news/claude-design-anthropic-labs) (sistema de diseño leído del código, comentarios en línea, perillas de ajuste, exportación a HTML y handoff) y [tutorial de Claude Academy](https://academy.claude.com/tutorials/using-claude-design-for-prototypes-and-ux) (enlazar solo el directorio relevante, pedir estados vacío, error y cargando antes del handoff). Si un botón tiene otro nombre en tu versión, busca la misma función en el menú de compartir o exportar.

## Quién hace qué

| Paso | Dónde | Modelo | Qué produce |
|---|---|---|---|
| Kit | Claude Code local | Opus 5.5 | `kit-claude-design/` con el brief, el contenido y la versión 1 |
| Lotes 0 a 5 | Claude Design | Opus 5.5 | Pantallas HTML, `DESIGN.md`, `tokens.json` y documentos de cierre |
| Revisión de lote | Claude Code local | Opus 5.5 | Un mensaje de cambios listo para pegar en Claude Design |
| Handoff | Claude Design → Claude Code local | Opus 5.5 | `docs/diseno/claude-design/` en la rama, con commit y push |
| Implementación | Claude Code en la nube | Sonnet 5.5 | El frontend, con el Loop 2 |

## Antes de empezar (una vez)

1. Si el tutor dejó comentarios en la entrega de frontend, pégalos en la sección 9 de [`kit/BRIEF.md`](kit/BRIEF.md).
2. Arma el kit desde la raíz del repositorio:

   ```bash
   bash docs/loops/armar-kit-claude-design.sh
   ```

3. En Claude Design: proyecto nuevo, modelo Opus 5.5, y enlaza **solo** la carpeta `kit-claude-design/`. No enlaces el repositorio completo: trae diagramas de miles de líneas, `node_modules` y `.git`, y Claude Academy recomienda enlazar solo el directorio que importa.

## Reglas para no gastar de más

1. Un mensaje por lote. Si un lote sale bien, responde solo "aprobado, sigue con el lote N".
2. Los ajustes chicos (un texto, un espacio, un color) se hacen con **comentarios en línea** sobre el elemento o con las **perillas**, no con un mensaje nuevo que regenere todo.
3. Junta tus comentarios en un solo mensaje por lote.
4. Si un lote sale mal dos veces, no insistas: exporta y pide la revisión en Claude Code.
5. No pidas rehacer lotes aprobados. Un cambio global se hace en el componente o el token.

---

## Lote 0 · Sistema de diseño

```text
Lee 00-BRIEF.md completo y los archivos que cita. Trabaja el lote 0: sistema de diseño v2.

Entrega una sola pantalla, sistema.html, con:
- paleta con la razón de contraste calculada junto a cada par de texto y fondo;
- escala tipográfica, espaciado, radios, sombras y anillo de foco;
- estos componentes con su bloque BEM y todos sus estados: site-header (con menú móvil abierto), button, text-field, guide-search (simple y múltiple), stage-timeline (horizontal y vertical), stage-badge, stat-card, service-card, demo-notice, api-status, accordion, site-footer.

Parte de 03-sistema-v1.md y de tokens-v1/: conserva lo que funciona, corrige lo que no y explica cada cambio en una línea.
Crea perillas de ajuste para el tono del marino de fondo, el radio base y la densidad del espaciado.
Cierra con la autoevaluación del Brief §11.
```

## Lote 1 · Dirección con el Inicio

```text
Lote 1: Inicio (inicio.html) con el sistema del lote 0.

Haz dos direcciones, A y B, de la misma pantalla, cada una responsiva. Cambia la composición del héroe y el ritmo de las secciones; la marca y los componentes no cambian.
En las dos, el buscador de guía se ve sin desplazarse en 390 × 844 y en 1440 × 900.
Contenido: la sección "Inicio" de 01-CONTENIDO-1A1.md, completa.

Cierra con la autoevaluación y con tres líneas por dirección: qué gana y qué pierde.
```

**Pausa obligatoria:** elige A o B y pide la revisión en Claude Code (abajo) antes del lote 2. Es la decisión que arrastran todas las demás pantallas.

## Lote 2 · Rastreo

```text
Lote 2: Rastreo (rastreo.html) con la dirección aprobada.

Un solo HTML con un conmutador de estados visible arriba: vacío, cargando, resultado, múltiple (3 guías), no encontrada y formato inválido.
Usa las guías de ejemplo de contenido-v1/demoData.ts.
Línea de tiempo según Brief §6. Incluye copiar número y enlace para compartir con ?guia=.
En 390 px, el resultado va primero y el aviso de demostración debajo.

Cierra con la autoevaluación.
```

## Lote 3 · Panel de operaciones

```text
Lote 3: Panel de operaciones (panel.html).

Conmutador de estados: con datos, vacío, cargando, error de la API, guía entregada (sin avance posible), cajón de historial abierto y formulario de registro con errores por campo.
No negociable (Brief §4): el único avance posible es a la etapa siguiente y el botón dice "Avanzar a {siguiente etapa}"; el historial no se edita.
Incluye los indicadores: total, en tránsito, entregadas y distribución por etapa.
El dispositivo principal es escritorio; en 390 px la tabla se vuelve tarjetas.

Cierra con la autoevaluación.
```

**Pausa recomendada:** revisión en Claude Code. Es la pantalla con más lógica y la que más revisa el tutor.

## Lote 4a · Servicios, cobertura y alianzas

```text
Lote 4a: servicios.html, cobertura.html, pais.html (instancia México, con un selector que lista los otros cuatro países) y alianza.html (instancia Amazon LATAM).

Reutiliza los componentes que ya existen. Si creas un bloque nuevo, dilo con su nombre BEM.
Contenido: las secciones correspondientes de 01-CONTENIDO-1A1.md, completas, con los textos de contenido-v1/. No inventes cifras.

Cierra con la autoevaluación.
```

## Lote 4b · Nosotros, medios, preguntas, contacto y legal

```text
Lote 4b: nosotros.html, medios.html, preguntas.html (con buscador y estado sin resultados), contacto.html (con errores por campo y el aviso de mailto) y legal.html (instancia Privacidad).

Mismas reglas del lote 4a.

Cierra con la autoevaluación.
```

## Lote 5 · Cierre y documentos del handoff

```text
Lote 5: 404.html y disenos.html (índice con enlace a cada pantalla y la guía de estilo).
Decide qué plus del Brief §8 entran y por qué. Si entra el modo oscuro, muéstralo en inicio, rastreo y panel.

Antes de crear los documentos, repasa cada pantalla con datos distintos: 1 guía, 10 guías, destinatario con nombre largo, lista vacía y error.

Crea en el proyecto:
- DESIGN.md: tokens (color con contraste calculado, tipografía, espaciado, radios, sombras, breakpoints 640/768/1024/1280), reglas de uso e inventario de componentes: bloque BEM, elementos, modificadores, estados y pantallas donde aparece.
- tokens.json con los mismos valores.
- pantallas.md: ruta nueva → archivo HTML → estados incluidos → página del sitio actual que reemplaza.
- decisiones.md: qué cambió respecto a la v1 y por qué, cada comentario de revisión y qué se hizo con él, y los pendientes para Hound Express.
- plus.md: qué plus entraron, en qué pantallas y cómo se ven sus estados.
```

**Pausa obligatoria:** revisión final en Claude Code antes del handoff.

---

## Revisión de un lote en Claude Code (Opus 5.5, local)

1. En Claude Design, exporta el proyecto como HTML o carpeta.
2. Descomprímelo en `docs/diseno/claude-design/revisiones/lote-N/`.
3. Pega esto en Claude Code:

```text
Revisa el lote N de Claude Design que está en docs/diseno/claude-design/revisiones/lote-N/.
Usa la skill abogado-del-diablo contra docs/loops/kit/BRIEF.md y docs/loops/kit/CONTENIDO-1A1.md.
Abre cada HTML en el navegador en 390 y 1440 px y captura lo que revises.
Devuélveme un solo mensaje de cambios, máximo 10 y ordenados por impacto, listo para pegar en Claude Design. Cada cambio con pantalla, elemento, problema y corrección. Nada de elogios.
```

4. Pega ese mensaje en Claude Design tal cual.

## Handoff

1. En Claude Design, usa **Hand off to Claude Code**. Como respaldo, exporta también la carpeta del proyecto.
2. En Claude Code local (Opus 5.5):

```text
Integra el handoff de Claude Design en docs/diseno/claude-design/. Verifica que estén DESIGN.md, tokens.json, pantallas.md, decisiones.md, plus.md y un HTML por cada fila de pantallas.md. Si falta algo, dímelo antes de hacer commit. Luego commit y push a la rama del PR.
```

3. Abre la sesión en la nube con **Sonnet 5.5** y pega el prompt del [Loop 2](02-LOOP-CLAUDE-CODE.md).
