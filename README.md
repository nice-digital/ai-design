# NICE design workspace

A place for NICE UX designers to build interactive designs in code by describing them to an AI agent (Kiro), using only the NICE Design System. Automatic checks keep everything inside the design system's rules, and finished work has a route to production.

- **Designers:** read "How to ask" below. You do not need to read or write code.
- **Whoever sets up a machine:** read "Setting up".
- **Design system maintainers:** read "How it works".
- **Picking the project up:** read `docs/STATUS.md` for what is built, what is untested, known problems and next steps.

## How to ask

Open this folder in Kiro and type what you want in the chat panel, in plain English. Keep the preview (http://localhost:3000) open in a browser beside it. To use something from Figma, select the frame in Figma, right-click, choose "Copy link to selection", and paste the link into the chat.

There are three kinds of work:

| | What it is | Example request |
|---|---|---|
| **Sketch** | An idea for a new component or interaction that the design system does not have | "Sketch a toggle switch for turning email alerts on and off" |
| **Design** | A page or flow built from the design system, with working interaction | "Design a page listing diabetes guidance with filters for type and date. Here's my Figma frame: [link]" |
| **Production-ready** | A finished component packaged up for the design system team, or a finished design prepared for the website team | "The character count is ready for the design system" |

Other things you can say:

- "What does the design system have for showing a status?"
- "Make the filters start collapsed on mobile"
- "Add an error state for when the comment is too long"
- "Give me two options for the results layout so I can compare them"
- "Set this up as a prototype for user research. The tasks are..."
- "Is this accessible?"
- "Does this follow the design system?"
- "Write handover notes for the developers"
- "Save this" / "Share this" / "Go back to how it was before"
- "Send these screens to this page in Figma: [link to the page]" (make an empty page for it first; the agent only ever writes to the page you link)
- "Log that we decided to keep the filters open on desktop, because people use several at once"
- "What has been decided on this design so far?"
- "Does this follow the GOV.UK pattern for checking answers?"
- "Delete the toggle sketch" (the agent does it; you never need the file explorer). There is also a Delete button at the bottom of every sketch, design and sketchbook page in the workspace, with a confirmation step
- "Make a pattern for a search box with filters and a results summary"
- "Make a sketchbook called Form ideas and put the character count in it"
- "What in the website could go into the design system?"
- "Bring Testimonial in from the website as a sketch"
- "Remember that this page is for commissioners, not clinicians"

What to expect:

- The agent tells you what it built and gives you a link to look at. It should not show you code or ask technical questions. If it does, say "explain that without the technical detail".
- If you ask for something the design system cannot do (a custom colour, a restyled button), it will say so and suggest the nearest thing that is allowed, or offer to sketch a new component.
- Nothing goes to Figma unless you ask for it. When you do, the agent tells you which screens are going where and waits for your yes. It only ever adds to the one page you give it a link to, and asks for the link if you have not given one. It never deletes or changes anything in Figma, including things it added before.
- The agent follows GOV.UK Design System patterns for how forms, errors and confirmations should work, but builds them from NICE components. It will tell you when a pattern needs something the design system does not have.
- It can read the NICE Design System kit (under "Your organisation" in Figma) and your own toolkit, and never writes to either.
- Anything that would not meet WCAG 2.2 AA is refused, for sketches too. The agent says what it will not do, why (with the guideline it breaks) and what it can do instead.
- The agent asks your name the first time, so decisions can be attributed to you.
- Decisions are logged as you make them, with the reason. Open the workspace home page and choose "Checks, screens and decisions" on any item to see its original request, check results, screens at every width, decision log and a short note from each day someone worked on it.
- Deleting a sketch or design removes it from this project only. The agent shows you what will go and asks first. Everything about it (decisions, notes, hand-over package) is inside its own folder and goes with it.
- The agent does not search the internet. It draws only on the design system, the guidance in this project, the NICE projects and reference sites listed in `sources.json`, and Figma. If you paste a link, it will read that one page.
- Anything in a design that is not yet part of the design system is labelled, on the workspace home page and in what the agent tells you.
- "Production-ready" for a component means a package folder (inside the sketch, at `sketches/<name>/handover/`) containing the component, its tests, its documentation page and a list of steps. You pass that to a design system developer, who adds it to the design system by hand. The agent never changes the design system itself.

## Setting up

Once per machine, about 15 minutes. Needs: Kiro, Node.js 22 or later, git, and a Figma account with a Dev or Full seat.

1. **Get the workspace.** Clone this repository, then in a terminal in its folder:

   ```sh
   npm install
   npx playwright install chromium
   npm run check
   ```

   `npm run check` should finish with "All checks passed". If `npm install` cannot find `@nice-digital` packages, the machine needs access to NICE's package registry (AWS CodeArtifact): ask the platform team for the registry login command.

2. **Open the folder in Kiro** (File > Open Folder). Kiro reads `AGENTS.md` and `.kiro/steering/` automatically; you can see them under "Agent steering" in the Kiro panel. The two hooks appear under "Agent hooks": make sure both are switched on.

3. **Connect Figma.** The connection is already configured in `.kiro/settings/mcp.json`. In the Kiro panel open "MCP servers", find `figma`, and choose Connect (or Enable). A browser window opens: sign in with your work Figma account and choose "Allow access". The server should then show as connected with a list of tools.

   **Using the Figma desktop app instead.** The desktop app has its own local connection, which reads whatever you have selected in the app, so there is no link to paste. In the Figma desktop app, open a design file, switch to Dev Mode (Shift+D) and turn on "Enable desktop MCP server" in the inspect panel. Then in Kiro's MCP servers panel, enable `figma-desktop` and disable `figma`. It needs a Dev or Full seat on a paid plan, the app must be open while you work, and it can only read: sending screens back to Figma needs the `figma` (remote) connection.

   Alternatively install the Figma "power" from Kiro's Powers panel, which sets up the same connection. Use one or the other, not both.

4. **Let Kiro run the workspace commands without asking.** In Kiro's settings, add these to trusted commands: `npm run *`, `npx playwright *`, `git status`, `git add *`, `git commit *`, `git checkout -- *`. Without this, designers are asked to approve each command.

5. **Start the preview:** `npm run preview`, then open http://localhost:3000. (The agent will also start it when needed.)

6. **Try it.** In Kiro chat: "What can I make here?", then "Show me the guidance feedback example".

Optional: `npm run sources -- sync` fetches read-only copies of the other NICE projects from git, needed only for refreshing the catalogue's guidance and scanning for candidates. The design system repository is private, so that one needs git access.

### What connecting Figma gives you

- **Figma to code:** paste a link to a frame and the agent can see it, read its structure, text, spacing and variables, and rebuild it with design system components.
- **Your toolkit understood:** once `figma/toolkit-map.md` is filled in, frames built from the designers' toolkit map straight to the right coded components.
- **Toolkit audit:** the agent can compare the toolkit with the coded design system and list what matches, what differs and what is missing on either side.
- **Code to Figma** (if your Figma plan exposes the write tools): finished screens captured from the preview into a Figma file for comment. If not available, the agent gives you screenshots to drop in.

Limits: Figma applies daily limits to reads, higher on Dev and Full seats. The write tools are only on Figma's remote server and are not available on every plan or on Figma for Government.

## How it works

```
AGENTS.md                 Rules for any AI agent working here
.kiro/steering/           Kiro guidance: how to talk to designers, each kind of work, Figma, promotion
.kiro/hooks/              Run the checks on save; protect the rules
.kiro/settings/mcp.json   Figma connection
catalogue/                Generated reference of every NDS component, token and icon
guidance/govuk-patterns.md  GOV.UK (and NHS, MOJ, HMRC) patterns, and how to build each from NDS
figma/toolkit-map.md      The NICE Design System kit and the designers' toolkit mapped to NDS components
sketches/                 New component ideas (one folder each)
                          Each sketch folder also holds its decisions, memory, session notes and hand-over package
sources.json              The outside projects (from git) and reference sites the agent may draw on
candidates/               Register of components in other NICE projects that could join the design system
.kiro/skills/             frontend-design and vercel-react-best-practices, scoped by .kiro/steering/skills.md
prototype/                The preview app. Designs live in prototype/pages/designs/
scripts/                  check, catalogue and scaffolding scripts
tests/gates.spec.ts       Browser checks: screenshots, accessibility, keyboard
.github/workflows/        The same checks on every pull request
```

The rules are enforced by `npm run check`, not by trusting the agent:

| Check | Catches |
|---|---|
| Workspace rules (`scripts/check.ts`) | Imports from outside the design system, use of the raw colour palette, designs using sketches that are not ready, styles that are not mobile first (`$until`, `max-width`, hand-written breakpoints), missing files |
| Stylelint (`.stylelintrc.json`) | Hex, named or computed colours; raw spacing; `font-size` declarations; `!important`; ID selectors; non-BEM class names |
| ESLint (`.eslintrc.json`) | Inline styles, common accessibility mistakes in markup |
| TypeScript | Components used with props they do not have |
| Browser (`tests/gates.spec.ts`) | Accessibility failures (axe, WCAG 2.2 AA), controls that cannot be reached by keyboard, sideways scrolling at 320/400/600/900/1200px, browser errors. controls smaller than 24 by 24 pixels |

WCAG 2.2 A and AA failures fail everything, sketches included, and each problem names the criterion. Designs, and sketches marked `"status": "ready"`, also fail on axe's accessibility best-practice rules, which are only notes on a sketch.

The stack (Next.js 15 pages router, React 18, SCSS modules, `.page.tsx`) matches `next-web` so that designs port with little change.

### Decision log and session notes

Each sketch and design folder holds its own record, written by `npm run log` (the agent runs it):

- `decisions.md`: the latest 25 decisions, one line each (date, who, what, why). This is the only log the agent reads when it starts work, so it costs a few hundred words of context at most.
- `decisions-archive.md`: older decisions, moved automatically. Read only when someone asks about history.
- `memory.md`: up to 15 one-line background notes that are not decisions (who it is for, constraints, findings). Read with `decisions.md` at the start of work.
- `sessions/<date>-<who>.md`: one short note per person per day (asked for, what changed, still open), replaced on each save that day. Read only on request.

Entries have length limits and the command rejects anything longer. Full conversations are not stored. The files are plain text in the repository, so they travel with the design and show up in reviews. Names come from each designer's git user name.

### Patterns and sketchbooks

A sketch has a `type`: `component` (one building block) or `pattern` (composed from design system components and ready sketches). Patterns are created with `npm run new:pattern`, may import `@sketches/<name>`, and are listed separately on the home page. A pattern that uses sketches cannot be handed over until those sketches are in the design system.

A sketchbook is a named group of sketches. `sketches/sketchbooks.json` holds each sketchbook's id, name and description; which sketchbook a sketch is in is recorded in the sketch's own `sketch.json`. The id never changes, so renaming (by `npm run sketchbook -- rename`, by asking the agent, or with the form on the sketchbook's page) never breaks a link.

### Other projects, and what the agent may read

`sources.json` is the complete list of outside sources:

- **Projects** are read from git, not from folders that happen to be on the machine. `npm run sources -- sync` clones each one read-only into `.sources/` (not committed). To make the workspace aware of another project, add an entry with its git address, branch, and where its components live. Private projects need git access on the machine.
- **`npm run candidates`** scans the projects marked `candidates` for components that are not in the design system and writes a register per project to `candidates/`, shown at `/workspace/candidates`. It suggests how separable each one is from the code alone; the team records its own view with `triage`. A candidate is brought in by retrofitting it as a sketch (`.kiro/steering/candidates.md`), which records where it came from.
- **Reference sites** are the only web addresses the agent may read.

The no-internet rule is an instruction to the agent (`.kiro/steering/sources.md`). To enforce it technically as well, turn off Kiro's web search and web fetch tools for this workspace, or block outbound access at the network. Neither removes what the model already knows from training: the instruction tells it to say when it is drawing on general knowledge.

### The workspace pages

`/` lists every design, pattern and sketch (grouped by sketchbook) with its latest check result and latest decision, and links to the candidates register. `/workspace/design/<name>` and `/workspace/sketch/<name>` show the original request, the check result with problems in plain English, the screenshots at each width, the decision log and the session notes. Check results and screenshots come from `.preview/`, which is local to each machine: a colleague sees them after running the check themselves.

### Handing a component to the design system

`npm run package -- <name>` turns a ready sketch into `sketches/<name>/handover/`, laid out like the monorepo. It lives inside the sketch so that deleting the sketch removes it:

```
sketches/character-count/handover/
  HANDOVER.md                                   what to copy and the five manual registration edits
  components/nds-character-count/               package.json, tsconfig.json, README.md, src/, scss/
  docs/pages/components/character-count.mdx     docs page
  docs/components/examples/CharacterCount.tsx   live examples for the docs page
```

The component source, SCSS and package files are converted from the sketch automatically (CSS modules become the design system's global BEM classes). The agent writes the tests, README, docs page and examples. The command then verifies the package: no unfinished sections, type check, style rules, and the tests run with the same Jest setup as the monorepo (`jest.handover.config.js`). A developer copies the folders in and follows `HANDOVER.md`. `sketches/character-count/handover/` is a complete example.

### Maintaining

- **New design system release:** `npm install @nice-digital/design-system@latest`, then `npm run sources -- sync nice-design-system` and `npm run catalogue` (which adds the usage guidance from the design system docs in git), then `npm run check`.
- **Changing a rule:** edit the lint config or `scripts/check.ts`, and the matching sentence in `AGENTS.md`. Plant a violation to prove the rule fires.
- **Not included yet:** the NICE header and footer (`@nice-digital/global-nav`), and visual comparison of screenshots between versions.
