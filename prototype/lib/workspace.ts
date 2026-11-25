import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

/** Reads what exists in the workspace so the workspace pages can show it. Server-side only. */

const root = path.join(process.cwd(), process.cwd().endsWith("prototype") ? ".." : ".");
const sketchesDir = path.join(root, "sketches");
const designsDir = path.join(root, "prototype", "pages", "designs");
const previewDir = path.join(root, ".preview");

export type Kind = "sketch" | "design";

export interface CheckProblem {
	rule: string;
	message: string;
}

export interface CheckStatus {
	/**
	 * passed       all checks, including the browser ones
	 * partly       the code rules pass, the browser checks have not been run
	 * failed       there are problems to fix
	 * stale        it has changed since it was last checked
	 * unchecked    never checked
	 */
	state: "passed" | "partly" | "failed" | "stale" | "unchecked";
	checkedAt: string | null;
	problems: CheckProblem[];
	notes: CheckProblem[];
	/** Widths there is a screenshot for, smallest first */
	screenshots: number[];
}

export interface Decision {
	date: string;
	who: string;
	decision: string;
	why: string;
}

export interface SessionNote {
	date: string;
	who: string;
	asked: string;
	changed: string;
	open: string;
}

export interface Item {
	/** What it is made from: design system components and sketches */
	parts: Part[];
	kind: Kind;
	slug: string;
	title: string;
	description: string;
	figma: string;
	/** The request, in the designer's words, that this was first made from */
	prompt: string;
	url: string;
	/** "component" = one building block. "pattern" = composed from components and ready sketches */
	type: "component" | "pattern" | "design";
	/** Sketches only: id of the sketchbook it is in, or "" */
	sketchbook: string;
	/** Where it was brought in from, as "project:path", or "" */
	source: string;
	/** Sketches only: a hand-over package has been made */
	hasHandover: boolean;
	/** Background notes that are not decisions */
	memory: { date: string; who: string; note: string }[];
	/** Sketches only: "sketch" = idea, "ready" = can be used in designs */
	stage: "sketch" | "ready" | "design";
	/** Designs only: sketches (not yet in the design system) this design uses */
	experimental: string[];
	status: CheckStatus;
	decisions: Decision[];
	archivedDecisions: number;
	sessions: SessionNote[];
}

const dirs = (dir: string): string[] =>
	fs.existsSync(dir)
		? fs
				.readdirSync(dir, { withFileTypes: true })
				.filter((d) => d.isDirectory() && !d.name.startsWith("_"))
				.map((d) => d.name)
				.sort()
		: [];

const readJson = (file: string): Record<string, unknown> => {
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	} catch {
		return {};
	}
};

const filesIn = (dir: string, pattern: RegExp): string[] =>
	fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) return ["sessions", "handover"].includes(entry.name) ? [] : filesIn(full, pattern);
		return pattern.test(entry.name) ? [full] : [];
	});

const sketchesUsedBy = (dir: string): string[] => {
	const used = new Set<string>();
	for (const file of filesIn(dir, /\.(tsx?|scss)$/))
		for (const match of fs.readFileSync(file, "utf8").matchAll(/@sketches\/([a-z0-9-]+)/g))
			used.add(match[1]);
	return [...used].sort();
};

/** One building block a sketch, pattern or design is made from */
export interface Part {
	name: string;
	/** In the design system, or still a sketch in this workspace */
	from: "design-system" | "sketch";
	href: string;
}

const ndsDocs = "https://design-system.nice.org.uk/components";

/** The design system components and sketches an item imports, design system first */
const partsOf = (dir: string): Part[] => {
	const nds = new Set<string>();
	// demo.tsx only shows the component off, so what it imports does not count
	for (const file of filesIn(dir, /\.tsx?$/).filter((f) => path.basename(f) !== "demo.tsx"))
		for (const match of fs.readFileSync(file, "utf8").matchAll(/from\s+["']@nice-digital\/nds-([a-z-]+)["']/g))
			if (match[1] !== "core") nds.add(match[1]);
	const title = (slug: string) => String(readJson(path.join(sketchesDir, slug, "sketch.json")).title ?? slug);
	return [
		...[...nds].sort().map((slug): Part => ({
			name: (slug[0].toUpperCase() + slug.slice(1)).replace(/-/g, " "),
			from: "design-system",
			href: `${ndsDocs}/${slug}/`
		})),
		...sketchesUsedBy(dir)
			.filter((slug) => path.join(sketchesDir, slug) !== dir)
			.map((slug): Part => ({ name: title(slug), from: "sketch", href: `/workspace/sketch/${slug}` }))
	];
};

const readStatus = (kind: Kind, slug: string, dir: string): CheckStatus => {
	const file = path.join(previewDir, "status", `${kind}-${slug}.json`);
	const screenshots = fs.existsSync(path.join(previewDir, "screenshots"))
		? fs
				.readdirSync(path.join(previewDir, "screenshots"))
				.map((name) => name.match(new RegExp(`^${kind}-${slug}-(\\d+)\\.png$`))?.[1])
				.filter((width): width is string => Boolean(width))
				.map(Number)
				.sort((a, b) => a - b)
		: [];

	if (!fs.existsSync(file))
		return { state: "unchecked", checkedAt: null, problems: [], notes: [], screenshots };

	const saved = readJson(file);
	const checkedAt = String(saved.checkedAt ?? "");
	const problems = (saved.problems as CheckProblem[] | undefined) ?? [];
	const notes = (saved.notes as CheckProblem[] | undefined) ?? [];

	// Only the files that make up the sketch or design count as "changed"
	const lastChanged = Math.max(
		0,
		...filesIn(dir, /\.(tsx?|scss|json)$/).map((source) => fs.statSync(source).mtimeMs)
	);
	const stale = lastChanged > new Date(checkedAt).getTime() + 2000;

	const state: CheckStatus["state"] = stale
		? "stale"
		: !saved.passed
		? "failed"
		: saved.browserChecksRan
		? "passed"
		: "partly";

	return { state, checkedAt, problems, notes, screenshots };
};

const readDecisions = (file: string): Decision[] =>
	fs.existsSync(file)
		? fs
				.readFileSync(file, "utf8")
				.split("\n")
				.filter((line) => line.startsWith("- "))
				.map((line) => line.slice(2).split(" | "))
				.filter((parts) => parts.length >= 4)
				.map(([date, who, decision, ...why]) => ({ date, who, decision, why: why.join(" | ") }))
		: [];

const readDecisionsLike = (file: string): { date: string; who: string; note: string }[] =>
	fs.existsSync(file)
		? fs
				.readFileSync(file, "utf8")
				.split("\n")
				.filter((line) => line.startsWith("- "))
				.map((line) => line.slice(2).split(" | "))
				.filter((parts) => parts.length >= 3)
				.map(([date, who, ...note]) => ({ date, who, note: note.join(" | ") }))
		: [];

const readSessions = (dir: string): SessionNote[] =>
	fs.existsSync(dir)
		? fs
				.readdirSync(dir)
				.filter((name) => name.endsWith(".md"))
				.sort()
				.reverse()
				.map((name) => {
					const text = fs.readFileSync(path.join(dir, name), "utf8");
					const field = (label: string) =>
						text.match(new RegExp(`^- ${label}: (.*)$`, "m"))?.[1] ?? "";
					return {
						date: name.slice(0, 10),
						who: text.match(/^# [\d-]+, (.*?): /m)?.[1] ?? "",
						asked: field("Asked for"),
						changed: field("What changed"),
						open: field("Still open")
					};
				})
		: [];

const readItem = (kind: Kind, slug: string): Item => {
	const dir = path.join(kind === "sketch" ? sketchesDir : designsDir, slug);
	const meta = readJson(path.join(dir, `${kind}.json`));
	return {
		kind,
		slug,
		title: String(meta.title ?? slug),
		description: String(meta.description ?? ""),
		figma: String(meta.figma ?? ""),
		prompt: String(meta.prompt ?? ""),
		url: kind === "sketch" ? `/sketches/${slug}` : `/designs/${slug}`,
		type: kind === "design" ? "design" : meta.type === "pattern" ? "pattern" : "component",
		sketchbook: String(meta.sketchbook ?? ""),
		source: String(meta.source ?? ""),
		hasHandover: fs.existsSync(path.join(dir, "handover", "HANDOVER.md")),
		memory: readDecisionsLike(path.join(dir, "memory.md")),
		stage: kind === "design" ? "design" : meta.status === "ready" ? "ready" : "sketch",
		experimental: kind === "design" ? sketchesUsedBy(dir) : [],
		parts: partsOf(dir),
		status: readStatus(kind, slug, dir),
		decisions: readDecisions(path.join(dir, "decisions.md")),
		archivedDecisions: readDecisions(path.join(dir, "decisions-archive.md")).length,
		sessions: readSessions(path.join(dir, "sessions"))
	};
};

export const getDesigns = (): Item[] => dirs(designsDir).map((slug) => readItem("design", slug));
export const getSketches = (): Item[] => dirs(sketchesDir).map((slug) => readItem("sketch", slug));

export const getItem = (kind: string, slug: string): Item | null => {
	if (kind !== "sketch" && kind !== "design") return null;
	const exists = dirs(kind === "sketch" ? sketchesDir : designsDir).includes(slug);
	return exists ? readItem(kind, slug) : null;
};

/** Absolute path of a screenshot, or null if the request is not for one */
export const screenshotPath = (kind: string, slug: string, width: string): string | null => {
	if (!/^(sketch|design)$/.test(kind) || !/^[a-z0-9-]+$/.test(slug) || !/^\d+$/.test(width))
		return null;
	const file = path.join(previewDir, "screenshots", `${kind}-${slug}-${width}.png`);
	return fs.existsSync(file) ? file : null;
};

// ---------------------------------------------------------------------------
// Sketchbooks
// ---------------------------------------------------------------------------

export interface Sketchbook {
	id: string;
	name: string;
	description: string;
}

const sketchbooksFile = path.join(sketchesDir, "sketchbooks.json");

export const getSketchbooks = (): Sketchbook[] => {
	const saved = readJson(sketchbooksFile).sketchbooks;
	return Array.isArray(saved) ? (saved as Sketchbook[]) : [];
};

/** Renames a sketchbook. Its id, and so its address, stays the same. */
export const renameSketchbook = (id: string, name: string, description?: string): boolean => {
	const books = getSketchbooks();
	const book = books.find((b) => b.id === id);
	const tidy = name.replace(/\s+/g, " ").trim().slice(0, 60);
	if (!book || !tidy) return false;
	book.name = tidy;
	if (description !== undefined) book.description = description.replace(/\s+/g, " ").trim().slice(0, 200);
	fs.writeFileSync(sketchbooksFile, JSON.stringify({ sketchbooks: books }, null, "\t") + "\n");
	return true;
};

// ---------------------------------------------------------------------------
// Design system candidates from other projects
// ---------------------------------------------------------------------------

export interface Candidate {
	name: string;
	path: string;
	usedIn: number;
	builtOn: string[];
	suggestion: string;
	why: string;
	rawValues: number;
	similarTo: string;
	triage: "undecided" | "candidate" | "not-suitable";
	note: string;
	sketch: string;
}

export interface CandidateRegister {
	project: string;
	projectName: string;
	scannedAt: string;
	commit: string;
	/** What the latest scan found that the one before had not, and the reverse */
	changes?: { since: string; added: string[]; removed: string[] };
	candidates: Candidate[];
}

export const getCandidateRegisters = (): CandidateRegister[] => {
	const dir = path.join(root, "candidates");
	if (!fs.existsSync(dir)) return [];
	const sketches = new Set(dirs(sketchesDir));
	return fs
		.readdirSync(dir)
		.filter((name) => name.endsWith(".json"))
		.sort()
		.map((name) => readJson(path.join(dir, name)) as unknown as CandidateRegister)
		.filter((register) => Array.isArray(register.candidates))
		.map((register) => ({
			...register,
			// a sketch may have been deleted since the last scan
			candidates: register.candidates.map((c) => ({ ...c, sketch: sketches.has(c.sketch) ? c.sketch : "" }))
		}));
};

// ---------------------------------------------------------------------------
// Actions from the workspace pages
// ---------------------------------------------------------------------------

/** Designs and patterns that are built on a sketch, so it cannot be deleted yet */
export const getUsersOf = (slug: string): { kind: Kind; slug: string; title: string; type: Item["type"] }[] =>
	[...getDesigns(), ...getSketches().filter((item) => item.slug !== slug)]
		.filter((item) =>
			sketchesUsedBy(path.join(item.kind === "sketch" ? sketchesDir : designsDir, item.slug)).includes(slug)
		)
		.map(({ kind, slug: user, title, type }) => ({ kind, slug: user, title, type }));

/**
 * Runs one of the workspace's own commands (scripts/<name>.ts), the same one
 * Kiro runs, so a button on a page and a request in chat always behave alike.
 */
export const runScript = (name: string, args: string[]): { ok: boolean; output: string } => {
	const result = spawnSync(
		process.execPath,
		[path.join(root, "node_modules", "tsx", "dist", "cli.mjs"), path.join(root, "scripts", `${name}.ts`), ...args],
		{ cwd: root, encoding: "utf8", timeout: 300_000 }
	);
	return { ok: result.status === 0, output: `${result.stdout ?? ""}${result.stderr ?? ""}`.trim() };
};
