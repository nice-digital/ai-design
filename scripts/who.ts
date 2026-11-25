/**
 * Who is working in this copy of the workspace. Used to attribute decisions
 * and session notes, and so the agent can address the designer by name.
 *
 *   npm run who                   prints the name, or says none is set
 *   npm run who -- "Sam Patel"    sets it (for this copy of the workspace only)
 */
import { execSync } from "child_process";
import path from "path";

const root = path.join(__dirname, "..");
const name = process.argv.slice(2).join(" ").trim();

const current = (): string => {
	try {
		return execSync("git config user.name", { cwd: root, encoding: "utf8" }).trim();
	} catch {
		return "";
	}
};

if (name) {
	if (name.length > 60 || /[|\n]/.test(name)) {
		console.error("Use a plain name of up to 60 characters.");
		process.exit(1);
	}
	execSync(`git config --local user.name ${JSON.stringify(name)}`, { cwd: root });
	console.log(`Working with: ${name}`);
} else {
	const who = current();
	console.log(who ? `Working with: ${who}` : "No name set. Ask the designer their name, then: npm run who -- \"Their Name\"");
	if (!who) process.exit(1);
}
