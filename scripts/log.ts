/**
 * The decision log and session notes for a sketch or design.
 *
 *   npm run log -- decision design guidance-feedback "Filters start collapsed on mobile" --why "Keeps results visible on a small screen"
 *   npm run log -- session  design guidance-feedback --asked "..." --changed "..." --open "..."
 *   npm run log -- show     design guidance-feedback
 *   npm run log -- remember design guidance-feedback "For clinicians checking guidance between appointments"
 *
 * Everything is stored inside the sketch's or design's own folder, so deleting
 * the folder removes all of it. Kept small on purpose, so it is quick for people to read and cheap for an
 * AI agent to load:
 *
 *   decisions.md           the latest 25 decisions, one line each, newest first.
 *                          This is the only file an agent reads at the start of work.
 *   decisions-archive.md   older decisions, moved here automatically. Read on request only.
 *   memory.md              background that is not a decision (who it is for, constraints,
 *                          findings, links): at most 15 one-line notes. Read with
 *                          decisions.md at the start of work.
 *   sessions/<date>-<who>.md   one short note per person per day (what was asked, what
 *                          changed, what is still open). Updated, not added to, during
 *                          the day. Read on request only.
 *
 * Full conversations are not stored: the notes are the record.
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

import { getTargets, root } from "./targets";

export const MAX_DECISIONS = 25;
const MAX_MEMORY = 15;
const MAX_DECISION = 160;
const MAX_WHY = 200;
const MAX_FIELD = 400;

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => {
	const index = args.indexOf(`--${name}`);
	return index > -1 ? args[index + 1] : undefined;
};
const flagNames = ["why", "who", "asked", "changed", "open"];
const positional = args.filter(
	(arg, index) => !arg.startsWith("--") && !flagNames.includes((args[index - 1] ?? "").replace(/^--/, ""))
);
const [command, kind, slug, text] = positional;

const usage = () => {
	console.error(`Usage:
  npm run log -- decision <sketch|design> <name> "What was decided" --why "The reason"
  npm run log -- session  <sketch|design> <name> --asked "..." --changed "..." --open "..."
  npm run log -- show     <sketch|design> <name>
  npm run log -- remember <sketch|design> <name> "Background worth knowing"`);
	process.exit(1);
};

const target = getTargets().find((t) => t.kind === kind && t.slug === slug);
if (!["decision", "remember", "session", "show"].includes(command) || !target) {
	if (kind && slug && !target) console.error(`There is no ${kind} called "${slug}".\n`);
	usage();
}

const today = new Date().toISOString().slice(0, 10);
const who = (
	flag("who") ??
	(() => {
		try {
			return execSync("git config user.name", { cwd: root, encoding: "utf8" }).trim();
		} catch {
			return "";
		}
	})() ??
	""
).trim();

if (command !== "show" && (!who || /^(unknown|user|root|admin|kiro|designer)$/i.test(who))) {
	console.error(
		'No name is set for the person doing this work, so the entry cannot be attributed.\nAsk the designer their name, then run: npm run who -- "Their Name"'
	);
	process.exit(1);
}

/** One line, no table-breaking characters */
const tidy = (value: string) => value.replace(/\s+/g, " ").replace(/\|/g, "/").trim();
const tooLong = (label: string, value: string, max: number) => {
	if (value.length > max) {
		console.error(
			`${label} is ${value.length} characters; the limit is ${max}. Say it more briefly: the log stays useful by staying short.`
		);
		process.exit(1);
	}
};

const title = String(target!.meta.title ?? slug);
const itemDir = target!.dir;
const decisionsFile = path.join(itemDir, "decisions.md");
const memoryFile = path.join(itemDir, "memory.md");
const archiveFile = path.join(itemDir, "decisions-archive.md");
const sessionsDir = path.join(itemDir, "sessions");

const entries = (file: string): string[] =>
	fs.existsSync(file)
		? fs
				.readFileSync(file, "utf8")
				.split("\n")
				.filter((line) => line.startsWith("- "))
		: [];

const header = (heading: string, note: string) => `# ${heading}: ${title}\n\n${note}\n\n`;

if (command === "remember") {
	// Background that is not a decision: who it is for, constraints, findings, links
	if (!text) usage();
	const fact = tidy(text);
	tooLong("The note", fact, MAX_WHY);
	const all = [`- ${today} | ${tidy(who)} | ${fact}`, ...entries(memoryFile)];
	if (all.length > MAX_MEMORY) {
		console.error(
			`The memory for this ${kind} is full (${MAX_MEMORY} notes). It is meant to stay short. Remove one that no longer matters from ${path.relative(root, memoryFile)} first.`
		);
		process.exit(1);
	}
	fs.writeFileSync(
		memoryFile,
		header(
			"Memory",
			`Background worth knowing before working on this, newest first: date | who | note. At most ${MAX_MEMORY}.\nAdd with \`npm run log -- remember\`. Delete a line by hand when it stops being true.`
		) +
			all.join("\n") +
			"\n"
	);
	console.log(`Remembered for ${kind} "${slug}": ${fact}`);
} else if (command === "decision") {
	if (!text) usage();
	const decision = tidy(text);
	const why = tidy(flag("why") ?? "");
	if (!why) {
		console.error('A decision needs a reason: add --why "..."');
		process.exit(1);
	}
	tooLong("The decision", decision, MAX_DECISION);
	tooLong("The reason", why, MAX_WHY);

	const all = [`- ${today} | ${tidy(who)} | ${decision} | ${why}`, ...entries(decisionsFile)];
	const keep = all.slice(0, MAX_DECISIONS);
	const overflow = all.slice(MAX_DECISIONS);

	fs.writeFileSync(
		decisionsFile,
		header(
			"Decisions",
			`The latest ${MAX_DECISIONS} decisions, newest first: date | who | what was decided | why.\nAdd with \`npm run log\`, not by hand. Older decisions are in decisions-archive.md.`
		) +
			keep.join("\n") +
			"\n"
	);
	if (overflow.length)
		fs.writeFileSync(
			archiveFile,
			header("Older decisions", "Moved here automatically from decisions.md, newest first.") +
				[...overflow, ...entries(archiveFile)].join("\n") +
				"\n"
		);
	console.log(`Logged for ${kind} "${slug}": ${decision}`);
} else if (command === "session") {
	const fields = {
		asked: tidy(flag("asked") ?? ""),
		changed: tidy(flag("changed") ?? ""),
		open: tidy(flag("open") ?? "")
	};
	if (!fields.asked || !fields.changed) {
		console.error('A session note needs --asked "..." and --changed "..." (and --open "..." if anything is unresolved)');
		process.exit(1);
	}
	for (const [name, value] of Object.entries(fields)) tooLong(`--${name}`, value, MAX_FIELD);

	fs.mkdirSync(sessionsDir, { recursive: true });
	const whoSlug = tidy(who).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";
	// One note per person per day: a later save replaces the earlier note
	const file = path.join(sessionsDir, `${today}-${whoSlug}.md`);
	fs.writeFileSync(
		file,
		`# ${today}, ${tidy(who)}: ${title}\n\n- Asked for: ${fields.asked}\n- What changed: ${fields.changed}\n- Still open: ${fields.open || "Nothing"}\n`
	);
	console.log(`Session note saved: ${path.relative(root, file)}`);
} else {
	const list = entries(decisionsFile);
	console.log(list.length ? `Decisions:\n${list.join("\n")}` : `No decisions logged yet for ${kind} "${slug}".`);
	const archived = entries(archiveFile).length;
	if (archived) console.log(`(${archived} older decision(s) in decisions-archive.md)`);
	const memory = entries(memoryFile);
	if (memory.length) console.log(`\nMemory:\n${memory.join("\n")}`);
}
