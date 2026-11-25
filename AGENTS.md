# NICE design workspace: rules for AI agents

This workspace lets NICE UX designers build interactive designs in code, using an AI agent, from the NICE Design System (NDS). The designers are not developers. You do all the technical work; they describe what they want and look at the result.

Read `.kiro/steering/talking-to-designers.md` before replying to anyone. It governs how you communicate.

## The three kinds of work

| | Sketch | Design | Production-ready |
|---|---|---|---|
| What | A new component or interaction idea | A page or flow, composed from NDS | A component entering NDS, or a design entering a product |
| Where | `sketches/<name>/` | `prototype/pages/designs/<name>/` | A package in `sketches/<name>/handover/` for the design system team, or a draft pull request on `next-web` |
| Rules | Tokens only, type-safe, WCAG 2.2 AA, keyboard-only use, mobile first | Everything for sketches, plus NDS-only building blocks and accessibility best-practice rules | Full NDS conventions, tests and docs, then a human review |
| Detail | `.kiro/steering/sketch.md` | `.kiro/steering/compose.md` | `.kiro/steering/promote.md` |

A sketch is either a **component** (one building block) or a **pattern** (a larger piece composed from design system components and ready sketches, for reuse across designs). Related sketches can be grouped in a named **sketchbook**.

Everything about a sketch or design lives in its own folder: source, decisions, memory, session notes and, for a sketch, its hand-over package. Deleting the folder removes all of it. Never keep anything about one anywhere else.

Work moves left to right. This workspace never releases code into the design system: it produces a package that a design system developer adds to the monorepo by hand. A sketch must be marked ready before a design can use it. A design that still uses sketches cannot go to production: the sketches must be promoted into NDS first.

## Rules that always apply

1. **Use only the approved sources.** No web search. Draw only on this workspace, the git projects and reference sites in `sources.json`, and Figma (see `.kiro/steering/sources.md`).
2. **Know what has been decided.** When you start work on a sketch or design, read its `decisions.md` and `memory.md` first (see `.kiro/steering/decisions.md`). Log new decisions as they are made.
3. **Design from the catalogue.** `catalogue/index.md` lists every NDS component; `catalogue/components/<name>.md` has its guidance and exact props; `catalogue/tokens.md` has every colour, space, text size and breakpoint; `catalogue/icons.md` has every icon. Read the relevant pages before building. If it is not in the catalogue, it does not exist.
4. **Never invent inside a design.** If a design needs something NDS does not have, say so (a "gap"), and either use the closest NDS component or sketch a new component first. Do not build one-off UI inside a design folder.
5. **No raw values.** No hex, rgb or named colours; no px, rem or em for spacing; no `font-size` declarations; no inline `style`. Use `colours.$...`, `utils.rem(spacing.$...)`, `@include typography.font-size(n)` and the other nds-core helpers.
6. **Do not restyle NDS components.** No overriding their classes, no importing their SCSS, no wrapping them to change how they look. If a component does not do what is needed, that is a gap.
7. **Use components as documented.** Follow the "when to use" and "when not to use" guidance in the catalogue, not just the props.
8. **WCAG 2.2 AA is the floor, for sketches and designs alike.** Refuse anything that would not meet it, say why with the criterion, and offer what would (see `.kiro/steering/accessibility.md`). Semantic HTML, a logical heading order, labels on every field, everything usable by keyboard, state changes announced. Follow the patterns in existing NDS components.
9. **Follow government patterns for how things work.** For forms, flows, errors, confirmations and wording, follow `guidance/govuk-patterns.md`: take the pattern from the GOV.UK Design System, build it from NDS. Never import or imitate GOV.UK's components or look.
10. **NICE content style.** Plain English, sentence case, no emoji, no exclamation marks, no Latin abbreviations. Use realistic NICE content, never lorem ipsum.
11. **Mobile first.** Design and style the smallest screen (320 pixels wide) first, with no media query, then add to it for wider screens with `@include media-queries.mq($from: ...)` and the `Grid` breakpoint props. Never use `mq($until: ...)`, `max-width` queries or hand-written breakpoints. Controls must be at least 24 by 24 pixels.
12. **Never delete or change anything in Figma.** Figma files are shared with other people. Read from Figma freely, including the NICE Design System kit and the designers' toolkit; add to it only when the designer explicitly asks, and then only as new content on the one page they give a link to in that request. No page link, no writing: ask for it. Libraries are never written to (see `.kiro/steering/figma.md`).
13. **Nothing is finished until `npm run check` passes.** Fix every problem it reports. Never weaken, skip or work around a check.
14. **Floating content must not depend on stacking.** The design system has no layers, so never use `z-index` and never rely on one element painting over another. A menu, list or suggestion box opens in the normal flow of the page and pushes content down, or uses the browser's top layer. Always show it open in the demo with other content below it, and look at the screenshot before calling it done. If it cannot be built that way, it is a gap for the design system team.

## Files you must not change

- `catalogue/` (generated by `npm run catalogue`)
- `.eslintrc.json`, `.stylelintrc.json`, `playwright.config.ts`, `jest.handover.config.js`, `tests/`, `scripts/`, `.github/`
- In `sketches/<name>/handover/`: `HANDOVER.md`, `package.json`, `tsconfig.json`, the component source and its SCSS (regenerated from the sketch by `npm run package`)
- `prototype/` outside `prototype/pages/designs/`
- `AGENTS.md`, `.kiro/`, `guidance/`, `sources.json`, `figma/toolkit-map.md` (unless a design system maintainer asks)
- `.sources/` (read-only copies of other projects) and `candidates/` (written only by `npm run candidates`)
- `sketches/sketchbooks.json`: only through `npm run sketchbook`
- `decisions.md`, `decisions-archive.md`, `memory.md` and `sessions/` in any sketch or design: only through `npm run log` (lines may be deleted from `memory.md` by hand)

If a rule seems wrong for a real design need, tell the designer in plain terms that it needs a decision from the design system team. Do not change the rule.

## Commands

| Command | What it does |
|---|---|
| `npm run preview` | Starts the preview at http://localhost:3000 (leave it running) |
| `npm run new:sketch -- name "Description"` | Creates `sketches/name/` from the standard template |
| `npm run new:pattern -- name "Description"` | Creates a pattern in `sketches/name/`: like a sketch, but it may compose ready sketches |
| `npm run new:design -- name "Description"` | Creates `prototype/pages/designs/name/` from the standard template |
| `npm run check` | Runs every gate on everything. Report in `.preview/check-report.json`, screenshots in `.preview/screenshots/` |
| `npm run check -- name` | Checks one sketch or design |
| `npm run check -- --fast` | Code rules only, no browser. Use while iterating; always finish with a full check |
| `npm run package -- name` | Builds and verifies the hand-over package for a ready sketch in `sketches/name/handover/` (see `.kiro/steering/promote.md`) |
| `npm run log -- decision design name "What" --why "Why"` | Adds a line to the decision log (`sketch` for a sketch). `npm run log -- session ...` writes the day's session note |
| `npm run log -- remember design name "Background"` | Adds a line to that item's `memory.md` |
| `npm run sketchbook -- list` | Sketchbooks: `create "Name"`, `rename <id> "New"`, `add <id> <sketch>...`, `take <sketch>`, `delete <id>` |
| `npm run sources` | Lists the outside projects and reference sites. `npm run sources -- sync` fetches the projects from git into `.sources/` |
| `npm run candidates` | Fetches the latest of those projects from git and scans them for design system candidates, reporting what is new or gone. `-- triage <Name> candidate\|not-suitable --note "Why"` records the team's view |
| `npm run who` | Says who is working here. `npm run who -- "Name"` sets it. Used to attribute log entries |
| `npm run remove -- sketch name` | Shows what deleting a sketch (or `design name`) would remove. Add `--yes` to delete. Only ever touches this project's files, never Figma |
| `npm run catalogue` | Rebuilds the catalogue after the design system version changes |

Always create sketches and designs with the `new:` commands. Names are lowercase with hyphens.

## How things are built here

Coding style: build on NDS components first, and reach for `nds-core` (tokens, typography, focus, media-query and layout mixins, `utils.rem`) and the design system's utility classes before writing anything of your own. New SCSS should read like the design system's own.

Stack: Next.js 15 (pages router, files end `.page.tsx`), React 18, TypeScript, SCSS modules. This matches `next-web`, NICE's main website, so designs can move to production with little change.

Sketch (`sketches/character-count/` is a worked example):

- `Name.tsx`: `React.FC<NameProps>`, exported `NameProps` interface with a JSDoc comment on every prop, `data-component="name"` on the root element, extra props passed through.
- `Name.module.scss`: BEM class names (`block`, `block__element`, `block--modifier`), nds-core modules via `@use`, properties in alphabetical order.
- `demo.tsx`: shows every variant and state.
- `sketch.json`: `title`, `description`, `type` (`component` or `pattern`), `status` (`sketch` or `ready`), `figma` (link to the source frame, if any), `prompt` (the designer's original request), `source` (`project:path` if it was retrofitted from another project), `sketchbook` (id of its sketchbook, if any).
- A pattern may also import ready sketches as `@sketches/<name>`. A component sketch may not.
- `decisions.md`, `memory.md` and `sessions/`: the decision log, background notes and session notes, written by `npm run log`.
- `handover/`: its hand-over package, once made by `npm run package`.
- New colours: only in `_tokens.scss` in the sketch folder, as named alias tokens mapped to the nds-core palette, the same way nds-core's own `_alias.scss` works.
- Build on existing NDS components wherever possible (the example wraps `Textarea`).

Design (`prototype/pages/designs/guidance-feedback/` is a worked example):

- `index.page.tsx`: the page. Further steps of a flow are extra `*.page.tsx` files in the same folder.
- Other `.ts`/`.tsx` files in the folder: example data, state and hooks for the interaction.
- `design.json`: `title`, `description`, `figma`, `prompt`.
- `decisions.md`, `memory.md` and `sessions/`: the decision log, background notes and session notes.
- Imports allowed: `react`, `next/*`, `classnames`, `@nice-digital/*`, `@sketches/<name>`, and `./` files.
- Layout uses `Grid` and `GridItem`. A design should rarely need its own SCSS.

## Figma

See `.kiro/steering/figma.md`. Figma is where designers bring references from and, when they ask, where screens go for comment. Two read-only libraries describe the design system there: the NICE Design System kit (under "Your organisation") and the designers' own toolkit. Both are mapped to NDS components in `figma/toolkit-map.md`.
