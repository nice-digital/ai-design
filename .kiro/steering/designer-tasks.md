---
inclusion: always
---

# What designers ask for, and how to handle it

Use this to recognise the job and pick the approach. All of it happens within the rules in `AGENTS.md`.

## Making things

| Request | Approach |
|---|---|
| A new page (landing page, guidance overview, topic page, news article, corporate content page) | Design. Start from `PageHeader`, `Breadcrumbs`, `Grid`; long-form content uses `InPageNav` or `StackedNav`; related items use `Card` |
| A listing or search page (guidance list, indicators, consultations, search results) | Design. `FilterPanel` + `FilterSummary` + `Card` or `Table` + `EnhancedPagination`. Make filtering, sorting, empty results and "clear filters" all work |
| A form or transactional flow (commenting on a consultation, registering as a stakeholder, feedback, sign up, contact) | Design with one page per step. `FormGroup`, `Input`, `Textarea`, `Radio`, `Checkbox`, `Button`. Include validation errors, an error summary, a check-your-answers step and a confirmation |
| An interactive tool (decision aid, calculator, visual summary, recommendation finder, comparison) | Usually needs a sketch for the new interaction, then a design around it. Agree the behaviour in words before building |
| A data-heavy view (evidence tables, indicator data, appraisal timelines, dashboards) | `Table` first. Charts and anything beyond a table are gaps: sketch them, with a table alternative for accessibility |
| A new component | Sketch (`sketch.md`) |
| A pattern: several components arranged to do one job, for reuse | `npm run new:pattern`. See "Patterns made in this workspace" in `patterns.md` |
| "Group these sketches" / "Make a sketchbook for form ideas" / "Rename the sketchbook" | `npm run sketchbook -- create "Name"`, `add <id> <sketch>...`, `rename <id> "New name"`. A sketch is in one sketchbook at a time. They can also rename one themselves on its page in the workspace |
| A new variant of an existing NDS component | It is a gap in NDS. Sketch it as a separate component that wraps or sits beside the original; never restyle the original |
| A content block for the website's CMS (Storyblok): promo box, spotlight, testimonial, card grid, callout | Sketch the block, then a design showing it in a realistic page, with short, long and missing content |
| Service-phase or status messaging (alpha/beta banners, consultation open/closed, guidance updated or withdrawn) | Design. `PhaseBanner`, `Tag`, `Alert`, `Panel`. Follow the catalogue's guidance on which to use |
| Navigation and wayfinding (in-page navigation, A to Z, previous/next, tabs, section menus) | Design using `InPageNav`, `HorizontalNav`, `StackedNav`, `Tabs`, `AZList`, `Alphabet`, `PrevNext`, `SimplePagination`. Site header and footer are out of scope (global nav) |

## Working from something that exists

| Request | Approach |
|---|---|
| "Build this Figma frame" | Read the frame (`figma.md`), map each part to NDS using `figma/toolkit-map.md`, report gaps, then build as a design |
| "Recreate this page from the live site so I can change it" | Read that page's source in `.sources/next-web/` (fetch it with `npm run sources -- sync next-web`) for structure and content; otherwise work from a screenshot or the designer's description. Rebuild with NDS only, then make the change |
| "Redesign / improve this page" | Recreate the current version as one page and the proposal as another in the same design folder, so they can be compared |
| "Make a mobile / tablet version" | There is one responsive design, not separate versions. Fix the layout at each breakpoint and show the screenshots |
| "Change the wording" | Edit the content directly, in NICE style |

## Testing and deciding

| Request | Approach |
|---|---|
| A prototype for user research | Design with realistic content and every path a participant might take working. Add a start page listing the tasks if asked. No dead links: unbuilt routes go to a "not part of this prototype" page |
| Two or three options to compare (A/B) | Separate pages in one design folder (`option-a.page.tsx`, `option-b.page.tsx`) with an index page linking to each and a one-line note on how they differ |
| A demo for stakeholders | As for research, plus a short written walkthrough of what to click and what it shows |
| "Is this accessible?" / an accessibility review | Run the full check, then review what automation cannot see: heading order, link text out of context, focus order, error wording, announcements, zoom to 400%, reduced motion. Report findings as a short plain-English list, most serious first, and offer to fix them |
| "Does this follow the design system?" / a design review | Run the check, then compare each component's use with its catalogue guidance ("when not to use"). List departures and gaps |
| "What should I use for...?" | Answer from the catalogue with the reasons, and show a quick example in the preview if useful |

## Handing over and maintaining

| Request | Approach |
|---|---|
| Notes for developers / a handover | Write a short document in the design folder: purpose, components used, behaviour of each interaction, states, content rules, accessibility notes, and anything not yet in NDS. Plain English, no code needed |
| "What in the website could go into the design system?" / "Bring Testimonial in from the website" | Read `candidates.md` and follow it |
| "Remember that this is for..." | `npm run log -- remember` (see `decisions.md`) |
| "This is ready for the design system" | `promote.md` route A: a hand-over package for a developer to add to the monorepo |
| "This is ready for the website" | `promote.md` route B |
| Usage guidance for a new component | Write "when to use", "when not to use", "how to use" and accessibility notes in the same form as the catalogue pages. It goes with the component when promoted |
| Check the Figma toolkit against the coded design system | `figma.md`, "Toolkit audit" |
| A new icon | Icons come from `@nice-digital/icons` only. A new one is a request to the design system team, drawn in the NICE Icons Figma file; use the closest existing icon meanwhile |
| Annotated screens for a document or slide deck | Run the check and point them to the screenshots in `.preview/screenshots/`, or add the screens to Figma for annotation |

## Things to decline or redirect

- Anything in the site header or footer: that is the global nav product, not this workspace.
- Brand work, illustration, marketing graphics, print and PDF layout: not design system work. Figma is the right tool.
- Real personal or patient data in a prototype: use invented examples only.
- Connecting a prototype to live services or logins: prototypes use example data. Real integration happens after promotion, by the product team.
- Changing the rules or the checks: needs the design system team.
