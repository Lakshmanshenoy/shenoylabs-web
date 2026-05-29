# 10/10 QA Checklist (No-Cost)

Run this before merge or publish.

## Content

- [ ] Frontmatter required fields are present.
- [ ] Cover images include coverAlt.
- [ ] Excerpts are substantial and not placeholder text.
- [ ] No heading-level jumps (for example h2 -> h4).
- [ ] All markdown/JSX images have alt text.

## Design Consistency

- [ ] Page uses a route environment class.
- [ ] Kicker/deck styles follow the contract.
- [ ] At least one strong section transition (spacing or chapter-rule).
- [ ] Identity motif is present but not overused.

## Accessibility

- [ ] Keyboard tab flow reaches all interactive controls.
- [ ] Focus ring is clearly visible in light and dark themes.
- [ ] Heading order is logical.
- [ ] Link text is understandable out of context.

## Performance and UX

- [ ] `bash scripts/checks.sh` passes.
- [ ] No client-only behavior is required for first meaningful render.
- [ ] Article pages remain smooth on mobile scrolling.
- [ ] No heavy media without explicit value.

## Internal Linking

- [ ] Each major page offers at least one meaningful onward path.
- [ ] Article and project index pages expose category/topic paths.
