---
inclusion: fileMatch
fileMatchPattern: "sketches/**"
---

# Sketching a component

A sketch is a new component or interaction that the design system does not have yet. It is allowed to be new. It is not allowed to ignore the design system's tokens, conventions or accessibility.

## Before building

1. Search `catalogue/index.md`. If an NDS component already does this, or does it with a different prop, use that and tell the designer. Do not duplicate.
2. Check `sketches/` for an existing sketch of the same idea.
3. Check the candidates register (`candidates/`): another NICE project may already have built it, in which case retrofit that (`candidates.md`) rather than starting again.
4. Check `figma/toolkit-map.md`: the designers' Figma toolkit may already have a version to match.
5. If there is a Figma frame, read it first (`figma.md`).

## Building

1. `npm run new:sketch -- name "One line description"`.
2. Build on NDS components where you can (wrap `Textarea`, `Button`, `Card`...) rather than starting from bare HTML.
3. Follow the conventions in `AGENTS.md` ("How things are built here"). `sketches/character-count/` is the reference.
4. Put every variant and state in `demo.tsx`: default, each variant, error, empty, long content.
5. Design the interaction for keyboard and screen reader from the start: real `button` and `a` elements, visible focus using `@include focus.default-focus-style`, `aria-expanded`/`aria-controls` on toggles, `aria-live` for changes that happen without a page load.
6. Style it mobile first: the base styles are for a 320 pixel screen, and `@include media-queries.mq($from: ...)` adds to them for wider screens. Make anything tappable at least 24 by 24 pixels.
7. Respect `prefers-reduced-motion` for any animation.
   Anything that opens over or under other content (a menu, list or suggestion box) follows rule 14 in `AGENTS.md`: no `z-index`, built in the normal flow, and shown open in the demo with content below it.
8. Run `npm run check -- name` and fix everything.

## What a sketch may and may not do

- May: introduce new structure, new behaviour, new alias colour tokens (in `_tokens.scss`, mapped to the nds-core palette).
- May not: use raw colours, raw spacing or font sizes; add npm packages; restyle an NDS component's own classes; fetch data from anywhere.

## Making a sketch ready (so designs can use it)

A sketch starts with `"status": "sketch"`. It must already meet WCAG 2.2 AA and the token rules. Designs can only use it once it is `"ready"`, which also turns accessibility best-practice findings from notes into failures.

1. Set `"status": "ready"` in `sketch.json`.
2. Run `npm run check -- name`. It now needs zero findings of any kind.
3. Fix everything. If it cannot pass, set the status back to `sketch` and tell the designer what is in the way.

Ready does not mean it is in the design system. Designs that use it are flagged as using a component that is not yet in the design system until it is promoted (`promote.md`).
