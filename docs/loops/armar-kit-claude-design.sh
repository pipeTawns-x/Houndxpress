#!/usr/bin/env bash
# Assembles the folder that gets linked in Claude Design (Loop 1).
# Usage, from the repository root: bash docs/loops/armar-kit-claude-design.sh
# Output: kit-claude-design/ (ignored by git). Re-run it whenever the sources change.
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
out="$root/kit-claude-design"

rm -rf "$out"
mkdir -p "$out"/{brand,capturas-v1,contenido-v1,tokens-v1}

cp "$root/docs/loops/kit/BRIEF.md" "$out/00-BRIEF.md"
cp "$root/docs/loops/kit/CONTENIDO-1A1.md" "$out/01-CONTENIDO-1A1.md"
cp "$root/docs/REQUISITOS_EBAC.md" "$out/02-REQUISITOS_EBAC.md"
cp "$root/docs/diseno/04-sistema-de-diseno.md" "$out/03-sistema-v1.md"
cp "$root/docs/diseno/03-arquitecto.md" "$out/04-decisiones-v1.md"

cp "$root"/frontend/public/brand/*.svg "$out/brand/"

for name in site services coverage culture faq; do
  cp "$root/frontend/src/content/$name.ts" "$out/contenido-v1/"
done
cp "$root/frontend/src/services/demoData.ts" "$out/contenido-v1/"

cp "$root/frontend/src/content/designTokens.ts" "$out/tokens-v1/"
if [ -d "$root/frontend/src/styles/abstracts" ]; then
  cp "$root"/frontend/src/styles/abstracts/*.scss "$out/tokens-v1/"
else
  cp "$root/frontend/src/index.css" "$out/tokens-v1/"
fi

for shot in inicio-escritorio inicio-movil rastreo-resultado-movil panel-escritorio; do
  cp "$root/docs/diseno/capturas/$shot.jpg" "$out/capturas-v1/"
done

echo "Kit listo en $out"
find "$out" -type f | sed "s|$out/||" | sort
