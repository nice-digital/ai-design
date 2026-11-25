import fs from "fs";
import path from "path";

export const root = path.join(__dirname, "..");
export const sketchesDir = path.join(root, "sketches");
export const designsDir = path.join(root, "prototype", "pages", "designs");
export const previewDir = path.join(root, ".preview");

export interface Target {
	kind: "sketch" | "design";
	slug: string;
	dir: string;
	url: string;
	/**
	 * "sketch" = loose rules for trying out an idea.
	 * "compose" = full rules: all designs, and sketches marked ready for use in designs.
	 */
	tier: "sketch" | "compose";
	/**
	 * Sketches only. "component" = one new building block.
	 * "pattern" = a larger piece composed from design system components and ready sketches.
	 */
	type: "component" | "pattern" | "design";
	meta: Record<string, unknown>;
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

export const getTargets = (only?: string): Target[] => {
	const sketches = dirs(sketchesDir).map((slug): Target => {
		const dir = path.join(sketchesDir, slug);
		const meta = readJson(path.join(dir, "sketch.json"));
		return {
			kind: "sketch",
			slug,
			dir,
			url: `/sketches/${slug}`,
			tier: meta.status === "ready" ? "compose" : "sketch",
			type: meta.type === "pattern" ? "pattern" : "component",
			meta
		};
	});
	const designs = dirs(designsDir).map((slug): Target => {
		const dir = path.join(designsDir, slug);
		return {
			kind: "design",
			slug,
			dir,
			url: `/designs/${slug}`,
			tier: "compose",
			type: "design",
			meta: readJson(path.join(dir, "design.json"))
		};
	});
	return [...sketches, ...designs].filter((t) => !only || t.slug === only);
};

export const filesIn = (dir: string, pattern: RegExp): string[] =>
	fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const full = path.join(dir, entry.name);
		// A sketch's hand-over package and session notes live in its folder but are not part of its source
		if (entry.isDirectory()) return ["handover", "sessions"].includes(entry.name) ? [] : filesIn(full, pattern);
		return pattern.test(entry.name) ? [full] : [];
	});

export interface Problem {
	/** Sketch or design the problem belongs to */
	target: string;
	/** Short name of the rule that failed */
	rule: string;
	/** What is wrong, in a form that can be fixed without more context */
	message: string;
	file?: string;
	/** Worth knowing and worth fixing, but does not fail the check */
	warning?: boolean;
}

/**
 * Screen widths every sketch and design is checked at, smallest first.
 * 320 is the width WCAG's reflow requirement is measured at; the rest are
 * xs, sm, md and lg from nds-core/scss/media-queries.
 */
export const widths = [320, 400, 600, 900, 1200];

// ---------------------------------------------------------------------------
// Sketchbooks: named groups of related sketches
// ---------------------------------------------------------------------------

export interface Sketchbook {
	/** Stable, never changes. The name can. */
	id: string;
	name: string;
	description: string;
}

/**
 * Only the sketchbooks' names live here. Which sketchbook a sketch belongs to
 * is recorded in the sketch's own sketch.json ("sketchbook": "<id>"), so
 * deleting a sketch's folder leaves nothing behind.
 */
export const sketchbooksFile = path.join(sketchesDir, "sketchbooks.json");

export const readSketchbooks = (): Sketchbook[] => {
	const saved = readJson(sketchbooksFile).sketchbooks;
	return Array.isArray(saved) ? (saved as Sketchbook[]) : [];
};

export const writeSketchbooks = (sketchbooks: Sketchbook[]) => {
	fs.mkdirSync(sketchesDir, { recursive: true });
	fs.writeFileSync(
		sketchbooksFile,
		JSON.stringify({ sketchbooks: sketchbooks.map(({ id, name, description }) => ({ id, name, description })) }, null, "\t") + "\n"
	);
};

/** Sets or clears one field of a sketch's or design's json file */
export const setMeta = (target: Target, field: string, value: string) => {
	const file = path.join(target.dir, `${target.kind}.json`);
	const meta = readJson(file);
	meta[field] = value;
	fs.writeFileSync(file, JSON.stringify(meta, null, "\t") + "\n");
};

export const tidyName = (value: string) => value.replace(/\s+/g, " ").trim().slice(0, 60);
