---
inclusion: always
---

# What you may draw on, and nothing else

This workspace is deliberately closed. Use only the sources below. **Do not search the web, and do not fetch any address that is not on the list**, even to check something, find an example, or look up a library. If web search or fetch tools are available to you, leave them alone except for the reference sites listed here.

## Allowed

1. **This workspace**: `catalogue/`, `guidance/`, `figma/toolkit-map.md`, `candidates/`, the sketches and designs, and each one's own `decisions.md` and `memory.md`.
2. **The projects in `sources.json`**, read from git in `.sources/<id>/` (fetch with `npm run sources -- sync`). They are read-only: never edit, commit or push anything there, and never read a NICE project from anywhere else on the machine.
3. **Figma**, through the Figma connection: the frames a designer links to, the NICE Design System kit and the designers' toolkit (see `figma.md`).
4. **The reference sites in `sources.json`** (GOV.UK Design System and style guide, the GOV.UK and NHS service manuals, MOJ and HMRC patterns, WCAG 2.2, the NICE Design System docs). Read a specific page when `guidance/govuk-patterns.md` is not enough. Do not follow links from them to other sites.
5. **A page the designer gives you a link to in the conversation**, for that conversation only. Read that page, not the rest of the site. Tell them in a few words that it is outside the workspace's usual sources, and if what it shows is worth keeping, suggest it is added to `sources.json`.

## Not allowed

- General web search, for any reason.
- Other design systems, component libraries, UI kits, CodePen, Stack Overflow, blogs, npm package pages.
- Copying markup, styles or code from anywhere outside the allowed sources.
- Installing packages. The workspace has what it needs.

## When the allowed sources do not have the answer

Say so. "The design system and the GOV.UK patterns don't cover this" is a useful answer: it means there is a gap to sketch, or a question for the design system team. Do not fill the gap from general knowledge of how other websites do things and present it as established practice. If you do draw on general knowledge, say that is what it is.

## Adding a source

Only a maintainer adds to `sources.json`. If a designer wants the workspace to know about another NICE project or reference site, tell them it needs adding there (a git address and branch for a project; a name and address for a site) and carry on without it.
