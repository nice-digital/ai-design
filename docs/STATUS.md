# Project status and findings

Where the NICE design workspace stands, what was learned building it, and what to do next. Last updated 19 November 2026. `README.md` explains how to use the workspace; this file is for whoever picks the project up.

## What this is

A workspace that lets NICE UX designers build interactive designs in code by describing them to an AI agent, within the NICE Design System (NDS), with automated checks as the guard rail.

Decisions that shaped it, all made by the project owner:

- **Designers use Kiro**, not Claude. Rules live in tool-neutral `AGENTS.md` plus `.kiro/steering/`.
- **The designers are not coders.** Plain English in, a preview link out. The agent does everything technical.
- **Code is the design medium**, because the interactions wanted cannot be expressed in Figma. Figma is an input and, on request, a place to send screens.
- **Three kinds of work:** sketch (new component idea), design (page or flow from NDS), production-ready.
- **Nothing is released into the design system from here.** A finished component becomes a hand-over package (`sketches/<name>/handover/`) that a developer adds to the `nice-design-system` monorepo by hand.
- **Figma is never deleted from or changed, and nothing is sent to it automatically.** Sending is an explicit request with a confirmation, and only onto the one page the designer gives a link to. Libraries (the NICE Design System kit under "Your organisation", and the designers' own toolkit) are read-only.
- **WCAG 2.2 AA is a hard floor**, for sketches as well as designs. The agent refuses anything that would breach it and says why.
- **Mobile first**, enforced.
- **GOV.UK Design System patterns** govern how things behave and read; NDS governs what they are built from and how they look.
- **Decisions are logged and attributed by name**, kept small enough not to fill the agent's context.
- **Everything about a sketch or design lives in its own folder** (source, decisions, memory, session notes, hand-over package), so deleting the folder removes all of it. There is no memory kept anywhere else.
- **Other NICE projects are read from git, not from local folders**, through one register (`sources.json`) that can be extended. The first two are next-web and global-nav.
- **The agent may not search the internet.** It draws only on the workspace, the projects and reference sites in `sources.json`, and Figma.
- The owner likes the coding style: build on NDS components, and use nds-core tokens, mixins and utilities wherever possible.

## What exists and has been verified

Verified on the development machine (Linux, Node 22) unless stated.

| Part | Where | Verified how |
|---|---|---|
| Preview app (Next.js 15.5.29, pages router, React 18, same shape as `next-web`) | `prototype/` | Pages load; screenshots reviewed |
| Catalogue of all 32 NDS components, tokens, 51 icons | `catalogue/`, built by `scripts/build-catalogue.ts` | Generated from `@nice-digital/design-system` 5.6.1; 26 components have "when to use" guidance |
| The checks | `scripts/check.ts`, `tests/gates.spec.ts`, `.stylelintrc.json`, `.eslintrc.json` | A violation of every rule was planted and caught: raw colours, raw spacing, font sizes, inline styles, outside imports, wrong props, raw palette use, unlabelled field, low contrast, sideways scroll, not mobile first, small tap target, unready sketch used in a design |
| Scaffolding, delete, log, name commands | `scripts/new.ts`, `remove.ts`, `log.ts`, `who.ts` | Run end to end, including refusals |
| Hand-over package generator | `scripts/package.ts`, `jest.handover.config.js` | `sketches/character-count/handover/` is complete; its 13 tests pass here and under the real monorepo's Jest (run in a scratch copy, monorepo untouched) |
| Workspace pages (home, and "Checks, screens and decisions" per item) | `prototype/pages/index.page.tsx`, `prototype/pages/workspace/` | Screenshots reviewed at desktop and phone widths |
| Worked example | `sketches/character-count/`, `sketches/feedback-form/` (a pattern), `prototype/pages/designs/guidance-feedback/` | Pass all checks. Invented content, not from any NICE design |
| Patterns and sketchbooks | `"type": "pattern"` in `sketch.json`; `scripts/sketchbook.ts`; `/workspace/sketchbook/<id>` | Pattern composes a ready sketch and passes; a component sketch importing a sketch is rejected; rename works from the command and the page form |
| Sources register and candidate scan | `sources.json`, `scripts/sources.ts`, `scripts/candidates.ts`, `candidates/`, `/workspace/candidates` | All three projects fetched from git; 107 next-web and 18 global-nav components registered; triage kept across scans |
| Delete and "Scan again" buttons on the workspace pages | `prototype/pages/api/delete.api.ts`, `candidates.api.ts`; they run the same scripts Kiro runs (`runScript` in `prototype/lib/workspace.ts`) | Deleted a throwaway sketch and sketchbook from the pages; a sketch in use is refused; a request without the confirmation is rejected |
| "Design system candidates" sketchbook | id `design-system-candidates`; retrofitted sketches are filed there by `npm run candidates`; its page lists candidates put forward but not yet sketched | Page reviewed |
| "Made from" list | `partsOf` in `prototype/lib/workspace.ts`; shown on every item page and on pattern rows | Feedback form lists Alert and Button (linked to the design system docs) and Character count (linked to its sketch) |
| Per-item memory | `memory.md` in each folder, via `npm run log -- remember` | Run end to end |
| Skills | `.kiro/skills/frontend-design`, `.kiro/skills/vercel-react-best-practices`, scoped by `.kiro/steering/skills.md` | Copied in; **not run in Kiro** |
| Agent instructions | `AGENTS.md`, `.kiro/steering/` (13 files), `.kiro/hooks/` (2), `.kiro/settings/mcp.json` | Written; **not run in Kiro** |
| GOV.UK patterns guide | `guidance/govuk-patterns.md` | Written from memory with links to source pages; **needs review** |

## What has not been tested

These are the real unknowns. None could be tested from the development machine.

1. **Kiro itself.** Whether it loads `AGENTS.md` and the steering files, whether the hook file format is right (written from memory), and above all whether the agent follows the instructions: plain English, refusing WCAG breaches, logging decisions, starting the preview, confirming before Figma.
2. **Figma.** No Figma connection was available. Untested: reading frames, the library lookup tools, the write tools (which may not be enabled on the account), and the desktop-app connection (`figma-desktop` in `mcp.json`, address `http://127.0.0.1:3845/mcp` from memory).
3. **The Figma library map** (`figma/toolkit-map.md`) is an empty template. Neither the NICE Design System kit nor the designers' toolkit has been read.
4. **The hand-over package inside the monorepo.** Tests pass under its Jest; the docs page has not been built there, and no developer has followed `HANDOVER.md`.
5. **The route to `next-web`** (a draft pull request) is written up in `promote.md` only.
6. **Retrofitting a candidate as a sketch** (`.kiro/steering/candidates.md`) has not been tried on a real component. `Testimonial` from next-web is the obvious first one.
7. **Nothing scans on a schedule.** The candidate register is refreshed when someone presses "Scan again", asks Kiro, or Kiro notices it is over a week old. A scheduled scan would need a CI job that commits `candidates/`, which needs a shared repository first.
8. **The candidate scan's judgement** is tuned to next-web (data feeds, Storyblok). For global-nav it calls almost everything separable, which is not a useful signal there.
9. **The no-internet rule is an instruction, not a lock.** Kiro's web tools have not been switched off, and nothing was tested in Kiro.
10. **Sketches that define their own colour tokens** (`_tokens.scss`): the conversion in `package.ts` is untested.
11. **The work machine.** See "Known problems".

## Known problems

- **Work machine: the browser checks failed, then appeared to hang.** Cause not established. The code rules passed there. Since then the check logs each stage with timestamps and names the reason when the browser step cannot finish (missing test browser, page will not build, port in use, timeouts). Next step: run `npm run check -- --fast`, then `npm run preview` and open http://localhost:3000, then a full check, and read `.preview/browser-log.txt` if it fails. Suspects: the test browser not installed (`npx playwright install chromium`), fonts fetched from Google at first build being blocked by the network, or a leftover preview on port 3000.
- **Never run two previews of this project at once.** They share one build folder and corrupt each other; a check then reports that a page did not appear. A preview you started yourself is fine: the check reuses it.
- **`npm audit`: 60 findings, none critical.** The critical one (Next.js 14) was fixed by moving to 15.5.29. The rest come from `picomatch`, `minimatch` and `postcss` inside build and test tools and cannot be fixed without breaking changes. Next.js 16 was not tried because React 18 support was uncertain and NDS requires React 18 or lower.
- **Automated accessibility checks cover well under half of WCAG.** The agent is told not to claim more than "passes the automated checks".
- **The tap-target check does not model WCAG's spacing exception**, so it can flag a small control that technically passes.
- **Check results and screenshots are local** (`.preview/` is not committed). Decisions and session notes are committed.
- **Ten always-on steering files** load into every Kiro conversation. If context becomes a problem, `designer-tasks.md`, `figma.md` and `skills.md` are the candidates to make on-demand.
- **The `nice-design-system` repository is private**, so `npm run sources -- sync nice-design-system` needs git access. Without it the catalogue keeps the guidance it already has.
- **Under heavy machine load the checks are slow** (type-checking alone took minutes when other jobs were running). That is the machine, not the project.
- **No commits yet.** The repository is initialised with everything untracked. The agent's "save this" and "go back" rely on git, so make a first commit before designers start.

## Findings about the other NICE repositories

Observed while building; none of these repositories was changed.

- **`nice-design-system`** (Lerna and npm workspaces, 32 component packages, a Next.js docs site):
  - Nothing enforces its own rules: stylelint is configured but not installed; `lint:js` targets only `.js`, so no TypeScript is linted; no rule bans raw values (68 raw `px` uses exist).
  - No Storybook, no visual regression, no automated accessibility tests; tests are mostly snapshots.
  - No component generator: adding one means copying a package and hand-editing root `tsconfig.json`, `components/design-system/package.json`, `components/design-system/scss/nice-design-system.scss`, `docs/data/components.ts`, a docs MDX page and a docs example.
  - `jest.setup.ts` imports `@testing-library/jest-dom/extend-expect`, but the installed jest-dom is 6.9.1, which no longer has it. In a scratch copy the tests would not start until that line was removed, so `npm test` may be broken on the current branch.
  - Stale details: README says Node 22 while `.nvmrc` says 24; `nds-core`'s `style` entry points at a file that does not exist; accordion is missing from the SCSS bundle; docs use a `<Tag live>` prop that does not exist; React 19 support sits on an unmerged branch.
  - It was on branch `PARS-9-migrate-design-system-to-private-access-repository`: publishing is moving to AWS CodeArtifact. Once the packages are private, every machine and CI job running `npm install` here needs registry credentials.
  - No Figma linkage in code (no Code Connect, no token export) apart from a manual icon export from `NICE Icons.fig`.
- **`next-web`** is on Next.js 14.2.35, which carries the critical advisories fixed here by upgrading. It is a public site: worth raising with its team.
- **`next-web/web/src/components/`** holds about 25 local components that are candidates for NDS (`Testimonial`, `Toggle`, `PromoBox`, `ProductCard` and others).
- No NICE repository had any AI agent configuration before this project.

## Figma facts established

From Figma's documentation in November 2026; check them again before relying on them.

- The online connection (`https://mcp.figma.com/mcp`) can read and, where enabled, write. The desktop-app connection is read-only and reads the current selection.
- Write tools (`use_figma`, `generate_figma_design`) have been feature-flagged per account and are not available on Figma for Government.
- Dev or Full seats get workable read limits; View and Collab seats are capped at a handful of calls a month.
- The "never delete, never change" rules are instructions to the agent, not a technical lock. For a hard guarantee, give the account Kiro signs in with view-only access to library files.

## What to do next

In order:

1. **Get the checks passing on the work machine** (see "Known problems"), then make the first commit.
2. **One real Kiro session with a designer.** Check that it loads the rules ("What rules are you following in this workspace?"), asks their name, speaks plainly, logs a decision, and refuses a WCAG breach. Note where it goes wrong and adjust the steering files.
3. **Connect Figma, list the tools it exposes, and fill in `figma/toolkit-map.md`** from the kit and the toolkit.
4. **Have a design system developer follow `sketches/character-count/handover/HANDOVER.md`** and report what was wrong or missing.
5. **Review `guidance/govuk-patterns.md`** against the live GOV.UK pages.
6. Then, as wanted: a sign-off step before a sketch becomes "ready" (today any designer can promote their own); shareable preview links (previews only run on the designer's own machine); screenshot comparison between saves; a Figma library generated from the coded components (only if the write tools exist; start with tokens and three or four components).

Ideas considered and set aside: a separate UI for running checks (the chat is the interface; the workspace pages show results); publishing or alpha-releasing components from the workspace (rejected in favour of the hand-over package).

## Getting it onto another machine

There are no commits and no remote, so the project has been moved as zips and patches, kept in `~/projects/files/` on the development machine. The numbered zips are cumulative; the latest is the one to use. After unzipping:

```sh
npm install
npx playwright install chromium
npm run check
```

Once the project is in a shared git repository, the zips and patches can be forgotten.

## How to resume with an AI assistant

Point it at this file, `README.md` and `AGENTS.md`. The scripts in `scripts/` are commented at the top with what they do and why. To prove a change to a rule, plant a violation in a throwaway sketch (`npm run new:sketch -- zz-test "x"`), run `npm run check -- zz-test`, then `npm run remove -- sketch zz-test --yes`.
