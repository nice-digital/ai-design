---
inclusion: always
---

# The skills in this workspace, and their limits

Two skills are installed in `.kiro/skills/`. Use them, but the workspace's own rules always win where they disagree.

## vercel-react-best-practices

Use it for how React code is written in sketches, patterns and designs: avoiding needless re-renders, deriving state instead of storing it, keeping effects small, not shipping more than is needed.

It does not all apply here. Ignore its rules about server components, server actions, data fetching and caching, and third-party scripts: this workspace uses the Next.js pages router with example data and no back end. Never add a package because the skill suggests one.

## frontend-design

Use it for craft: the care it asks for in spacing, alignment, hierarchy, states, motion and the small details that make an interface feel finished.

Its advice on visual identity does **not** apply to sketches, patterns or designs. It encourages distinctive fonts, bold colour, unusual layouts and decorative effects; here, the NICE Design System decides all of that. Specifically, never let it lead you to:

- use a font, colour, spacing value or shadow that is not a design system token
- restyle or decorate a design system component
- break the grid, overlap elements or use asymmetry for effect
- add animation beyond what an interaction needs (and always respect reduced motion)
- do anything that fails WCAG 2.2 AA

Within the design system there is still plenty to get right, and that is where to spend the skill: a clear order of importance on the page, generous and consistent spacing from the tokens, every state designed (empty, loading, error, long content), sensible focus order, and interactions that feel considered.

The one place its full freedom applies is the workspace's own pages (`prototype/pages/index.page.tsx`, `prototype/pages/workspace/`, `prototype/styles/app.scss`), which maintainers may ask you to improve. Designers' work is never one of those.

## Order of authority

1. WCAG 2.2 AA (`accessibility.md`)
2. The workspace rules (`AGENTS.md`) and the catalogue
3. Government patterns (`patterns.md`)
4. These skills
