/**
 * Browser gates. Run through `npm run check`, not directly.
 * For every sketch and design: loads the page, takes screenshots from the
 * smallest screen up, checks nothing scrolls sideways and controls are big
 * enough to tap, runs accessibility checks and (for the compose tier) walks
 * the page with the keyboard only.
 */
import fs from "fs";
import path from "path";
import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";

import { getTargets, previewDir, widths, type Problem } from "../scripts/targets";

/** WCAG 2.2 AA (2.5.8): targets at least 24 by 24 CSS pixels */
const minTarget = 24;

/**
 * Controls that are too small to tap comfortably on a phone.
 * Links inside a sentence are exempt (as in WCAG), and a checkbox or radio
 * counts together with its label, which is also tappable.
 */
const smallTargets = (page: Page): Promise<string[]> =>
	page.evaluate(
		({ selector, min }) => {
			const found: string[] = [];
			for (const el of Array.from(document.querySelectorAll<HTMLElement>(selector))) {
				const style = getComputedStyle(el);
				if (
					el.closest("[aria-hidden='true'], [hidden], [inert]") ||
					// the workspace's own bar is not part of the design
					el.closest(".ws-bar") ||
					style.visibility === "hidden" ||
					el.getClientRects().length === 0 ||
					(el as HTMLButtonElement).disabled
				)
					continue;
				// inline links in running text
				if (el.tagName === "A" && style.display === "inline") continue;

				let rect = el.getBoundingClientRect();
				const input = el as HTMLInputElement;
				if (input.labels?.length) {
					const label = input.labels[0].getBoundingClientRect();
					rect = new DOMRect(
						Math.min(rect.left, label.left),
						Math.min(rect.top, label.top),
						Math.max(rect.right, label.right) - Math.min(rect.left, label.left),
						Math.max(rect.bottom, label.bottom) - Math.min(rect.top, label.top)
					);
				}
				if (rect.width < min || rect.height < min) {
					const name =
						el.getAttribute("aria-label") ||
						el.textContent?.trim().slice(0, 50) ||
						input.name ||
						el.tagName.toLowerCase();
					found.push(`"${name}" is ${Math.round(rect.width)} by ${Math.round(rect.height)} pixels`);
				}
			}
			return found;
		},
		{ selector: interactive, min: minTarget }
	);
const targets = getTargets(process.env.CHECK_ONLY || undefined);

const interactive =
	'a[href], button, input:not([type="hidden"]), select, textarea, summary, [tabindex]:not([tabindex="-1"])';

const keyboardWalk = async (page: Page): Promise<string[]> => {
	const total = await page.evaluate((selector) => {
		let index = 0;
		for (const el of Array.from(document.querySelectorAll<HTMLElement>(selector))) {
			const style = getComputedStyle(el);
			const hidden =
				el.closest("[aria-hidden='true'], [hidden], [inert]") ||
				style.visibility === "hidden" ||
				style.display === "none" ||
				el.getClientRects().length === 0 ||
				(el as HTMLButtonElement).disabled;
			if (!hidden) el.setAttribute("data-kb", String(index++));
		}
		return index;
	}, interactive);

	const reached = new Set<string>();
	for (let i = 0; i < total + 10 && reached.size < total; i++) {
		await page.keyboard.press("Tab");
		const id = await page.evaluate(() =>
			document.activeElement?.getAttribute("data-kb")
		);
		if (id) reached.add(id);
	}

	return page.evaluate((reachedIds) => {
		const missed: string[] = [];
		const radioGroupsReached = new Set(
			reachedIds
				.map((id) => document.querySelector<HTMLInputElement>(`[data-kb="${id}"]`))
				.filter((el) => el?.type === "radio")
				.map((el) => el!.name)
		);
		for (const el of Array.from(document.querySelectorAll<HTMLElement>("[data-kb]"))) {
			if (reachedIds.includes(el.getAttribute("data-kb")!)) continue;
			const input = el as HTMLInputElement;
			if (input.type === "radio" && radioGroupsReached.has(input.name)) continue;
			const label =
				el.getAttribute("aria-label") ||
				el.textContent?.trim().slice(0, 60) ||
				input.name ||
				el.tagName.toLowerCase();
			missed.push(label);
		}
		return missed;
	}, [...reached]);
};

for (const target of targets) {
	test(`${target.kind} ${target.slug}`, async ({ page }) => {
		const name = `${target.kind}-${target.slug}`;
		const slug = target.slug;
		const problems: Problem[] = [];
		const add = (rule: string, message: string) =>
			problems.push({ target: target.slug, rule, message });

		// Lines starting [check] are shown as progress by `npm run check`
		const step = (message: string) => console.log(`[check] ${name}: ${message}`);

		const consoleErrors: string[] = [];
		page.on("pageerror", (error) => consoleErrors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error") consoleErrors.push(message.text());
		});

		step(`opening ${target.url}`);
		await page.setViewportSize({ width: 1200, height: 900 });
		const response = await page.goto(target.url, { waitUntil: "networkidle" });
		if (!response || response.status() >= 400)
			add("page-loads", `The page did not load (status ${response?.status()})`);

		// A sketch's demo loads after the page itself: wait until it is really there
		if (target.kind === "sketch")
			await page
				.waitForSelector("[data-sketch-ready]", { timeout: 120_000 })
				.catch(() =>
					add("page-loads", "The sketch's demo did not appear on the page. Check demo.tsx has a default export that renders the component")
				);
		await page.evaluate(() => document.fonts.ready);
		step(`page loaded (status ${response?.status()})`);

		// Responsive: screenshots and overflow at each breakpoint
		const shots = path.join(previewDir, "screenshots");
		fs.mkdirSync(shots, { recursive: true });
		for (const width of widths) {
			step(`screenshot and layout at ${width}px`);
			await page.setViewportSize({ width, height: 900 });
			await page.waitForTimeout(150);
			await page.screenshot({
				path: path.join(shots, `${name}-${width}.png`),
				fullPage: true
			});
			const overflow = await page.evaluate(
				() =>
					document.documentElement.scrollWidth -
					document.documentElement.clientWidth
			);
			if (overflow > 1)
				add(
					"responsive",
					`Content is ${overflow}px wider than the screen at ${width}px wide, so people would have to scroll sideways${width === widths[0] ? " (WCAG 1.4.10)" : ""}`
				);

			// Tap targets, measured on the smallest screen
			if (width === widths[0])
				for (const target of await smallTargets(page))
					add(
						"tap-target",
						`${target} at ${width}px wide. Controls must be at least ${minTarget} by ${minTarget} pixels (WCAG 2.5.8)`
					);
		}
		await page.setViewportSize({ width: 1200, height: 900 });

		// Accessibility
		step("accessibility scan");
		const axe = await new AxeBuilder({ page })
			.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
			.analyze();
		for (const violation of axe.violations) {
			// Anything that breaks WCAG 2.2 A or AA fails, for sketches as well as designs.
			// axe's extra "best practice" rules fail a design and are notes on a sketch.
			const wcag = violation.tags.filter((tag) => /^wcag\d{3,4}$/.test(tag));
			const criteria = wcag
				.map((tag) => tag.replace("wcag", "").split("").join(".").replace(/^(\d)\.(\d)\.(\d)\.(\d)$/, "$1.$2.$3$4"))
				.join(", ");
			const isWcag = violation.tags.some((tag) => /^wcag2\d*a{1,2}$/.test(tag));
			for (const node of violation.nodes)
				problems.push({
					target: slug,
					rule: `accessibility/${violation.id}`,
					warning: !isWcag && target.tier === "sketch",
					message: `${violation.help}${criteria ? ` (WCAG ${criteria})` : " (accessibility best practice)"}. Element: ${node.html.slice(0, 160)}`
				});
		}

		// Keyboard only
		// WCAG 2.1.1: everything must work from the keyboard, in sketches too
		step("keyboard walk-through");
		for (const label of await keyboardWalk(page))
			add("keyboard", `"${label}" cannot be reached using the Tab key alone (WCAG 2.1.1)`);

		for (const error of new Set(consoleErrors))
			add("browser-error", error.slice(0, 300));

		const failures = problems.filter((p) => !p.warning);
		step(
			failures.length
				? `finished with ${failures.length} problem(s)`
				: `finished, no problems${problems.length ? ` (${problems.length} note(s))` : ""}`
		);

		const out = path.join(previewDir, "browser");
		fs.mkdirSync(out, { recursive: true });
		fs.writeFileSync(
			path.join(out, `${name}.json`),
			JSON.stringify(problems, null, "\t")
		);
		expect(failures, "see .preview/check-report.json").toEqual([]);
	});
}
