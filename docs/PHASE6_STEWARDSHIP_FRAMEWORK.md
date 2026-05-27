# Phase 6 Stewardship Framework

Phase 6 shifts this codebase from implementation velocity to long-term stewardship.

## Permanent Filters

Before adding code, UI, or content, verify it improves at least one of:
- inquiry depth
- reflective pacing
- ecosystem continuity
- conceptual coherence
- intellectual calmness

If it does not, do not merge it.

## Stewardship Practices

1. Publish slowly
- Prefer fewer investigations with stronger reasoning.
- Revisit prior frameworks before introducing new conceptual surfaces.

2. Preserve canon quality
- Canonical texts should remain clear and accessible.
- Add references to canonical work only when conceptually necessary.

3. Protect atmospheric restraint
- Reduce link density and visual prompts when unsure.
- Keep silence and negative space as intentional design tools.

4. Maintain temporal continuity
- Use `temporal_callbacks` to represent genuine conceptual evolution.
- Avoid chronology for its own sake; prefer meaningful historical links.

5. Keep engineering minimal
- Favor compile-time signals and static rendering.
- Remove brittle abstractions and redundant UI before adding anything new.

## Validation Support

The repository includes `scripts/validate-stewardship.mjs` and executes it from `scripts/checks.sh`.
It enforces baseline metadata and anti-noise thresholds for investigations.
