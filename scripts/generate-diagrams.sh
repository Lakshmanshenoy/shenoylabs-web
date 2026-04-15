#!/usr/bin/env bash
set -euo pipefail

# Generate PNG fallbacks for SVG diagrams in public/blueprint-assets
SRC_DIR="public/blueprint-assets"
OUT_DIR="$SRC_DIR/png"
mkdir -p "$OUT_DIR"

for NAME in architecture integration-flow; do
  SVG="$SRC_DIR/${NAME}.svg"
  PNG="$OUT_DIR/${NAME}.png"
  if [ ! -f "$SVG" ]; then
    echo "Skipping $SVG (not found)"
    continue
  fi

  if command -v rsvg-convert >/dev/null 2>&1; then
    rsvg-convert -w 1200 -h 800 -o "$PNG" "$SVG"
  elif command -v convert >/dev/null 2>&1; then
    convert "$SVG" -resize 1200x800 "$PNG"
  else
    echo "Error: no SVG->PNG converter found. Install 'librsvg' (rsvg-convert) or ImageMagick (convert)."
    exit 1
  fi

  echo "Generated: $PNG"
done

echo "Done. PNGs are in $OUT_DIR"
