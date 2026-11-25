---
inclusion: fileMatch
fileMatchPattern: "prototype/pages/designs/**"
---

# Composing a design

A design is a page or flow built only from NDS components and ready sketches, with real interaction.

## Before building

1. Break the brief into parts and map each part to a catalogue component. Read the catalogue page for each one, including "when not to use".
2. Tell the designer the mapping in plain terms before building anything large, for example: "Page header, a filter panel on the left, results as cards, pagination underneath. The 'save search' toggle has no design system component: I'll use a secondary button for now, or I can sketch a toggle first."
3. Anything with no match is a **gap**. For each gap either:
   - use the closest NDS component (say which and why), or
   - stop and sketch the missing component first (`sketch.md`), make it ready, then use it.
   Never build the missing piece inside the design folder.

For a larger design or flow, use a spec: put the brief and acceptance criteria in `requirements.md`, the component mapping and gaps in `design.md`, and work through `tasks.md`. Show the designer only a short plain-English summary to confirm.

## Building

1. `npm run new:design -- name "One line description"`.
2. Work mobile first. Decide how the page works at 320 pixels wide before anything else: one column, the most important thing first, filters and secondary content collapsed or below. Then add columns for wider screens with the `Grid` breakpoint props (`cols={12} md={4}`).
3. Lay out with `Grid` and `GridItem`; start pages with `PageHeader` (and `Breadcrumbs` where the page has a parent). The workspace already provides the page container.
4. Interaction state lives in the design folder: React state, small hooks, example data in a `.ts` file. Use realistic NICE content.
5. Each step of a flow is another `*.page.tsx` file in the same folder, linked with normal links.
6. Make every state reachable in the preview: empty results, errors, success messages, loading. A reviewer should be able to click their way to each one.
7. A design should rarely need its own SCSS. If you are writing more than a few layout rules, you are probably building a component: move it to a sketch.
8. Forms: every field has a label; errors use the components' own `error` and `errorMessage` props; after submit, move focus to or announce the result.
9. Run `npm run check -- name` and fix everything. Look at the screenshots, starting with the smallest, in `.preview/screenshots/` yourself before saying it is done: passing checks do not prove it looks right.

## The full checks a design must pass

- Only allowed imports; no raw values; no inline styles; type-safe use of every component.
- Zero issues from the automated WCAG 2.2 A and AA scan, and zero best-practice findings.
- Every interactive element reachable with the Tab key.
- No sideways scrolling at 320, 400, 600, 900 and 1200 pixels wide.
- Styles written mobile first (no `$until` or `max-width` queries).
- Every control at least 24 by 24 pixels (WCAG 2.5.8). If a failure comes from inside an NDS component, tell the designer it is a design system issue rather than restyling it.
- No browser errors.
- Every sketch it uses is marked ready.

## Sharing

When the designer wants to share a design: run the full check, save the work, give the preview link and the screenshots, and list anything not yet in the design system. Sending screens to Figma is a separate, explicit request (`figma.md`): never do it as part of sharing.
