/**
 * Design system candidates: components that live in other NICE projects today
 * and could be retrofitted into the NICE Design System.
 *
 *   npm run candidates                                  scan every project marked "candidates" in sources.json
 *   npm run candidates -- next-web                      scan one
 *   npm run candidates -- --offline                     scan the copies already fetched, without going to git
 *   npm run candidates -- triage Testimonial candidate --note "Used on 3 page types"
 *   npm run candidates -- triage ProductCard not-suitable --note "Tied to the publications feed"
 *   npm run candidates -- triage Toggle undecided
 *   (add --source global-nav if the same name exists in two projects)
 *
 * Every scan first fetches the latest of each project from git (into .sources/),
 * so running it is how the register is kept fresh. Projects are never read from
 * a folder that happens to be nearby, and never changed. Each scan reports
 * which components are new and which have gone since the one before.
 *
 * Writes candidates/<project>.json (the register: scan results plus the team's
 * triage, which is kept across scans) and candidates/<project>.md (the same as a
 * table). Both are committed, so the register is available without fetching anything.
 *
 * The scan's suggestion is a heuristic from the source code. It says how
 * separable a component looks, not whether it belongs in the design system:
 * that is a design decision, recorded with `triage`.
 */
import fs from "fs";
import path from "path";

import { readSources, sourceCommit, sourceDir, syncSource, type SourceProject } from "./sources";
import { getTargets, readSketchbooks, root, setMeta, writeSketchbooks } from "./targets";

const args = process.argv.slice(2);
const flag = (name: string) => {
	const index = args.indexOf(`--${name}`);
	return index > -1 ? args[index + 1] : undefined;
};

const outDir = path.join(root, "candidates");
const projects = readSources().filter((p) => p.use === "candidates");

type Triage = "undecided" | "candidate" | "not-suitable";

interface Candidate {
	name: string;
	/** Path inside the project's source root */
	path: string;
	group: "general" | "cms-block";
	lines: number;
	hasStyles: boolean;
	hasTests: boolean;
	/** NICE Design System packages it already builds on */
	builtOn: string[];
	/** Other components from the same project it pulls in */
	usesLocal: string[];
	/** What ties it to the website: data feeds, CMS, routing, config */
	tiedTo: string[];
	/** How many other files in the project import it */
	usedIn: number;
	/** Raw values in its styles that would need converting to tokens */
	rawValues: number;
	/** A design system component with a similar name, if any */
	similarTo: string;
	suggestion: "Looks separable" | "Needs untangling" | "Tied to the website";
	why: string;
	triage: Triage;
	note: string;
	/** Name of the sketch made from it in this workspace, if any */
	sketch: string;
}

interface Register {
	project: string;
	projectName: string;
	scannedAt: string;
	commit: string;
	/** What the latest scan that found a difference added and removed */
	changes?: { since: string; added: string[]; removed: string[] };
	candidates: Candidate[];
}

const registerFile = (id: string) => path.join(outDir, `${id}.json`);

const readRegister = (project: SourceProject): Register =>
	fs.existsSync(registerFile(project.id))
		? JSON.parse(fs.readFileSync(registerFile(project.id), "utf8"))
		: { project: project.id, projectName: project.name, scannedAt: "", commit: "", candidates: [] };

const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

// ---------------------------------------------------------------------------
// triage
// ---------------------------------------------------------------------------

if (args[0] === "triage") {
	const [, name, decision] = args;
	const only = flag("source");
	const matches = projects
		.filter((p) => !only || p.id === only)
		.map((project) => {
			const register = readRegister(project);
			return { register, candidate: register.candidates.find((c) => c.name.toLowerCase() === (name ?? "").toLowerCase()) };
		})
		.filter((m) => m.candidate);

	if (matches.length !== 1 || !["candidate", "not-suitable", "undecided"].includes(decision)) {
		console.error(
			`Usage: npm run candidates -- triage <Name> candidate|not-suitable|undecided --note "Why" [--source <project>]${
				name && !matches.length ? `\nThere is no component called "${name}" in the register.` : ""
			}${matches.length > 1 ? `\n"${name}" exists in ${matches.map((m) => m.register.project).join(" and ")}: add --source.` : ""}`
		);
		process.exit(1);
	}
	const { register, candidate } = matches[0];
	candidate!.triage = decision as Triage;
	candidate!.note = (flag("note") ?? "").replace(/\s+/g, " ").trim().slice(0, 200);
	write(register);
	console.log(`${candidate!.name} (${register.project}): ${decision}${candidate!.note ? ` (${candidate!.note})` : ""}`);
	process.exit(0);
}

// ---------------------------------------------------------------------------
// scan
// ---------------------------------------------------------------------------

const walk = (dir: string, pattern: RegExp): string[] =>
	fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) return entry.name === "node_modules" || entry.name.startsWith("__") ? [] : walk(full, pattern);
		return pattern.test(entry.name) ? [full] : [];
	});

const scan = (project: SourceProject) => {
	// Always read from git, and always the latest, so the register stays fresh
	// and everyone scans the same code
	const fetched = offline ? { ok: true, message: "" } : syncSource(project);
	if (!fetched.ok) {
		if (!sourceDir(project.id)) {
			const existing = readRegister(project);
			console.error(
				`${project.name}: could not be fetched (${fetched.message}).${
					existing.candidates.length ? ` The existing register (scanned ${existing.scannedAt.slice(0, 10)}) is unchanged.` : ""
				}`
			);
			failed++;
			return;
		}
		console.error(
			`${project.name}: could not be updated from git (${fetched.message}). Scanning the copy fetched earlier (${sourceCommit(project.id)}).`
		);
	}
	if (!sourceDir(project.id)) {
		console.error(`${project.name}: has not been fetched yet. Run without --offline.`);
		failed++;
		return;
	}
	const projectDir = sourceDir(project.id)!;
	const srcDir = path.join(projectDir, project.sourceRoot ?? ".");
	const componentsDir = path.join(srcDir, project.components ?? ".");
	if (!fs.existsSync(componentsDir)) {
		console.error(`${project.name}: ${path.relative(projectDir, componentsDir)} does not exist. Check sourceRoot and components in sources.json`);
		return;
	}

const allSource = walk(srcDir, /\.(tsx?|jsx?|scss)$/).map((file) => ({ file, text: fs.readFileSync(file, "utf8") }));
const lastRegister = readRegister(project);
const previous = new Map(lastRegister.candidates.map((c) => [c.path, c]));

const candidates: Candidate[] = [];

// A component is a folder holding a .tsx or .jsx file with the folder's own name
for (const file of walk(componentsDir, /\.(tsx|jsx)$/)) {
	const dir = path.dirname(file);
	const name = path.basename(file).replace(/\.(tsx|jsx)$/, "");
	if (name !== path.basename(dir) || /\.test$/.test(name) || !/^[A-Z]/.test(name)) continue;

	const source = fs.readFileSync(file, "utf8");
	const rel = path.relative(srcDir, dir);
	const imports = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
	const styleFile = fs.readdirSync(dir).find((f) => /\.(module\.)?scss$/.test(f));
	const styles = styleFile ? fs.readFileSync(path.join(dir, styleFile), "utf8") : "";

	const tiedTo = [
		...new Set(
			imports.flatMap((specifier) => {
				if (/^@\/feeds|@\/types\/(?!.*storyblok)/i.test(specifier)) return ["NICE data feeds"];
				if (/storyblok/i.test(specifier)) return ["the CMS (Storyblok)"];
				if (/^next\/(router|navigation|headers)/.test(specifier)) return ["page routing"];
				if (/^@\/(config|logger|utils\/(?!datetime|string|array))/.test(specifier)) return ["website utilities"];
				if (/^next-seo|^@\/hooks/.test(specifier)) return ["website hooks"];
				return [];
			})
		)
	];
	const usesLocal = [
		...new Set(
			imports
				.filter((s) => /^@\/components\//.test(s) || /^\.\.\//.test(s))
				.map((s) => s.split("/").pop()!)
				.filter((n) => /^[A-Z]/.test(n) && !/\.(scss|css|svg|json)$/.test(n))
		)
	].filter((n) => n !== name);
	const builtOn = [
		...new Set(imports.map((s) => s.match(/^@nice-digital\/(nds-[a-z-]+|icons)/)?.[1]).filter((s): s is string => Boolean(s)))
	].sort();

	// Any import whose path ends in /Name/Name or /Name, whatever alias or relative path leads to it
	const importedAs = new RegExp(`from\\s+["'][^"']*/${name}(/${name})?["']`);
	const usedIn = allSource.filter(
		({ file: other, text }) =>
			!other.startsWith(dir + path.sep) && !/\.test\.(tsx?|jsx?)$/.test(other) && importedAs.test(text)
	).length;

	const rawValues =
		(styles.match(/#[0-9a-fA-F]{3,8}\b/g)?.length ?? 0) +
		(styles.match(/(?<![\w.$-])\d+px\b/g)?.filter((v) => v !== "1px" && v !== "0px").length ?? 0) +
		(styles.match(/tokens\/global/g)?.length ?? 0);

	const similarTo =
		ndsNames.find((nds) => nds === kebab(name)) ??
		ndsNames.find((nds) => nds.length > 4 && kebab(name).includes(nds) && kebab(name) !== nds) ??
		"";

	const group = rel.includes("Storyblok") ? "cms-block" : "general";
	const hardTies = tiedTo.filter((t) => t !== "the CMS (Storyblok)" || group !== "cms-block");

	let suggestion: Candidate["suggestion"];
	let why: string;
	if (tiedTo.includes("NICE data feeds") || hardTies.length >= 2) {
		suggestion = "Tied to the website";
		why = `Depends on ${tiedTo.join(" and ")}`;
	} else if (hardTies.length === 1 || usesLocal.length > 2 || group === "cms-block") {
		suggestion = "Needs untangling";
		why =
			[
				tiedTo.length ? `uses ${tiedTo.join(" and ")}` : "",
				usesLocal.length ? `pulls in ${usesLocal.length} other website component${usesLocal.length === 1 ? "" : "s"}` : ""
			]
				.filter(Boolean)
				.join("; ") || "CMS block: the layout may be reusable once separated from its content fields";
		why = why[0].toUpperCase() + why.slice(1);
	} else {
		suggestion = "Looks separable";
		why = `No ties to the project's data${builtOn.length ? `; already builds on ${builtOn.join(", ")}` : ""}`;
	}

	const before = previous.get(rel);
	// A sketch records where it came from in its own sketch.json ("source")
	const sketch = sketches.find((t) => String(t.meta.source ?? "") === `${project.id}:${rel.split(path.sep).join("/")}`)?.slug ?? "";

	candidates.push({
		name,
		path: rel.split(path.sep).join("/"),
		group,
		lines: source.split("\n").length,
		hasStyles: Boolean(styleFile),
		hasTests: fs.readdirSync(dir).some((f) => /\.test\.(tsx?|jsx?)$/.test(f)),
		builtOn,
		usesLocal,
		tiedTo,
		usedIn,
		rawValues,
		similarTo,
		suggestion,
		why,
		triage: before?.triage ?? "undecided",
		note: before?.note ?? "",
		sketch
	});
}

	const order = { "Looks separable": 0, "Needs untangling": 1, "Tied to the website": 2 };
candidates.sort((a, b) => order[a.suggestion] - order[b.suggestion] || b.usedIn - a.usedIn || a.name.localeCompare(b.name));

	// What changed since the scan before. Kept until a later scan finds a change.
	const now = new Set(candidates.map((c) => c.path));
	const added = lastRegister.scannedAt ? candidates.filter((c) => !previous.has(c.path)).map((c) => c.name) : [];
	const gone = lastRegister.candidates.filter((c) => !now.has(c.path));
	const changes =
		added.length || gone.length
			? { since: lastRegister.scannedAt, added, removed: gone.map((c) => c.name) }
			: lastRegister.changes;

	const register: Register = {
		project: project.id,
		projectName: project.name,
		scannedAt: new Date().toISOString(),
		commit: sourceCommit(project.id),
		...(changes ? { changes } : {}),
		candidates
	};
	write(register);

	if (added.length) console.log(`${project.name}: new since the last scan: ${added.join(", ")}`);
	if (gone.length)
		console.log(
			`${project.name}: no longer in the project: ${gone
				.map((c) => `${c.name}${c.triage !== "undecided" ? ` (the team had marked it "${c.triage}"${c.note ? `: ${c.note}` : ""})` : ""}`)
				.join(", ")}`
		);
	if (lastRegister.scannedAt && !added.length && !gone.length) console.log(`${project.name}: no components added or removed since the last scan.`);

	const count = (s: Candidate["suggestion"]) => candidates.filter((c) => c.suggestion === s).length;
	console.log(
		`${project.name}: ${candidates.length} components at ${register.commit}. ${count("Looks separable")} look separable, ${count("Needs untangling")} need untangling, ${count("Tied to the website")} are tied to the project. Register: candidates/${project.id}.md`
	);
};

const offline = args.includes("--offline");
let failed = 0;
const wanted = args.find((arg) => !arg.startsWith("--") && args[args.indexOf(arg) - 1] !== "--source");
const chosen = projects.filter((p) => !wanted || p.id === wanted);
if (!chosen.length) {
	console.error(`No project called "${wanted}" is marked "candidates" in sources.json. Available: ${projects.map((p) => p.id).join(", ")}`);
	process.exit(1);
}
const ndsNames = fs
	.readdirSync(path.join(root, "node_modules", "@nice-digital"))
	.filter((name) => name.startsWith("nds-"))
	.map((name) => name.replace("nds-", ""));
const sketches = getTargets().filter((t) => t.kind === "sketch");

for (const project of chosen) scan(project);

// Sketches retrofitted from another project belong in the "Design system
// candidates" sketchbook unless someone has filed them elsewhere
const CANDIDATES_BOOK = "design-system-candidates";
const retrofitted = sketches.filter((t) => String(t.meta.source ?? "").includes(":") && !t.meta.sketchbook);
if (retrofitted.length) {
	const books = readSketchbooks();
	if (!books.some((book) => book.id === CANDIDATES_BOOK))
		writeSketchbooks([
			...books,
			{
				id: CANDIDATES_BOOK,
				name: "Design system candidates",
				description: "Components brought in from other NICE projects to be retrofitted for the design system"
			}
		]);
	for (const sketch of retrofitted) setMeta(sketch, "sketchbook", CANDIDATES_BOOK);
	console.log(`Filed in the "Design system candidates" sketchbook: ${retrofitted.map((t) => t.slug).join(", ")}`);
}

if (failed) process.exitCode = 1;

// ---------------------------------------------------------------------------

function write(register: Register) {
	fs.mkdirSync(outDir, { recursive: true });
	fs.writeFileSync(registerFile(register.project), JSON.stringify(register, null, "\t") + "\n");

	const row = (c: Candidate) =>
		`| ${c.name} | \`${c.path}\` | ${c.usedIn} | ${c.builtOn.join(", ") || "-"} | ${c.why}${
			c.rawValues ? `. ${c.rawValues} raw style value${c.rawValues === 1 ? "" : "s"} to convert` : ""
		}${c.similarTo ? `. Compare with NDS ${c.similarTo}` : ""} | ${
			c.triage === "undecided" ? "-" : c.triage === "candidate" ? "Candidate" : "Not suitable"
		}${c.note ? `: ${c.note}` : ""} | ${c.sketch || "-"} |`;

	const section = (title: string, intro: string, suggestion: Candidate["suggestion"]) => {
		const rows = register.candidates.filter((c) => c.suggestion === suggestion);
		return `## ${title} (${rows.length})\n\n${intro}\n\n| Component | Path | Used in | Builds on | What the scan found | Team's view | Sketch |\n|---|---|---|---|---|---|---|\n${rows.map(row).join("\n")}\n`;
	};

	fs.writeFileSync(
		path.join(outDir, `${register.project}.md`),
		`<!-- Generated by \`npm run candidates\`. Do not edit: record the team's view with \`npm run candidates -- triage\`. -->

# Design system candidates in ${register.projectName}

Components that live in ${register.projectName} and are not in the NICE Design System. Scanned ${register.scannedAt.slice(0, 10)}${register.commit ? ` from git at ${register.commit}` : ""}.

"What the scan found" is a reading of the source code: how separable the component looks. Whether it belongs in the design system is the team's call, recorded under "Team's view". "Used in" counts the other files in the project that import it. "Sketch" names the sketch made from it in this workspace, if there is one.

${section("Look separable", "No ties to the project's data. The easiest to retrofit.", "Looks separable")}
${section("Need untangling", "Reusable layout or behaviour mixed with CMS fields or other components from the project. The reusable part has to be separated out.", "Needs untangling")}
${section("Tied to the project", "Depend on data feeds or several of the project's services. Usually better left where they are, though a generic piece inside may be worth extracting.", "Tied to the website")}`
	);
}
