/**
 * Outside sources the workspace draws on, declared once in sources.json.
 *
 *   npm run sources                      list them and whether each is available
 *   npm run sources -- sync              fetch or update every git project
 *   npm run sources -- sync next-web     just one
 *
 * Git projects are cloned read-only into .sources/<id>/ (not committed, safe to
 * delete). The workspace reads from git, not from whatever happens to be
 * checked out next to it, so everyone scans the same code: the named branch as
 * it is on the server. Nothing is ever pushed, and nothing outside .sources/
 * is touched.
 *
 * To make the workspace aware of another project, add an entry to
 * sources.json. "use" says what it is for:
 *   candidates          scanned by `npm run candidates` for design system candidates
 *   design-system-docs  usage guidance for `npm run catalogue`
 *   reference           fetched for the agent to read, nothing else
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

export const root = path.join(__dirname, "..");
const cacheDir = path.join(root, ".sources");

export interface SourceProject {
	id: string;
	name: string;
	git: string;
	branch: string;
	use: "candidates" | "design-system-docs" | "reference";
	/** Where the source code starts inside the project, e.g. "web/src" */
	sourceRoot?: string;
	/** Folder of components inside sourceRoot ("." for sourceRoot itself) */
	components?: string;
	about: string;
}

export const readSources = (): SourceProject[] =>
	JSON.parse(fs.readFileSync(path.join(root, "sources.json"), "utf8")).projects;

/** Folder holding a fetched project, or null if it has not been fetched */
export const sourceDir = (id: string): string | null => {
	const dir = path.join(cacheDir, id);
	return fs.existsSync(path.join(dir, ".git")) ? dir : null;
};

export const sourceCommit = (id: string): string => {
	const dir = sourceDir(id);
	if (!dir) return "";
	const result = spawnSync("git", ["-C", dir, "log", "-1", "--format=%h %cs"], { encoding: "utf8" });
	return result.stdout.trim();
};

const git = (args: string[]) => spawnSync("git", args, { encoding: "utf8", env: { ...process.env, GIT_TERMINAL_PROMPT: "0" } });

export const syncSource = (project: SourceProject): { ok: boolean; message: string } => {
	if (!/^[a-z0-9-]+$/.test(project.id)) return { ok: false, message: "id must be lowercase letters, numbers and hyphens" };
	const dir = path.join(cacheDir, project.id);
	fs.mkdirSync(cacheDir, { recursive: true });

	if (fs.existsSync(path.join(dir, ".git"))) {
		const fetch = git(["-C", dir, "fetch", "--depth", "1", "origin", project.branch]);
		if (fetch.status !== 0) return { ok: false, message: fetch.stderr.trim().split("\n").pop() ?? "fetch failed" };
		// .sources/ is a throwaway mirror, so matching the server exactly is the point
		git(["-C", dir, "reset", "--hard", "FETCH_HEAD"]);
		return { ok: true, message: `updated to ${sourceCommit(project.id)}` };
	}

	fs.rmSync(dir, { recursive: true, force: true });
	const clone = git(["clone", "--depth", "1", "--branch", project.branch, "--single-branch", project.git, dir]);
	if (clone.status !== 0)
		return {
			ok: false,
			message: `${clone.stderr.trim().split("\n").pop() ?? "clone failed"}. If the project is private, this machine needs access to it`
		};
	return { ok: true, message: `fetched at ${sourceCommit(project.id)}` };
};

if (require.main === module) {
	const [command, only] = process.argv.slice(2);
	const projects = readSources();

	if (command === "sync") {
		const chosen = projects.filter((p) => !only || p.id === only);
		if (!chosen.length) {
			console.error(`No project with the id "${only}" in sources.json`);
			process.exit(1);
		}
		let failed = 0;
		for (const project of chosen) {
			const result = syncSource(project);
			if (!result.ok) failed++;
			console.log(`${result.ok ? "OK  " : "FAIL"} ${project.id}: ${result.message}`);
		}
		process.exit(failed ? 1 : 0);
	}

	for (const project of projects)
		console.log(
			`${project.id}  (${project.use})  ${sourceDir(project.id) ? `fetched, ${sourceCommit(project.id)}` : "not fetched: npm run sources -- sync"}\n    ${project.git} @ ${project.branch}`
		);
	const references = JSON.parse(fs.readFileSync(path.join(root, "sources.json"), "utf8")).references as { name: string; url: string }[];
	console.log(`\nReference sites the agent may read:\n${references.map((r) => `    ${r.name}: ${r.url}`).join("\n")}`);
}
