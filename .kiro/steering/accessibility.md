---
inclusion: always
---

# Accessibility: WCAG 2.2 AA is the floor

Everything made here must meet the Web Content Accessibility Guidelines 2.2 at level AA. NICE is a public body and this is a legal duty, not a preference. It applies to sketches as much as to designs: an idea that cannot be made accessible is not a candidate.

## If you are asked for something that would not meet AA

Do not build it, not even "just to see". Say no plainly and kindly, in this shape:

1. **What you will not do**, in their terms.
2. **Why**, in one sentence about the people affected, with the WCAG criterion number and name.
3. **What you can do instead** that gets them as close as possible to what they wanted.

For example: "I can't use that light grey for the body text: it is too faint for people with low vision to read against the cream background (WCAG 1.4.3 Contrast, minimum). The standard text colour passes, or I can make the text larger and use the darker grey. Which would you prefer?"

Do not lecture, and do not refuse the whole request because one part fails: build the rest and offer the alternative for that part. If they push back, hold the line and offer to log their request and the reason it was declined as a decision, so the team can see it. Nobody can waive this in conversation.

## Requests to watch for

| They ask for | Why not | Offer instead |
|---|---|---|
| Lighter or coloured text, text over a photo | 1.4.3 Contrast (4.5:1 for text, 3:1 for large text) | A token colour that passes; a solid panel behind the text |
| Pale borders or icons on controls | 1.4.11 Non-text contrast (3:1) | The design system's border colours |
| Colour alone to show status, errors or a selected state | 1.4.1 Use of colour | Add text, an icon or a shape |
| Placeholder text instead of a label; an icon-only button with no name | 1.3.1, 3.3.2, 4.1.2 | A visible label; hint text; an accessible name |
| Removing or toning down the focus outline | 2.4.7 Focus visible, 2.4.11 Focus not obscured | The design system's focus style |
| Hover-only or drag-only interactions | 2.1.1 Keyboard, 2.5.7 Dragging movements, 1.4.13 Content on hover | A click or tap alternative that works from the keyboard |
| Clickable `div`s, custom controls with no keyboard support | 2.1.1 Keyboard, 4.1.2 Name, role, value | Real buttons and links, or a properly built component |
| Small icons or close buttons | 2.5.8 Target size (24 by 24 pixels) | A larger target |
| Fixed layouts, text that cannot grow, "desktop only" | 1.4.10 Reflow (320 pixels), 1.4.4 Resize text, 1.4.12 Text spacing | A responsive layout |
| Auto-playing carousels, video, animation, flashing | 2.2.2 Pause, stop, hide; 2.3.1 Three flashes | User-started, with pause; respect reduced motion |
| Timeouts or auto-advancing steps | 2.2.1 Timing adjustable | No limit, or a warning with a way to extend |
| Text inside images | 1.4.5 Images of text | Real text |
| Skipping heading levels for size, or headings for decoration | 1.3.1 Info and relationships, 2.4.6 Headings and labels | The right level, styled with a heading mixin |
| "Click here", "Read more" links | 2.4.4 Link purpose | Link text that says where it goes |
| Errors shown only by a red border, or cleared without saying | 3.3.1 Error identification, 3.3.3 Error suggestion | The components' error states, with a message |
| Asking for the same information twice; puzzles to prove you are human | 3.3.7 Redundant entry, 3.3.8 Accessible authentication | Reuse what they entered; no cognitive tests |
| Opening new windows, or changing the page when a field changes, without warning | 3.2.1, 3.2.2 On focus, on input | Say so first, or do it on a button press |
| Help or navigation in a different place on each page | 3.2.3 Consistent navigation, 3.2.6 Consistent help | Keep it in the same place |

## What the checks do and do not prove

`npm run check` fails anything that breaks an automatically testable WCAG 2.2 A or AA rule, and says which criterion. That is well under half of what the guidelines cover. You are responsible for the rest while you build: heading order that makes sense, link text out of context, a logical focus order, focus moving somewhere sensible after an action, changes announced to screen readers, and wording people can understand.

Never tell a designer something "is accessible" or "meets WCAG" on the strength of the checks. Say "it passes the automated accessibility checks", and that it needs testing with real assistive technology before it goes to production.

If an accessibility failure comes from inside a NICE Design System component itself, do not work around it by restyling the component: tell the designer it is a design system issue to report, and use a different component if there is one.
