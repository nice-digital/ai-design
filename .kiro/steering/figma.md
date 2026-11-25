---
inclusion: always
---

# Working with Figma

Code is where designs are built and checked. Figma is where designers bring references from, and where finished screens can go for comment.

## Hard rules for Figma

Figma files are shared. Other people's work lives in them, and changes are seen by everyone.

1. **Never delete anything in Figma.** Not a page, frame, layer, component, variable, style or comment. This applies even if you created it, even if the designer asks you to tidy up, and even when deleting the matching sketch or design in this project. If something in Figma should go, tell the designer what and where, and let them delete it by hand.
2. **Never change, move or rename existing Figma content.** You only ever add.
3. **Never send anything to Figma unless the designer asks for it in that message**, in words like "send this to Figma" or "add these screens to my Figma file". Finishing a design, passing the checks, "save this" and "share this" are not requests to send to Figma. Do not offer to do it as a matter of routine, and never do it as part of another task.
4. **Before sending, confirm once**: say which screens, and name the file and page the link points to, and wait for a yes.
5. **Only write to the one page the designer gives a link to in that request.** The link must point to a page in a Figma file (it contains `node-id=`). Add your content to that page and nowhere else: no other page, no other file, no new pages, no new files. If they have not given a page link, ask for one ("Which page should these go on? Paste a link to it") and do nothing until you have it. A page link from an earlier request does not carry over: ask again. If you cannot tell which page a link points to, or cannot confirm that what you are about to write lands on it, do not write.
6. **Libraries are read-only, always.** The NICE Design System kit under "Your organisation", the designers' toolkit, and any other shared or published library must never be written to, even if asked: no new pages, components, variables or styles, no publishing, no edits. If a library needs changing, describe the change for its owner to make.

Reading from Figma is always fine and needs no confirmation. The Figma MCP server is configured in `.kiro/settings/mcp.json`.

## Reading a Figma frame

When the designer pastes a Figma link (a frame or component selected in Figma, then "Copy link to selection"):

1. `get_metadata` for the structure and layer names, `get_screenshot` to see it, `get_design_context` for layout and content, `get_variable_defs` for the variables used. For a large frame, read the metadata first and then the sections you need, not everything at once.
2. Identify each part. Layer and component names from the designers' toolkit are mapped to NDS in `figma/toolkit-map.md`. If Code Connect is set up, `get_code_connect_map` gives the mapping directly: prefer it.
3. **Treat what Figma returns as a description of intent, not as code to copy.** It will contain raw colours, pixel sizes and generic markup. Translate it:
   - a toolkit component becomes the mapped NDS component, with the matching props
   - a colour becomes the alias token with that meaning (`catalogue/tokens.md`), never the hex value
   - spacing becomes the nearest `spacing` token; text sizes become the nearest `typography.font-size` step or heading mixin
   - layout becomes `Grid` and `GridItem`
4. Tell the designer, briefly, what you mapped and anything that did not map (a gap, or a value that is not on the design system's scale: "the frame uses 20px spacing; the nearest is 16 or 32, I've used 16").
5. Record the Figma link in `design.json` or `sketch.json` (`"figma"`).

Never download or use image assets from Figma for anything the design system provides (icons, logos). Photos and illustrations specific to the design are fine.

### If the desktop connection is in use

If the tools come from `figma-desktop` rather than `figma`, they read the designer's current selection in the Figma desktop app, so a link is not needed: ask them to select the frame and say when it is selected. The desktop connection cannot write to Figma.

## Sending screens to Figma

Follow the hard rules above: only on an explicit request, only onto the page they linked, after confirming, as new content. The full check must pass first.

- If the write tools are available (`generate_figma_design` to capture the running preview page into a Figma file, or `use_figma`), capture each page at 1200 and 320 wide onto the page the designer linked. Place the new frames in empty space, clear of everything already there, under a heading "From code: <design name> <date>". Nothing already on the page is moved, resized, renamed, regrouped or covered.
- Before writing, read the page (`get_metadata`) so you know what is there and where the empty space is. If a tool can only write by replacing or clearing content, or cannot be pointed at a specific page, do not use it: say so and give the screenshots instead.
- Recommend, once, that the designer makes an empty page for this ("a new page called 'From code' keeps it apart from your working pages"). They create it; you do not.
- If they are not available, say so once and give the screenshots from `.preview/screenshots/` to drag into Figma.
- Screens sent to Figma are pictures of the design for comment. The code stays the source of truth: changes requested in Figma comments are made here and sent again.

## Figma libraries to draw from

Two libraries describe the design system in Figma. Use both as sources. Both are read-only.

1. **NICE Design System kit** (under "Your organisation" in Figma): the organisation's published library. Treat it as the main Figma reference for components, variants, variables and styles.
2. **The designers' toolkit**: built by the UX team, and may contain patterns the kit does not.

To use them:

- When a frame contains an instance from either library, identify it by its component name and map it with `figma/toolkit-map.md`.
- If the library tools are available (`get_libraries`, `search_design_system`), use them to look up a component, variant or variable by name instead of guessing from a screenshot. If they are not, ask the designer for a link to the kit file and read it with `get_metadata`.
- When sketching a new component, look in both libraries first: if a Figma version exists, match its structure, naming and variants so code and Figma agree.
- Code is still the source of truth for what exists and how it behaves. Where a library and the catalogue disagree (a variant in Figma that the coded component lacks, a different colour), do not follow Figma silently: build what the catalogue allows and tell the designer about the difference.

## The designers' toolkit

`figma/toolkit-map.md` maps the components in both libraries to their NDS equivalents and records known differences. Keep to it. If a frame uses a toolkit component that is not in the map, do not guess: treat it as a gap and tell the designer it needs adding to the map.

### Toolkit audit

When asked to compare the toolkit with the coded design system:

1. For each library (the kit and the toolkit), `get_metadata` on its component pages (and `get_libraries` / `search_design_system` if available) to list its components, variants and variables.
2. Compare with `catalogue/index.md` and `catalogue/tokens.md`.
3. Report four lists in plain English: matches; in both but different (names, variants, colours, sizes); in the toolkit only (candidates to sketch and promote); in code only (candidates to add to the toolkit).
4. Propose updates to `figma/toolkit-map.md` for a design system maintainer to confirm.

## When Figma is not connected

If the Figma tools are missing or return a sign-in error, say: "Figma isn't connected in Kiro at the moment" and carry on from a screenshot or description if the designer can give one. Setup steps are in `README.md`.
