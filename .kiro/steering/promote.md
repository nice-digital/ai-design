---
inclusion: manual
---

# Promoting work to production

Nothing from this workspace is released by the agent. A component is handed to the design system team as a **package folder** that a developer adds to the monorepo by hand. A design is handed to the website team as a draft pull request. Explain either to the designer as: "I've prepared it for the design system team (or website team) to review."

## A. A sketch into the NICE Design System

You never touch the `nice-design-system` repository. You produce a `handover/` folder inside the sketch (`sketches/<name>/handover/`): the component package, its tests, its docs page and a `HANDOVER.md` listing the manual steps for the developer.

### 1. Is it ready?

- The sketch is `"status": "ready"` and passes `npm run check -- name`.
- It meets the design system's component criteria: unique (nothing in the catalogue does this), useful, usable, impactful, versatile (works in more than one place), consistent with NDS, feasible and accessible. If one clearly fails, tell the designer which and stop.
- It has been used in at least one design, or the designer can say where it will be used.

### 2. Generate the package

`npm run package -- name`

This converts the sketch to design system conventions automatically (CSS modules become global BEM classes in `scss/<name>.scss`; `package.json` and `tsconfig.json` are generated; a sketch's `_tokens.scss` becomes a list of alias tokens for the developer to add to nds-core). These files are regenerated every run: to change them, change the sketch and run the command again.

It also creates four templates, once, marked `TODO(handover)`, for you to complete:

| File | Write |
|---|---|
| `components/nds-<name>/src/<Name>.test.tsx` | Jest and React Testing Library tests, in the style of the design system's own. Behaviour, not snapshots: rendering, every variant, every interaction with `userEvent` including keyboard, accessible names and aria states, class name and extra props passed through. Only use `@testing-library/react`, `@testing-library/user-event`, `jest-dom` and `jest-extended`: nothing else is available in the monorepo |
| `components/nds-<name>/README.md` | Usage, one section per prop, SCSS and HTML usage |
| `docs/components/examples/<Name>.tsx` | One exported example per variant, importing from `@nice-digital/nds-<name>`. Element ids and names must be unique across examples |
| `docs/pages/components/<name>.mdx` | Introduction, "When to use", "When not to use", "How to use", each variant with React and HTML code, and accessibility notes. Be honest in the accessibility notes about what has only been checked automatically |

`sketches/character-count/handover/` is a complete worked example of all four.

### 3. Verify

Run `npm run package -- name` again. It checks that no template is unfinished, type-checks the package, applies the style rules, and runs the tests with the same Jest setup as the monorepo. Repeat until it says "Ready to hand over".

### 4. Hand over

- Save the work.
- Tell the designer the package is ready and where it is (`sketches/<name>/handover/`), and that a design system developer adds it by following `HANDOVER.md`. Offer a two-line summary they can send with it.
- If Figma write access is available and the designer asks, add the component to a page called "Proposals" in the file they name.
- After the design system team releases it: update this workspace to the new version, run `npm run catalogue`, replace `@sketches/<name>` imports with the published package, delete the sketch (its hand-over package goes with it), and add the mapping to `figma/toolkit-map.md`.

## B. A design into the website (`next-web`)

This route needs a working checkout of next-web that the designer's machine can push branches from, which is separate from the read-only copy in `.sources/` (never change that one). If there is not one, write handover notes in the design folder instead (see `designer-tasks.md`) and tell the designer a developer will need to build it from those.

### 1. Is it ready?

- It passes `npm run check -- name`.
- It uses **no sketches**. Any it uses must be promoted and released first (route A).
- The designer confirms the content and behaviour are signed off.

### 2. Port it

On a new branch in that checkout. Follow that repository's own agent and contribution guidance first. In outline:

- Pages live in `web/src/pages/` and end `.page.tsx`; shared pieces in `web/src/components/<Name>/` with `Name.tsx`, `Name.module.scss`, `Name.test.tsx`; imports use the `@/` alias.
- Replace example data with clearly marked placeholders and list in the pull request what real data each needs. Do not wire up data sources, CMS fields or analytics: the website team owns that.
- Add tests in the repository's existing style.

### 3. Hand over

Draft pull request with: the purpose, a link to the design in this workspace, screenshots, the interaction notes, the data each part needs, and accessibility notes. Tell the designer it is with the website team.
