# Editorial Identity Contract

This file defines the non-negotiable presentation contract for Shenoy Labs.
Use it to keep every new page and article aligned with the site's voice.

## 1) Visual Voice

- One signature motif only: the amber identity pip.
- Kicker text uses the `editorial-kicker` class.
- Intro/deck text uses the `editorial-deck` class.
- Avoid stacking multiple decorative styles in the same block.

## 2) Route Environments

- Home: `env-home`
- Articles: `env-article`
- Projects: `env-projects`
- About: `env-about`
- Support: `env-support`

Every top-level route should pick one environment class at the page container level.

## 3) Chapter Openers

Use `ChapterOpener` for section-leading pages.
Each opener must have:

- a short kicker (1-3 words)
- a clear title line
- a calm explanatory deck
- optional links for onward navigation

## 4) Editorial Rhythm

- Prefer chapter transitions over dense dividers.
- Use `chapter-rule` when you need a transition line.
- Body copy should prioritize readability over compactness.

## 5) Investigation Blocks (MDX)

Long-form articles should use these components when relevant:

- `<Investigation title="...">` for deep-dive sections
- `<Evidence title="...">` for sourced support
- `<Timeline>` for chronological progression
- `<Takeaway>` for concise synthesis

## 6) Accessibility Baseline

- Interactive controls must remain keyboard-visible with `:focus-visible`.
- Every image requires meaningful alt text.
- Heading hierarchy should not skip levels.

## 7) Zero-Cost Constraint

- No paid tooling required.
- Keep quality through automation (`checks.sh` + content quality validation).
