/**
 * Deletes a sketch or a design and everything generated from it.
 *
 *   npm run remove -- sketch character-count          shows what would be deleted
 *   npm run remove -- sketch character-count --yes    deletes it
 *   npm run remove -- design guidance-feedback --yes
 *
 * A sketch that a design still uses cannot be deleted: remove it from the
 * design (or delete the design) first.
 *
 * Everything about a sketch or design is inside its own folder (decisions,
 * memory, session notes, and a sketch's hand-over package), so this is the same
 * as deleting the folder, plus the safety check above and a tidy of local
 * screenshots. Nothing in Figma is touched, and work that was saved can be restored from history.
 */
import fs from "fs";
import path from "path";

import { filesIn, getTargets, previewDir, root } from "./targets";

const args = process.argv.slice(2);
const confirmed = args.includes("--yes");
const [kind, slug] = args.filter((arg) => !arg.startsWith("--"));

const target = getTargets().find((t) => t.kind === kind && t.slug === slug);
if (!target) {
	const existing = getTargets().map((t) => `${t.kind} ${t.slug}`);
	console.error(
		`Usage: npm run remove -- sketch <name> [--yes]\n       npm run remove -- design <name> [--yes]\n\n${
			kind && slug ? `There is no ${kind} called "${slug}".\n` : ""
		}What exists:\n${existing.map((e) => `  ${e}`).join("\n") || "  nothing"}`
	);
	process.exit(1);
}

if (target.kind === "sketch") {
	const usedBy = getTargets()
		// designs, and patterns, can both be built on a sketch
		.filter((t) => !(t.kind === "sketch" && t.slug === slug))
		.filter((t) =>
			filesIn(t.dir, /\.(tsx?|scss)$/).some((file) =>
				new RegExp(`@sketches/${slug}(["'/]|$)`, "m").test(fs.readFileSync(file, "utf8"))
			)
		)
		.map((t) => `the ${t.type === "pattern" ? "pattern" : t.kind} "${t.slug}"`);
	if (usedBy.length) {
		console.error(
			`Cannot delete the sketch "${slug}": it is used by ${usedBy.join(" and ")}.\nReplace it there (or delete ${
				usedBy.length > 1 ? "those" : "that"
			}) first.`
		);
		process.exit(1);
	}
}

const generated = [
	path.join(previewDir, "browser", `${target.kind}-${slug}.json`),
	path.join(previewDir, "status", `${target.kind}-${slug}.json`),
	...(fs.existsSync(path.join(previewDir, "screenshots"))
		? fs
				.readdirSync(path.join(previewDir, "screenshots"))
				.filter((file) => new RegExp(`^${target.kind}-${slug}-\\d+\\.png$`).test(file))
				.map((file) => path.join(previewDir, "screenshots", file))
		: [])
].filter((file) => fs.existsSync(file));

// Everything about a sketch or design lives in its own folder: source, decisions,
// memory, session notes and (for a sketch) its hand-over package
const folders = [target.dir];

console.log(`${confirmed ? "Deleting" : "This would delete"} the ${target.kind} "${slug}":`);
for (const dir of folders)
	console.log(`  ${path.relative(root, dir)}/  (everything in it, including its decisions, memory${target.kind === "sketch" ? " and any hand-over package" : ""})`);
if (generated.length) console.log(`  ${generated.length} screenshot and report file(s)`);

if (!confirmed) {
	console.log(`\nNothing has been deleted. To go ahead: npm run remove -- ${kind} ${slug} --yes`);
	process.exit(0);
}

// Retries: a running preview or an editor can hold a file open for a moment,
// which on Windows makes the first attempt fail
for (const dir of folders) fs.rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
for (const dir of folders)
	if (fs.existsSync(dir)) {
		console.error(`Cannot finish deleting ${path.relative(root, dir)}: something still has it open.`);
		process.exit(1);
	}
for (const file of generated) fs.rmSync(file, { force: true });
console.log("\nDeleted. If it had been saved, it can be restored from history.");
