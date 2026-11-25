# Decisions: Multi select combo box

The latest 25 decisions, newest first: date | who | what was decided | why.
Add with `npm run log`, not by hand. Older decisions are in decisions-archive.md.

- 2026-11-25 | John Davey | The error message clears once at least one option is chosen | Designer's request: validation should clear after a valid choice
- 2026-11-25 | John Davey | The field shows chosen options as a comma separated list; typing narrows the list after the last comma | Designer's request: show choices in the field as they are made
- 2026-11-25 | John Davey | Clicking the field always opens the list; removing a tag keeps a closed list closed | Designer's instruction: only tag removal should not open the list
- 2026-11-25 | John Davey | Removing a chosen option keeps the list as it was: closed stays closed, open stays open | Designer's instruction
- 2026-11-25 | John Davey | Removing a chosen option with its x, or Clear all, does not open the list | Designer's instruction: removing is not a request to choose more
- 2026-11-23 | John Davey | List stays open after each choice; chosen options show below the field as buttons that remove them, with Clear all when 2 or more are chosen | GOV.UK has no multiple choice autocomplete, so this extends its single choice pattern without changing what was typed
