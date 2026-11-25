---
inclusion: manual
---

# Candidates from other NICE projects

Other NICE projects contain components that are not in the design system but could be. `sources.json` lists the projects (the website, next-web, and the global nav to begin with). `npm run candidates` scans each one from git and keeps a register in `candidates/<project>.md`, also shown at `/workspace/candidates`.

Read the register for the project in question before answering anything about candidates. It is long: read the section you need.

## Keeping the register fresh

`npm run candidates` fetches the latest of every project from git before it scans, and says which components are new and which have gone since the scan before. The team's view of each component is kept. Designers can do the same with "Scan again" on `/workspace/candidates`.

Each register records when it was scanned (`scannedAt`). If that is more than a week ago, scan again before answering a question about candidates, and mention anything new. If a project cannot be reached, the scan uses the copy fetched earlier and says so: pass that on.

## What the scan can and cannot tell you

For each component it records where it lives, what it builds on, how many places use it, and how tied it is to its project's data. From that it suggests "looks separable", "needs untangling" or "tied to the project".

That is a reading of the code, not a recommendation. A component can be perfectly separable and still not belong in a design system (a tracking snippet, a one-off layout). Whether it belongs is the team's decision, judged against the design system's criteria: unique, useful, usable, impactful, versatile, consistent, feasible and accessible.

## Requests and what to do

| They say | You do |
|---|---|
| "What in the website could go in the design system?" | `npm run candidates` to refresh, then summarise the "looks separable" group in plain terms: what each is, where it is used, what would need doing. Point them to `/workspace/candidates`. Do not list all 100 |
| "Put Testimonial forward" / "Rule out ProductCard" | `npm run candidates -- triage <Name> candidate` or `not-suitable`, with `--note` giving their reason. Ask for the reason if they did not give one |
| "Bring Testimonial in as a sketch" | Follow "Retrofitting" below |
| "Which of our sketches came from the website?" | The "Sketch" column of the register, or each sketch's `source` |
| "Make the workspace aware of another project" | A maintainer adds it to `sources.json`. Explain what is needed: its git address, branch, and where its components live |

## Retrofitting a component as a sketch

The aim is the same component, rebuilt to this workspace's rules, so it can go through the normal route to the design system. Never change the original project.

1. Read the component, its styles and its tests in `.sources/<project>/`. Also read one or two places that use it, to see which options are really needed.
2. Check the catalogue: if the design system already has this, or nearly, tell the designer and stop.
3. `npm run new:sketch -- <name> "Description"` (or `new:pattern` if it composes several components).
4. Set `"source": "<project>:<path>"` in its `sketch.json`, using the path exactly as the register gives it, for example `"next-web:components/Testimonial"`. Then file it: `npm run sketchbook -- add design-system-candidates <name>`. Every retrofitted component goes in the "Design system candidates" sketchbook, which also lists the candidates the team has put forward that are still waiting.
5. Rebuild it to the rules in `AGENTS.md`:
   - Keep the props and behaviour that are generic. Drop anything tied to the project: CMS field shapes, data feed types, routing, analytics attributes. Pass content in as plain props.
   - Replace project-only helpers and local colour or spacing files with nds-core tokens. A colour the design system has no alias for goes in the sketch's `_tokens.scss`.
   - Convert raw sizes and colours to tokens. Where a value is not on the design system's scale, use the nearest and tell the designer.
   - Rewrite desktop-first styles as mobile first.
   - Fix accessibility problems you find on the way; the original may not meet WCAG 2.2 AA.
6. Show every variant the original had in `demo.tsx`.
7. `npm run check -- <name>`, fix everything, and tell the designer what changed from the original and why. Log the significant changes as decisions.
8. `npm run log -- remember sketch <name> "Retrofitted from <project> ..."` with anything a later reader should know, such as which pages use the original.

After it has been through the hand-over and released, the original project can switch to the design system's version. That change is made by that project's team, not from here.
