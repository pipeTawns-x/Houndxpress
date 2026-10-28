#!/bin/sh
# Fails when a diagram's HTML changed after its PNG preview was captured.
# img/previews.sha256 records the hash of each HTML at capture time.
set -eu

cd "$(dirname "$0")/.."
status=0
for html in arquitectura modelo-de-datos ciclo-de-vida-guia secuencia-consultas; do
  if [ ! -f "img/$html.png" ]; then
    echo "missing preview: img/$html.png"
    status=1
    continue
  fi
  recorded=$(awk -v f="$html.html" '$2 == f {print $1}' img/previews.sha256)
  current=$(shasum -a 256 "$html.html" | awk '{print $1}')
  if [ "$recorded" != "$current" ]; then
    echo "stale preview: img/$html.png (recapture it and update img/previews.sha256)"
    status=1
  fi
done
[ "$status" -eq 0 ] && echo "previews match their diagrams"
exit "$status"
