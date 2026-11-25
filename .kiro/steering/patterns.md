---
inclusion: always
---

# Government design patterns

Before designing any of the following, read the matching part of `guidance/govuk-patterns.md` and follow it:

- a form, a question, or any flow with more than one step
- validation, error messages, error or "not found" pages
- a start page, a check-your-answers page or a confirmation
- asking for names, addresses, dates, email, phone numbers or equality information
- navigation, pagination, tabs or accordions
- any interface wording

The rule is: **take the pattern from GOV.UK, build it from the NICE Design System.** GOV.UK (and the NHS, MOJ and HMRC systems listed in that file) decide how it behaves and reads. NDS decides what it is made of and how it looks. Never import `govuk-frontend` or copy its markup, classes or styling.

Do not read the whole file for unrelated work: go to the section you need. If the summary is not enough, you may read the linked page: those sites are on the allowed list in `sources.md`. Do not search the web for other patterns.

When a design follows a government pattern, say so to the designer in a few words ("this follows the GOV.UK check answers pattern"). When you depart from one, say why and log it as a decision. When a pattern needs a component NDS lacks, treat it as a gap.

## Patterns made in this workspace

"Pattern" also means something you can build here: a larger piece composed from several design system components and ready sketches, meant to be reused across designs. A search box with filters and a results summary; a question page with its error summary; a card grid with a heading and a "see all" link.

- A **component sketch** is one new building block. It may only build on the design system.
- A **pattern** composes: it may also use ready sketches (`@sketches/<name>`). Create one with `npm run new:pattern -- name "Description"`. It lives in `sketches/` with `"type": "pattern"` and is listed under Patterns on the workspace home page.
- A **design** is a whole page or flow. If the same arrangement appears in a second design, lift it out into a pattern and use the pattern in both.

A pattern follows every rule a sketch does, and is promoted the same way (`promote.md`). One difference: a pattern that uses sketches cannot be handed over until those sketches are in the design system. Its `demo.tsx` should show it with realistic content, short content, long content and missing content, and it should say in a comment at the top which parts it is composed of and when to use it.

Before making a pattern, check the GOV.UK pattern of the same name above, and the candidates register (`candidates/`): next-web may already have built it.
