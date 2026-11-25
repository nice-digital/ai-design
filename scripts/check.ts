/**
 * The gates. Nothing is finished until this passes.
 *
 *   npm run check                  everything
 *   npm run check -- <name>        one sketch or design (code rules still run on everything)
 *   npm run check -- --fast        skip the browser checks (no screenshots, accessibility or keyboard)
 *   npm run check -- --verbose     also show everything the preview server and test browser print
 *
 * Writes .preview/check-report.json and screenshots to .preview/screenshots/.
 * Exit code 0 = all gates pass.
 */
import { spawn, spawnSync } from "child_process";
import fs from "fs";
import path from "path";

import {
	filesIn,
	getTargets,
	previewDir,
	root,
	widths,
	type Problem,
	type Target
} from "./targets";

const args = process.argv.slice(2);
const fast = args.includes("--fast");
/** --verbose: also print everything the preview server and the test browser say, as it happens */
const verbose = args.includes("--verbose");

const startedAt = Date.now();
const elapsed = () => `${((Date.now() - startedAt) / 1000).toFixed(1)}s`.padStart(7);
const log = (message: string) => console.log(`[${elapsed()}] ${message}`);
/** Runs one stage, logging when it starts, how long it took and what it found */
const stage = (name: string, work: () => void) => {
	const before = problems.length;
	const began = Date.now();
	log(`${name}...`);
	work();
	const found = problems.length - before;
	log(`${name}: ${found ? `${found} problem(s)` : "ok"} (${((Date.now() - began) / 1000).toFixed(1)}s)`);
};
const only = args.find((arg) => !arg.startsWith("--"));

const problems: Problem[] = [];
const rel = (file: string) => path.relative(root, file);

const run = (command: string, commandArgs: string[], env: NodeJS.ProcessEnv = {}) =>
	spawnSync(command, commandArgs, {
		cwd: root,
		encoding: "utf8",
		env: { ...process.env, ...env },
		maxBuffer: 64 * 1024 * 1024
	});

/** Which sketch or design a file belongs to */
const ownerOf = (file: string, targets: Target[]): string =>
	targets.find((t) => path.resolve(file).startsWith(t.dir + path.sep))?.slug ??
	"workspace";

// ---------------------------------------------------------------------------
// 1. Workspace rules that linters cannot express
// ---------------------------------------------------------------------------

const allowedScriptImports = {
	design: [/^react$/, /^next(\/.+)?$/, /^classnames$/, /^@nice-digital\/.+/, /^@sketches\/[a-z0-9-]+$/, /^\.\//],
	sketch: [/^react$/, /^classnames$/, /^@nice-digital\/.+/, /^\.\//],
	// A pattern is composed from the design system and ready sketches
	pattern: [/^react$/, /^classnames$/, /^@nice-digital\/.+/, /^@sketches\/[a-z0-9-]+$/, /^\.\//]
};
const allowedStyleImports = [/^sass:/, /^@nice-digital\/nds-core\/scss\/.+/, /^\.\//];

const checkStructure = (target: Target) => {
	const add = (rule: string, message: string, file?: string) =>
		problems.push({ target: target.slug, rule, message, file: file && rel(file) });

	const required =
		target.kind === "sketch"
			? ["sketch.json", "index.ts", "demo.tsx"]
			: ["design.json", "index.page.tsx"];
	for (const file of required)
		if (!fs.existsSync(path.join(target.dir, file)))
			add("structure", `Missing ${file}. Create ${target.kind}s with "npm run new:${target.kind}"`);
	for (const field of ["title", "description"])
		if (!String(target.meta[field] ?? "").trim())
			add("structure", `${target.kind}.json needs a "${field}" so it can be listed on the workspace home page`);

	for (const file of filesIn(target.dir, /\.(ts|tsx)$/)) {
		const source = fs.readFileSync(file, "utf8");
		const specifiers = [
			...source.matchAll(/(?:from|import)\s+["']([^"']+)["']/g),
			...source.matchAll(/(?:import|require)\(\s*["']([^"']+)["']\s*\)/g)
		].map((match) => match[1]);

		for (const specifier of specifiers) {
			const allowedFor = target.type === "pattern" ? "pattern" : target.kind;
			if (!allowedScriptImports[allowedFor].some((allowed) => allowed.test(specifier)))
				add(
					"imports",
					target.kind === "design"
						? `"${specifier}" is not allowed. Designs may only use the NICE Design System (@nice-digital/*), sketches (@sketches/name) and files in their own folder`
						: target.type === "pattern"
						? `"${specifier}" is not allowed. Patterns may only be composed from the NICE Design System (@nice-digital/*), ready sketches (@sketches/name) and their own files`
						: `"${specifier}" is not allowed. A component sketch may only build on React, classnames, the NICE Design System (@nice-digital/*) and its own files. To compose other sketches, make it a pattern ("type": "pattern" in sketch.json)`,
					file
				);
			if (specifier === `@sketches/${target.slug}`)
				add("imports", "A sketch cannot import itself: use a relative import", file);

			const sketch = specifier.match(/^@sketches\/([a-z0-9-]+)/)?.[1];
			if (sketch) {
				const used = getTargets(sketch)[0];
				if (!used) add("experimental", `Uses the sketch "${sketch}", which does not exist`, file);
				else if (used.tier !== "compose")
					add(
						"experimental",
						`Uses the sketch "${sketch}", which is not ready for designs. Set "status": "ready" in sketches/${sketch}/sketch.json and make it pass the full checks first`,
						file
					);
			}
		}
	}

	for (const file of filesIn(target.dir, /\.scss$/)) {
		const source = fs.readFileSync(file, "utf8");
		if (!/\.module\.scss$/.test(file) && !path.basename(file).startsWith("_"))
			add("styles", "Stylesheets must be CSS modules (Name.module.scss) or partials (_name.scss)", file);
		if (/@import\s/.test(source))
			add("styles", "Use @use, not @import", file);

		// Mobile first: start with the smallest screen and add to it as the screen gets wider
		if (/\bmq\([^)]*\$until/.test(source))
			add(
				"mobile-first",
				"Do not use mq($until: ...). Write the small-screen styles first with no media query, then add to them with mq($from: ...)",
				file
			);
		if (/@media[^{]*(max-(device-)?width|\bwidth\s*<)/.test(source))
			add(
				"mobile-first",
				"Do not use max-width media queries. Write the small-screen styles first, then add to them with @include media-queries.mq($from: ...)",
				file
			);
		if (/@media[^{]*\(\s*(min-)?width/.test(source))
			add(
				"mobile-first",
				"Use the design system's breakpoints, @include media-queries.mq($from: md), not a hand-written @media width",
				file
			);

		for (const [, specifier] of source.matchAll(/@(?:use|forward)\s+["']([^"']+)["']/g)) {
			if (!allowedStyleImports.some((allowed) => allowed.test(specifier)))
				add("styles", `"${specifier}" is not allowed. Styles may only use nds-core modules (@nice-digital/nds-core/scss/...) and local partials`, file);

			if (/colours\/tokens\/global/.test(specifier)) {
				const isAliasFile = target.kind === "sketch" && path.basename(file) === "_tokens.scss";
				if (!isAliasFile)
					add(
						"tokens",
						target.kind === "design"
							? "Designs must not use the raw colour palette. Use alias tokens from @nice-digital/nds-core/scss/colours"
							: "The raw colour palette may only be used in a sketch's _tokens.scss, to define named alias tokens (as nds-core's _alias.scss does)",
						file
					);
			}
		}
	}
};

// ---------------------------------------------------------------------------
// 2. Linters and type check
// ---------------------------------------------------------------------------

const checkStyles = (targets: Target[]) => {
	const result = run("npx", [
		"stylelint",
		"sketches/**/*.scss",
		"prototype/pages/designs/**/*.scss",
		"--allow-empty-input",
		"--ignore-pattern",
		"sketches/*/handover/**",
		"--formatter",
		"json"
	]);
	// stylelint prints JSON to stderr from v16, stdout before that
	const output = [result.stderr, result.stdout].find((text) => text.trim().startsWith("["));
	if (!output) {
		if (result.status !== 0)
			problems.push({ target: "workspace", rule: "styles", message: `stylelint failed to run: ${(result.stderr || result.stdout).slice(0, 500)}` });
		return;
	}
	for (const file of JSON.parse(output))
		for (const warning of file.warnings)
			problems.push({
				target: ownerOf(file.source, targets),
				rule: `styles/${warning.rule}`,
				message: `${warning.text.replace(/\s*\([a-z-/]+\)$/, "")} (line ${warning.line})`,
				file: rel(file.source)
			});
};

const checkCode = (targets: Target[]) => {
	const result = run("npx", [
		"eslint",
		"sketches",
		"prototype/pages/designs",
		"--ext",
		".ts,.tsx",
		"--format",
		"json",
		"--no-error-on-unmatched-pattern",
		"--ignore-pattern",
		"sketches/*/handover/**"
	]);
	try {
		for (const file of JSON.parse(result.stdout))
			for (const message of file.messages)
				problems.push({
					target: ownerOf(file.filePath, targets),
					rule: `code/${message.ruleId ?? "syntax"}`,
					message: `${message.message} (line ${message.line})`,
					file: rel(file.filePath)
				});
	} catch {
		problems.push({ target: "workspace", rule: "code", message: `eslint failed to run: ${(result.stderr || result.stdout).slice(0, 500)}` });
	}
};

const checkTypes = (targets: Target[]) => {
	const result = run("npx", ["tsc", "--noEmit", "--pretty", "false", "-p", "prototype"]);
	for (const line of result.stdout.split("\n")) {
		const match = line.match(/^(.+?)\((\d+),\d+\): error TS\d+: (.+)$/);
		if (!match) continue;
		const file = path.resolve(root, "prototype", match[1]);
		const inRoot = fs.existsSync(file) ? file : path.resolve(root, match[1]);
		problems.push({
			target: ownerOf(inRoot, targets),
			rule: "types",
			message: `${match[3]} (line ${match[2]}). A component is probably being used with options it does not have: check its page in catalogue/components/`,
			file: rel(inRoot)
		});
	}
};

// ---------------------------------------------------------------------------
// 3. Browser: screenshots, accessibility, keyboard
// ---------------------------------------------------------------------------

const checkInBrowser = async (targets: Target[]) => {
	const browserDir = path.join(previewDir, "browser");
	fs.rmSync(browserDir, { recursive: true, force: true });

	// Streamed, so a slow first run shows what it is doing instead of looking stuck
	const result = await new Promise<{ stdout: string; stderr: string }>((resolve) => {
		const child = spawn("npx", ["playwright", "test"], {
			cwd: root,
			env: { ...process.env, CHECK_ONLY: only ?? "" },
			shell: process.platform === "win32"
		});
		let stdout = "";
		let stderr = "";
		let serverNoted = false;
		const began = Date.now();
		const waiting = setInterval(
			() => log(`  still working on the browser checks (${Math.round((Date.now() - began) / 1000)}s so far)`),
			15_000
		);
		const show = (chunk: Buffer, isError: boolean) => {
			const text = chunk.toString();
			if (isError) stderr += text;
			else stdout += text;
			for (const raw of text.split("\n")) {
				const line = raw.replace(/\u001b\[[0-9;]*m/g, "").trimEnd();
				if (!line.trim()) continue;
				if (verbose) {
					log(`  | ${line}`);
					continue;
				}
				if (line.startsWith("[WebServer]")) {
					if (!serverNoted) log("  preview server is starting and building pages");
					serverNoted = true;
					if (/Ready in|Compiled|Compiling|GET \/|error|Error|Failed/.test(line))
						log(`  preview: ${line.replace("[WebServer]", "").trim().slice(0, 160)}`);
				} else if (line.includes("[check]")) log(`  ${line.slice(line.indexOf("[check]") + 8)}`);
				else if (/^Running \d+ test|^\s+\d+ (passed|failed|flaky|skipped)|Error:|Timed out|timeout/i.test(line))
					log(`  ${line.trim().slice(0, 200)}`);
			}
		};
		child.stdout.on("data", (chunk) => show(chunk, false));
		child.stderr.on("data", (chunk) => show(chunk, true));
		child.on("error", (error) => {
			stderr += String(error);
		});
		child.on("close", () => {
			clearInterval(waiting);
			resolve({ stdout, stderr });
		});
	});

	// Full output for a developer; the report gets a short, relevant reason
	const output = (result.stdout + "\n" + result.stderr).replace(/\u001b\[[0-9;]*m/g, "");
	fs.writeFileSync(path.join(previewDir, "browser-log.txt"), output);

	// The preview server's own chatter (Sass deprecation warnings from the
	// design system and so on) is not the reason a check failed
	const relevant = output
		.split("\n")
		.filter((line) => line.trim() && !line.startsWith("[WebServer]"))
		.join("\n");

	let reason = relevant.trim().slice(-800);
	// A page that will not build is the most common cause, and it also makes the
	// preview look as if it never started, so look for it first
	const buildError = output.match(/\[WebServer\]\s+⨯[\s\S]{0,1200}/)?.[0] ?? output.match(/(Failed to compile|Module not found|SassError)[\s\S]{0,800}/)?.[0];
	if (/Executable doesn't exist|playwright install/i.test(output))
		reason = "The test browser is not installed on this machine. Run: npx playwright install chromium";
	else if (/error while loading shared libraries|Host system is missing dependencies/i.test(output))
		reason = "The test browser is installed but the machine is missing system libraries it needs. Run: npx playwright install --with-deps chromium";
	else if (buildError)
		reason = `The preview could not build a page. ${buildError
			.split("\n")
			.map((line) => line.replace("[WebServer]", "").trim())
			.filter((line) => line && !line.includes("ruleSet["))
			.slice(0, 10)
			.join(" / ")}`;
	else if (/EADDRINUSE|address already in use/i.test(output))
		reason = "Something else is already using port 3000. Close it, or run the check with PREVIEW_PORT=3100";
	else if (/Timed out waiting .* from config\.webServer|webServer.*(timed out|timeout)/i.test(output))
		reason = "The preview did not start in time. Run `npm run preview`, wait until http://localhost:3000 opens in a browser, then run the check again";
	else if (/Test timeout of \d+ms exceeded/i.test(output))
		reason = "The page took too long to load. Run `npm run preview`, open the page once in a browser so it is built, then run the check again";

	for (const target of targets) {
		const file = path.join(browserDir, `${target.kind}-${target.slug}.json`);
		if (fs.existsSync(file)) problems.push(...JSON.parse(fs.readFileSync(file, "utf8")));
		else
			problems.push({
				target: target.slug,
				rule: "browser",
				message: `The browser check could not finish. ${reason} (full output: .preview/browser-log.txt)`
			});
	}
};

// ---------------------------------------------------------------------------

const main = async (): Promise<number> => {
const all = getTargets();
const selected = getTargets(only);
if (only && selected.length === 0) {
	console.error(`No sketch or design called "${only}"`);
	process.exit(1);
}

log(`Checking ${selected.map((t) => `${t.kind} "${t.slug}"`).join(", ")}`);
stage("1/5 Workspace rules (allowed imports, tokens, files)", () => selected.forEach(checkStructure));
stage("2/5 Style rules (colours, spacing, text sizes, class names)", () => checkStyles(all));
stage("3/5 Code rules (inline styles, accessible markup)", () => checkCode(all));
stage("4/5 Components used correctly (type check)", () => checkTypes(all));

if (only) {
	const mine = problems.filter((p) => p.target === only || p.target === "workspace");
	problems.length = 0;
	problems.push(...mine);
}

// A page that does not compile cannot be checked in a browser
const browserRan = !fast && problems.length === 0 && selected.length > 0;
if (browserRan) {
	log("5/5 Browser checks (accessibility, keyboard, screen sizes)...");
	log("  the first run builds every page and can take a few minutes");
	const before = problems.length;
	const began = Date.now();
	await checkInBrowser(selected);
	const found = problems.slice(before).filter((p) => !p.warning).length;
	log(`5/5 Browser checks: ${found ? `${found} problem(s)` : "ok"} (${((Date.now() - began) / 1000).toFixed(1)}s)`);
} else log(`5/5 Browser checks: skipped (${fast ? "--fast" : "fix the problems above first"})`);
console.log("");

const experimental = (target: Target): string[] =>
	target.kind === "design"
		? [
				...new Set(
					filesIn(target.dir, /\.(ts|tsx)$/).flatMap((file) =>
						[...fs.readFileSync(file, "utf8").matchAll(/@sketches\/([a-z0-9-]+)/g)].map((m) => m[1])
					)
				)
		  ]
		: [];

const notes = problems.filter((p) => p.warning);
const failures = problems.filter((p) => !p.warning);
problems.length = 0;
problems.push(...failures);

const report = {
	passed: problems.length === 0,
	browserChecksRan: browserRan,
	checked: selected.map((target) => ({
		name: target.slug,
		kind: target.kind,
		tier: target.tier,
		preview: `http://localhost:3000${target.url}`,
		passed: !problems.some((p) => p.target === target.slug),
		notYetInDesignSystem: experimental(target),
		screenshots: browserRan
			? widths.map((w) => `.preview/screenshots/${target.kind}-${target.slug}-${w}.png`)
			: []
	})),
	problems,
	/** Do not fail the check, but should be looked at */
	notes
};

fs.mkdirSync(previewDir, { recursive: true });
fs.writeFileSync(path.join(previewDir, "check-report.json"), JSON.stringify(report, null, "\t"));

// One small status file per sketch or design, so the workspace home page can
// show the latest result for each even when only one was checked this time
const statusDir = path.join(previewDir, "status");
fs.mkdirSync(statusDir, { recursive: true });
for (const item of report.checked)
	fs.writeFileSync(
		path.join(statusDir, `${item.kind}-${item.name}.json`),
		JSON.stringify(
			{
				checkedAt: new Date().toISOString(),
				passed: item.passed,
				browserChecksRan: browserRan,
				tier: item.tier,
				problems: problems.filter((p) => p.target === item.name),
				notes: notes.filter((n) => n.target === item.name),
				screenshots: item.screenshots
			},
			null,
			"\t"
		)
	);

for (const item of report.checked) {
	const mine = problems.filter((p) => p.target === item.name);
	console.log(`${item.passed ? "PASS" : "FAIL"}  ${item.kind} ${item.name} (${item.tier} rules)`);
	for (const p of mine) console.log(`      - [${p.rule}] ${p.message}${p.file ? `  ${p.file}` : ""}`);
	for (const n of notes.filter((n) => n.target === item.name)) console.log(`      note: [${n.rule}] ${n.message}`);
	if (item.notYetInDesignSystem.length)
		console.log(`      uses components not yet in the design system: ${item.notYetInDesignSystem.join(", ")}`);
}
for (const p of problems.filter((p) => p.target === "workspace"))
	console.log(`FAIL  workspace - [${p.rule}] ${p.message}`);

if (!browserRan)
	console.log(
		fast
			? "\nBrowser checks skipped (--fast). Run without --fast before calling anything finished."
			: problems.length
			? "\nBrowser checks not run yet: fix the problems above first."
			: ""
	);
console.log(
	`\n${report.passed ? "All checks passed" : `${problems.length} problem(s) to fix`}. Report: .preview/check-report.json`
);
return report.passed ? 0 : 1;
};

main().then((code) => process.exit(code));
