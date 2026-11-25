# GOV.UK Design System patterns, applied with the NICE Design System

The GOV.UK Design System (https://design-system.service.gov.uk) is the best-researched source in UK government for how common tasks should work. NICE follows the same service standard, so its patterns and practice apply here.

**How to use it: take the pattern, not the parts.**

- GOV.UK tells you **how something should behave and be worded**: the order of steps, what to ask, how errors work, what a confirmation says.
- The NICE Design System provides **what it is built from and how it looks**: components, colours, type, spacing.
- Never import `govuk-frontend`, copy GOV.UK markup, class names or styles, or use the GOV.UK look (Transport font, crown, black header, green buttons). A design here is a NICE page.
- Where a GOV.UK pattern needs a component NDS does not have, that is a gap: say so, and sketch it. GOV.UK's version is good evidence for the sketch and for the hand-over.
- NICE's users are often professionals (clinicians, commissioners, researchers) as well as the public. GOV.UK guidance written for one-off citizen transactions sometimes needs adapting for expert, repeat use. Say when you adapt and why, and log it as a decision.

For detail on any item below, read the linked page. Summaries here are from memory of the guidance and may lag behind it: the linked page wins.

## Asking for information

| Pattern | The practice | Build with |
|---|---|---|
| [Question pages](https://design-system.service.gov.uk/patterns/question-pages/) | Start with one thing per page: one question, or one closely related group. The question is the page heading (and the field's label or legend). Only ask what the service needs. A "Continue" button, not "Next" | One `*.page.tsx` per question; `FormGroup`, `Input`, `Radio`, `Checkbox`, `Textarea`, `Button` |
| [Names](https://design-system.service.gov.uk/patterns/names/), [Email addresses](https://design-system.service.gov.uk/patterns/email-addresses/), [Telephone numbers](https://design-system.service.gov.uk/patterns/telephone-numbers/), [Addresses](https://design-system.service.gov.uk/patterns/addresses/), [Dates](https://design-system.service.gov.uk/patterns/dates/) | Single full-name field unless parts are really needed. Say why you need an email or phone number. Set the right `type` and `autocomplete`. Do not use `type="number"` for things that are not amounts. Memorable dates as three fields (day, month, year), not a calendar picker | `Input` with the right attributes. A three-field date input is a gap in NDS |
| [Equality information](https://design-system.service.gov.uk/patterns/equality-information/) | Ask only if it will be used, explain why, make every question optional with "Prefer not to say" | `Radio` |
| Radios or checkboxes or select | Radios for one choice, checkboxes for several, and avoid selects: they hide options and test poorly | `Radio`, `Checkbox` |
| Optional fields | Mark the few optional fields "(optional)". Do not mark required ones with asterisks | Label text |
| Hint text | Help that everyone needs goes in the hint, before the field. Do not use placeholder text for it | `hint` props |

## Errors and validation

| Pattern | The practice | Build with |
|---|---|---|
| [Validation](https://design-system.service.gov.uk/patterns/validation/) | Validate when the user submits, not as they type. Keep what they entered. Be forgiving about format (spaces, case) | Component `error` and `errorMessage` props |
| [Error message](https://design-system.service.gov.uk/components/error-message/) | Say what went wrong and how to fix it, specifically: "Enter your email address", "Comment must be 300 characters or fewer". No "invalid", no "please", no blame, no jargon. Same wording in the summary and next to the field | `errorMessage` |
| [Error summary](https://design-system.service.gov.uk/components/error-summary/) | At the top of the page when there are errors: a heading "There is a problem", a list of the errors each linking to its field. Move focus to it. Prefix the page title with "Error: " | `Alert type="error"` with a list of links is the closest NDS has; a proper error summary is a gap worth sketching |
| [Problem with the service](https://design-system.service.gov.uk/patterns/problem-with-the-service-pages/), [Page not found](https://design-system.service.gov.uk/patterns/page-not-found-pages/), [Service unavailable](https://design-system.service.gov.uk/patterns/service-unavailable-pages/) | Plain statement of what happened, that it is not the user's fault where true, whether their answers were saved, and what to do next. No error codes, no "Oops" | A plain content page with `PageHeader` |

## The shape of a transaction

| Pattern | The practice | Build with |
|---|---|---|
| [Start using a service](https://design-system.service.gov.uk/patterns/start-using-a-service/) | Say what the service is for, who can use it, what they will need and roughly how long it takes, then one clear start button | `PageHeader`, content, `Button variant="cta"` |
| [Check a service is suitable](https://design-system.service.gov.uk/patterns/check-a-service-is-suitable/) | Ask the eligibility questions first, so people do not waste time | Question pages |
| [Step by step navigation](https://design-system.service.gov.uk/patterns/step-by-step-navigation/), [Complete multiple tasks](https://design-system.service.gov.uk/patterns/complete-multiple-tasks/) | For long processes done over several sittings: a list of tasks with a status for each, in the order to do them | Task list is a gap in NDS; `Tag` for statuses |
| [Check answers](https://design-system.service.gov.uk/patterns/check-answers/) | Before submitting, show every answer with a "Change" link beside it that returns to this page afterwards. The button says what happens: "Send feedback", "Submit comment" | A summary list is a gap in NDS; `Table` or a definition list meanwhile |
| [Confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/) | Say it worked, give a reference if there is one, say what happens next and when, and how to get in touch | `Alert type="success"` or `Panel`, then content |
| [Confirm an email address](https://design-system.service.gov.uk/patterns/confirm-an-email-address/), [Create accounts](https://design-system.service.gov.uk/patterns/create-accounts/), [Passwords](https://design-system.service.gov.uk/patterns/passwords/) | Only make people create an account if there is a real need. Let them see what they typed | Question pages. Sign-in itself is NICE Accounts and out of scope |
| [Exit a page quickly](https://design-system.service.gov.uk/patterns/exit-a-page-quickly/) | For sensitive topics where being seen is a risk | A gap in NDS; discuss before sketching |

## Finding and reading

| Pattern | The practice | Build with |
|---|---|---|
| [Pagination](https://design-system.service.gov.uk/components/pagination/) | Page long lists; say which page; previous and next always available | `EnhancedPagination`, `SimplePagination`, `PrevNext` |
| [Navigate a service](https://design-system.service.gov.uk/patterns/navigate-a-service/) | Do not add navigation until the service needs it; keep it to a few top-level sections | `HorizontalNav`, `StackedNav`, `Breadcrumbs`, `InPageNav` |
| [Contact a department or service team](https://design-system.service.gov.uk/patterns/contact-a-department-or-service-team/) | Give a real way to get in touch, with opening hours and response times | Content |
| [Cookies page](https://design-system.service.gov.uk/patterns/cookies-page/) | Out of scope: NICE's cookie banner and policy are a separate product | - |
| Tabs and accordions | Use sparingly. They hide content, and people often miss it. Prefer headings and shorter pages | `Tabs`, `Accordion`: check their "when not to use" |

## Content

From the [GOV.UK style guide](https://www.gov.uk/guidance/style-guide/a-to-z) and [content design guidance](https://www.gov.uk/guidance/content-design/writing-for-gov-uk), which NICE's own style follows closely:

- Plain English, short sentences, active voice. Write for a reading age of about 9 for public content; professionals read faster in plain English too.
- Sentence case for headings, buttons and labels.
- Front-load headings and links with the words people are looking for. Link text makes sense out of context: never "click here".
- Buttons say what they do ("Send feedback"), and there is one main action per page.
- No "please", "sorry", "simply", "just" or exclamation marks in interface text.
- Spell out abbreviations on first use unless the audience always uses the short form.
- Dates as "18 November 2026". Numbers as numerals. "to" in ranges, not a dash.

## Accessibility practice

GOV.UK's guidance assumes WCAG 2.2 AA as a minimum, as NICE does. Beyond what this workspace's checks test automatically:

- Works at 320 pixels wide and at 400% zoom without sideways scrolling.
- Page `<title>` describes the page and is unique; one `h1`; headings in order.
- Never rely on colour alone, on hover alone, or on placeholder text.
- Do not disable buttons to show a form is incomplete: let people submit and tell them what is missing.
- Avoid time limits; if one is needed, warn and let people extend it.
- Test with real assistive technology before anything goes to production. Automated checks find well under half of problems.

## Other government systems worth knowing

- [NHS digital service manual](https://service-manual.nhs.uk/design-system): health-specific patterns (care cards, do and don't lists, expanders, review dates) and the NHS content style guide. Closest to NICE's subject matter.
- [GOV.UK Service Manual](https://www.gov.uk/service-manual): the service standard, user research and accessibility guidance.
- [MOJ](https://design-patterns.service.justice.gov.uk) and [HMRC](https://design.tax.service.gov.uk/hmrc-design-patterns/) pattern libraries: tested patterns for case-working and complex transactions (filters, sortable tables, timelines, multi-file upload), useful for professional-facing tools.

The same rule applies to all of them: take the pattern, build it from NDS.
