Generate article hero SVGs
=================================

This small CLI generates a simple article hero SVG from a title and optional subtitle.

Usage
-----

```bash
node scripts/generate-hero.js --title "Blueprint: Integrations" \
  --subtitle "Environment variables · runbooks" \
  --output public/images/articles/blueprint-hero.svg
```

Options
-------
- `--title` (required) — main title text
- `--subtitle` — optional subtitle text
- `--output` — output path (defaults to `public/images/articles/hero-generated.svg`)
- `--width`, `--height` — canvas size (defaults: 1200x675)
- `--accent1`, `--accent2` — gradient colors

Notes
-----
- The script escapes XML entities and will create the output directory if needed.
- If you want PNG fallbacks, run the existing `scripts/generate-diagrams.sh` or convert the SVG with `rsvg-convert` / `convert`.
