---
inclusion: always
---

# Decision log and session notes

Every sketch and design carries a short record of what was decided and why, so designers can pick up each other's work. It is kept deliberately small. Follow these rules exactly: they are what stops it filling your context.

## Who you are working with

Entries are attributed by name, so colleagues can see who decided what.

- At the start of a conversation, run `npm run who`. If it gives a name, use the person's first name naturally when you greet them, and now and then after that. Do not overdo it.
- If no name is set, ask once: "Before we start, what's your name? I'll use it to note who made each decision." Then run `npm run who -- "Their Name"`.
- If the person says they are someone else ("this is Priya, I'm on Sam's laptop"), run `npm run who` with their name before logging anything.
- The name is used only in the decision log and session notes. Do not ask for anything else about them.

## What to read, and when

- **When you start work on a sketch or design, read its `decisions.md` and its `memory.md`** (in its folder). Together they hold at most 40 one-line entries. Respect the decisions: do not undo one without raising it with the designer.
- **Do not read `decisions-archive.md` or anything in `sessions/`** unless the designer asks about history ("what did we decide about filters last month?", "what did Sam do on this?"). Then read only what the question needs.
- Do not read the logs of other sketches or designs unless asked.

## Logging a decision

**A decision is anything the designer tells you that changes how the design behaves or what people see, and that a colleague would otherwise have to guess.** It does not have to be phrased as a decision. An instruction is one too.

Log it when the designer:

- sets a default, a limit, an order or a rule ("make 'NICE guideline' the default option", "limit it to 300 characters", "newest first", "hide the filters on mobile")
- chooses between options, including ones you offered
- accepts or rejects a suggestion of yours that affects how it works
- departs from a design system or GOV.UK pattern
- says "log that..." or "we decided..."

Do not log:

- wording and content changes, unless the wording is itself a rule ("always call it 'guidance', never 'guidelines'")
- purely visual adjustments that follow from the design system anyway
- your own routine work (built the page, fixed a check)
- anything already logged

**If you are unsure, log it.** A slightly long log is better than a missing decision.

Every entry needs a reason. If the designer gave one, use it. If they did not and it is obvious from the conversation, write it yourself. If it is not obvious, ask in one short line as you carry on: "Done. Why that default, so I can note it?" Never hold up the work for the answer: if they do not say, log it with the reason "Designer's instruction, reason not given".

```
npm run log -- decision design <name> "What was decided" --why "The reason"
```

(`sketch` in place of `design` for a sketch.)

- One decision, one line: at most 160 characters, with a reason of at most 200. Write it so someone who was not there understands it.
- Log the decision, not the discussion. "Filters start collapsed on mobile", not "we talked about filters".
- Do not log routine work (built the page, fixed a check, changed wording) or things already obvious from the design.
- If a new decision replaces an old one, say so in the new line ("Replaces the 300 limit: ...").
- Never edit `decisions.md` by hand and never delete entries: the command keeps the newest 25 and archives the rest.
- Tell the designer in a few words that you logged it: "Noted in the decision log."

## Memory: things worth knowing that are not decisions

Each sketch and design also has a `memory.md` for background a colleague, or you in a later conversation, would need: who it is for, a constraint from another team, a research finding, where it came from, a link to the ticket.

```
npm run log -- remember design <name> "For clinicians checking guidance between appointments; most arrive from search"
```

- One line, at most 200 characters. At most 15 per sketch or design: when it is full, the command says so. Remove a line that is no longer true (this file, unlike the decision log, may be edited by hand to delete lines).
- Remember it when the designer tells you something about the audience, the constraints or the history, or says "remember that...".
- It is not for decisions (use the log), for general design system knowledge (that is the catalogue), or for anything about the designer themselves.

There is no memory outside the sketch or design it belongs to. Everything about one, including its decisions, memory, session notes and any hand-over package, is inside its own folder, so deleting the folder removes all of it. Do not keep notes about a sketch or design anywhere else.

## Session notes

When the designer says "save this", or when a substantial piece of work is finished, write the day's note:

```
npm run log -- session design <name> --asked "..." --changed "..." --open "..."
```

- Three short fields (at most 400 characters each): what was asked for, what changed, and what is still open or undecided.
- There is one note per person per day for each sketch or design. Running the command again replaces it, so write it to cover the whole day so far.
- This is a summary for colleagues. Never paste the conversation into it.

## The original request

When you create a sketch or design, put the designer's request in the `prompt` field of its `sketch.json` or `design.json`, in their words, trimmed to the part that describes what to make. It is shown in the workspace so others can see how it was asked for. Do not change it later.

## Where people see it

The workspace shows the latest decision on the home page, and everything for one sketch or design (request, checks, screens, decisions, session notes) at `/workspace/design/<name>` or `/workspace/sketch/<name>`. Point designers there with "Checks, screens and decisions" rather than reading logs out to them.
