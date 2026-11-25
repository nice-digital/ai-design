# Character count: hand-over to the NICE Design System

Candidate component `@nice-digital/nds-character-count`, built in the design workspace from the sketch `sketches/character-count`.

- What it is: Text area that tells people how many characters they have left
- Figma: none recorded
- Used in designs: guidance-feedback
- Built against: `@nice-digital/design-system` 5.6.1
- Builds on: `@nice-digital/nds-textarea`

This folder was verified in the design workspace: type check, style rules, and the tests in
`components/nds-character-count/src` run with the design system's Jest setup. It has not been built or
tested inside the monorepo. Adding it is a manual step for a design system developer.

## Decisions made while designing it

- Going over the limit shows an error but never blocks typing (Example Designer, 2026-11-18). Why: Blocking is confusing for people pasting text and for screen reader users

## 1. Copy the files

This folder mirrors the monorepo. From the root of `nice-design-system`, copy:

| From this folder | To |
|---|---|
| `components/nds-character-count/` | `components/nds-character-count/` |
| `docs/pages/components/character-count.mdx` | `docs/pages/components/character-count.mdx` |
| `docs/components/examples/CharacterCount.tsx` | `docs/components/examples/CharacterCount.tsx` |

## 2. Register the component (manual edits)

1. **Root `tsconfig.json`**, in `references`, after `nds-textarea` (it depends on it):

   ```json
   { "path": "./components/nds-character-count" },
   ```

2. **`components/design-system/package.json`**, in `dependencies`:

   ```json
   "@nice-digital/nds-character-count": "^0.1.0",
   ```

3. **`components/design-system/scss/nice-design-system.scss`**, in alphabetical order:

   ```scss
   @forward '@nice-digital/nds-character-count/scss/character-count';
   ```

4. **`docs/data/components.ts`**, in alphabetical order:

   ```ts
   {
   	title: "Character count",
   	slug: "character-count",
   	description: "Text area that tells people how many characters they have left"
   },
   ```

5. **`docs/package.json`**: add `"@nice-digital/nds-character-count"` to `dependencies` if the docs build cannot resolve it.

## 3. Build and test in the monorepo

```sh
npm install
npm test
npm run docs:dev   # then open /components/character-count
```

## 4. Things to review

- Naming of the component, its props and its classes against existing conventions.
- The version number (`0.1.0` is a placeholder; Lerna sets the real one on release).
- Whether dependency versions match the monorepo's current ones.
- Formatting: run Prettier and stylelint from the monorepo over the new files.
- The accessibility notes on the docs page, with a manual screen reader check.

## After release

Tell the design team the version it shipped in, so the workspace can switch its designs from the sketch to
the published package and the Figma toolkit can be updated.
