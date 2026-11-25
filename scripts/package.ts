/**
 * Turns a ready sketch into a hand-over package for the NICE Design System.
 *
 *   npm run package -- character-count
 *
 * Nothing is sent anywhere. The result is a folder inside the sketch,
 * sketches/<name>/handover/, laid out like the nice-design-system monorepo, for
 * a developer to copy in by hand. It lives with the sketch so that deleting the
 * sketch removes it too.
 *
 *   sketches/<name>/handover/
 *     HANDOVER.md                                  what to copy and the manual edits to make
 *     components/nds-<name>/                       the component package
 *       package.json, tsconfig.json, README.md
 *       src/<Name>.tsx, src/<Name>.test.tsx
 *       scss/<name>.scss
 *     docs/pages/components/<name>.mdx             the docs page
 *     docs/components/examples/<Name>.tsx          live examples for the docs page
 *
 * Generated every run (do not edit): package.json, tsconfig.json, src/<Name>.tsx,
 * scss/<name>.scss, HANDOVER.md. They are converted from the sketch, so change the sketch.
 * Written once as templates, then yours to complete: the test, README, docs page and examples.
 *
 * The package is then verified here: no unfinished templates, type check, style
 * rules, and its tests run with the same Jest setup the design system uses.
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

import { filesIn, getTargets, previewDir, root } from "./targets";

const slug = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
const sketch = slug ? getTargets(slug).find((t) => t.kind === "sketch") : undefined;

if (!sketch) {
	console.error(`Usage: npm run package -- <sketch-name>${slug ? `\nNo sketch called "${slug}"` : ""}`);
	process.exit(1);
}
if (sketch.tier !== "compose") {
	console.error(
		`"${slug}" is still a sketch. Set "status": "ready" in sketches/${slug}/sketch.json and make "npm run check -- ${slug}" pass first.`
	);
	process.exit(1);
}

const usesSketches = [
	...new Set(
		filesIn(sketch.dir, /\.tsx?$/).flatMap((file) =>
			[...fs.readFileSync(file, "utf8").matchAll(/@sketches\/([a-z0-9-]+)/g)].map((m) => m[1])
		)
	)
];
if (usesSketches.length) {
	console.error(
		`"${slug}" is a pattern that uses ${usesSketches.length === 1 ? "a sketch" : "sketches"} not yet in the design system: ${usesSketches.join(", ")}.\nHand over and release ${usesSketches.length === 1 ? "that" : "those"} first. Then this pattern can import the published ${usesSketches.length === 1 ? "package" : "packages"} and be handed over itself.`
	);
	process.exit(1);
}

const pascal = slug!
	.split("-")
	.map((part) => part[0].toUpperCase() + part.slice(1))
	.join("");
const title = String(sketch.meta.title ?? slug);
const description = String(sketch.meta.description ?? "");
const pkgName = `@nice-digital/nds-${slug}`;

const outDir = path.join(sketch.dir, "handover");
const pkgDir = path.join(outDir, "components", `nds-${slug}`);
const rel = (file: string) => path.relative(root, file);

const read = (file: string) => fs.readFileSync(file, "utf8");
const write = (file: string, content: string) => {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, content);
};
/** For files a person or the agent completes: never overwrite */
const writeOnce = (file: string, content: string) => {
	if (!fs.existsSync(file)) write(file, content);
};
const installedVersion = (name: string): string =>
	JSON.parse(read(path.join(root, "node_modules", name, "package.json"))).version;

// ---------------------------------------------------------------------------
// 1. Convert the component: CSS modules -> the design system's global BEM classes
// ---------------------------------------------------------------------------

const sourceFiles = filesIn(sketch.dir, /\.tsx?$/).filter(
	(file) => !["demo.tsx", "index.ts"].includes(path.basename(file))
);
const moduleStyles = filesIn(sketch.dir, /\.module\.scss$/);
const tokensFile = path.join(sketch.dir, "_tokens.scss");
const hasTokens = fs.existsSync(tokensFile);

const dependencies = new Set<string>(["@nice-digital/nds-core"]);

fs.rmSync(path.join(pkgDir, "scss"), { recursive: true, force: true });
for (const file of fs.existsSync(path.join(pkgDir, "src")) ? fs.readdirSync(path.join(pkgDir, "src")) : [])
	if (!/\.test\.tsx$/.test(file) && !file.startsWith("__")) fs.rmSync(path.join(pkgDir, "src", file));

const scssName = (moduleFile: string) =>
	path
		.basename(moduleFile, ".module.scss")
		.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
		.toLowerCase();

for (const file of sourceFiles) {
	let source = read(file);

	for (const [, specifier] of source.matchAll(/from\s+["']([^"']+)["']/g)) {
		const name = specifier.match(/^(@nice-digital\/[^/]+|classnames)/)?.[1];
		if (name) dependencies.add(name);
	}

	source = source
		// import styles from "./Name.module.scss"  ->  import "./../scss/name.scss"
		.replace(
			/import\s+\w+\s+from\s+["']\.\/([\w-]+)\.module\.scss["'];?/g,
			(_, name: string) => `import "./../scss/${scssName(name + ".module.scss")}.scss";`
		)
		// [styles["a--b"]]: x  ->  "a--b": x     and     styles["a"] / styles.a  ->  "a"
		.replace(/\[styles\[(["'])([^"']+)\1\]\]/g, '"$2"')
		.replace(/styles\[(["'])([^"']+)\1\]/g, '"$2"')
		.replace(/\[styles\.([A-Za-z_]\w*)\]/g, '"$1"')
		.replace(/styles\.([A-Za-z_]\w*)/g, '"$1"');

	if (/\bstyles\b/.test(source.replace(/["'`][^"'`\n]*["'`]/g, "")))
		console.warn(
			`Warning: ${rel(file)} uses "styles" in a way that could not be converted automatically. Use styles["class-name"] with literal class names in the sketch.`
		);

	write(path.join(pkgDir, "src", path.basename(file)), source);
}

for (const file of moduleStyles) {
	let source = read(file);
	if (hasTokens)
		source = source
			.replace(/^@use\s+["']\.?\/?_?tokens["'].*$\n?/m, "")
			.replace(/\btokens\.\$/g, "colours.$");
	if (hasTokens && !/nds-core\/scss\/colours["']/.test(source))
		source = `@use '@nice-digital/nds-core/scss/colours';\n${source}`;
	if (!source.includes("@group"))
		source = `////\n/// @group components\n////\n\n${source}`;
	write(path.join(pkgDir, "scss", `${scssName(file)}.scss`), source);
}

// ---------------------------------------------------------------------------
// 2. Package files
// ---------------------------------------------------------------------------

const dependencyVersions = Object.fromEntries(
	[...dependencies].sort().map((name) => [name, `^${installedVersion(name)}`])
);

write(
	path.join(pkgDir, "package.json"),
	JSON.stringify(
		{
			name: pkgName,
			version: "0.1.0",
			description: `${title} component for the NICE Design System`,
			keywords: slug!.split("-"),
			homepage: "https://design-system.nice.org.uk/",
			license: "MIT",
			main: `es/${pascal}.js`,
			types: `es/${pascal}.d.ts`,
			style: `scss/${slug}.scss`,
			directories: { lib: "es", test: "__tests__" },
			files: ["es", "scss", "*.d.ts"],
			repository: {
				type: "git",
				url: "git+https://github.com/nice-digital/nice-design-system.git"
			},
			bugs: { url: "https://github.com/nice-digital/nice-design-system/issues" },
			dependencies: dependencyVersions,
			peerDependencies: {
				react: "^16 || ^17 || ^18",
				"react-dom": "^16 || ^17 || ^18"
			},
			devDependencies: {
				"@testing-library/jest-dom": "^5.16.5",
				"@testing-library/react": "^13.4.0",
				"@testing-library/user-event": "^14.4.3",
				"@types/jest": "^29.2.2",
				typescript: "^5.9.3"
			}
		},
		null,
		"\t"
	) + "\n"
);

write(
	path.join(pkgDir, "tsconfig.json"),
	JSON.stringify(
		{
			extends: "../../tsconfig",
			compilerOptions: { rootDir: "./src", outDir: "./es", incremental: true, composite: true },
			include: ["src/**/*"],
			exclude: ["src/*.test.tsx"]
		},
		null,
		"\t"
	) + "\n"
);

// ---------------------------------------------------------------------------
// 3. Templates to complete (written once)
// ---------------------------------------------------------------------------

const TODO = "TODO(handover)";
const testFile = path.join(pkgDir, "src", `${pascal}.test.tsx`);
const readmeFile = path.join(pkgDir, "README.md");
const mdxFile = path.join(outDir, "docs", "pages", "components", `${slug}.mdx`);
const examplesFile = path.join(outDir, "docs", "components", "examples", `${pascal}.tsx`);

writeOnce(
	testFile,
	`import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ${pascal} } from "./${pascal}";

// ${TODO}: replace with real tests, in the style of the design system's own
// (for example components/nds-filters/src/Filters.test.tsx). Cover: it renders,
// each variant, every interaction with userEvent (including keyboard), the
// accessible names and states (roles, aria attributes), and that extra props
// reach the element. Behaviour tests matter more than snapshots.
describe("${pascal}", () => {
	it.todo("should render");
});
`
);

writeOnce(
	readmeFile,
	`# \`${pkgName}\`

> ${title} component for the NICE Design System

## Installation

Install Node, and then:

\`\`\`sh
npm i ${pkgName} --save
\`\`\`

## Usage

### React

Import the \`${pascal}\` component from the package and use within JSX:

\`\`\`jsx
import React from "react";
import { ${pascal} } from "${pkgName}";

// ${TODO}: a short, realistic example
\`\`\`

#### Props

${TODO}: one section per prop, in this form:

##### propName

- Type: \`string\` (required)

What it does.

### SCSS

If you're not using [React](#react), then import the SCSS directly into your application:

\`\`\`scss
@forward '${pkgName}/scss/${slug}';
\`\`\`

### HTML

If you're not using [React](#react), then include the [SCSS as above](#scss) and use the HTML:

\`\`\`html
${TODO}: the rendered HTML of the default example
\`\`\`
`
);

writeOnce(
	examplesFile,
	`import { ${pascal} } from "${pkgName}";

// ${TODO}: one exported example per variant shown on the docs page.
// The first is the hero example at the top of the page.
export const Demo${pascal} = () => null;
`
);

writeOnce(
	mdxFile,
	`import { ComponentLayout } from "components/layouts/ComponentLayout";
import { Example } from "components/examples/Example";
import { Demo${pascal} } from "components/examples/${pascal}";

export const meta = {
	title: "${title}",
	description: "${TODO}: one sentence saying what it is for.",
	npmUrl: "https://www.npmjs.com/package/${pkgName}",
	gitHubUrl: "https://github.com/nice-digital/nice-design-system/blob/main/components/nds-${slug}",
	component: Demo${pascal}
};

${TODO}: a short introduction.

## When to use

${TODO}

## When not to use

${TODO}

## How to use

${TODO}

## Variants

## Default

<Example>
<Demo${pascal} />

<CH.Code>
\`\`\`js React
${TODO}
\`\`\`
\`\`\`html HTML
${TODO}
\`\`\`
</CH.Code>
</Example>

## Accessibility

${TODO}: what has been checked (contrast, keyboard, screen reader announcements) and anything teams using it must do.

export default ({ children }) => <ComponentLayout meta={meta}>{children}</ComponentLayout>;
`
);

// ---------------------------------------------------------------------------
// 4. HANDOVER.md: the manual steps
// ---------------------------------------------------------------------------

const decisionsPath = path.join(sketch.dir, "decisions.md");
const decisionLines = fs.existsSync(decisionsPath)
	? read(decisionsPath)
			.split("\n")
			.filter((line) => line.startsWith("- "))
	: [];

const ndsDeps = [...dependencies].filter((name) => /^@nice-digital\/nds-(?!core)/.test(name)).sort();
const usedBy = getTargets()
	.filter((t) => t.kind === "design")
	.filter((t) => filesIn(t.dir, /\.tsx?$/).some((file) => read(file).includes(`@sketches/${slug}`)))
	.map((t) => t.slug);

write(
	path.join(outDir, "HANDOVER.md"),
	`# ${title}: hand-over to the NICE Design System

Candidate component \`${pkgName}\`, built in the design workspace from the sketch \`sketches/${slug}\`.

- What it is: ${description}
- Figma: ${String(sketch.meta.figma ?? "") || "none recorded"}
- Used in designs: ${usedBy.length ? usedBy.join(", ") : "none yet"}
- Built against: \`@nice-digital/design-system\` ${installedVersion("@nice-digital/design-system")}
- Builds on: ${ndsDeps.length ? ndsDeps.map((d) => `\`${d}\``).join(", ") : "nds-core only"}

This folder was verified in the design workspace: type check, style rules, and the tests in
\`components/nds-${slug}/src\` run with the design system's Jest setup. It has not been built or
tested inside the monorepo. Adding it is a manual step for a design system developer.

${decisionLines.length ? `## Decisions made while designing it\n\n${decisionLines.map((line) => { const [date, who, what, ...why] = line.slice(2).split(" | "); return `- ${what} (${who}, ${date}). Why: ${why.join(" | ")}`; }).join("\n")}\n\n` : ""}## 1. Copy the files

This folder mirrors the monorepo. From the root of \`nice-design-system\`, copy:

| From this folder | To |
|---|---|
| \`components/nds-${slug}/\` | \`components/nds-${slug}/\` |
| \`docs/pages/components/${slug}.mdx\` | \`docs/pages/components/${slug}.mdx\` |
| \`docs/components/examples/${pascal}.tsx\` | \`docs/components/examples/${pascal}.tsx\` |

## 2. Register the component (manual edits)

1. **Root \`tsconfig.json\`**, in \`references\`${ndsDeps.length ? `, after ${ndsDeps.map((d) => `\`${d.replace("@nice-digital/", "")}\``).join(" and ")} (it depends on ${ndsDeps.length > 1 ? "them" : "it"})` : ""}:

   \`\`\`json
   { "path": "./components/nds-${slug}" },
   \`\`\`

2. **\`components/design-system/package.json\`**, in \`dependencies\`:

   \`\`\`json
   "${pkgName}": "^0.1.0",
   \`\`\`

3. **\`components/design-system/scss/nice-design-system.scss\`**, in alphabetical order:

   \`\`\`scss
   @forward '${pkgName}/scss/${slug}';
   \`\`\`

4. **\`docs/data/components.ts\`**, in alphabetical order:

   \`\`\`ts
   {
   	title: "${title}",
   	slug: "${slug}",
   	description: "${description}"
   },
   \`\`\`

5. **\`docs/package.json\`**: add \`"${pkgName}"\` to \`dependencies\` if the docs build cannot resolve it.
${
	hasTokens
		? `
6. **\`components/nds-core/scss/colours/tokens/_alias.scss\`**: add these alias tokens (the component's SCSS
   already refers to them as \`colours.$...\`). Change \`global.$\` references to match that file's style:

   \`\`\`scss
${read(tokensFile)
	.split("\n")
	.filter((line) => line.trim().startsWith("$"))
	.map((line) => `   ${line}`)
	.join("\n")}
   \`\`\`
`
		: ""
}
## 3. Build and test in the monorepo

\`\`\`sh
npm install
npm test
npm run docs:dev   # then open /components/${slug}
\`\`\`

## 4. Things to review

- Naming of the component, its props and its classes against existing conventions.
- The version number (\`0.1.0\` is a placeholder; Lerna sets the real one on release).
- Whether dependency versions match the monorepo's current ones.
- Formatting: run Prettier and stylelint from the monorepo over the new files.
- The accessibility notes on the docs page, with a manual screen reader check.

## After release

Tell the design team the version it shipped in, so the workspace can switch its designs from the sketch to
the published package and the Figma toolkit can be updated.
`
);

// ---------------------------------------------------------------------------
// 5. Verify
// ---------------------------------------------------------------------------

const problems: string[] = [];

for (const file of filesIn(outDir, /\.(tsx?|mdx?|scss|json)$/).filter((f) => path.basename(f) !== "HANDOVER.md")) {
	const count = read(file).split(TODO).length - 1;
	if (count) problems.push(`${rel(file)} has ${count} unfinished section(s) marked ${TODO}`);
}
if (/it\.todo|describe\.skip|it\.skip/.test(read(testFile)))
	problems.push(`${rel(testFile)} has tests that are not written yet`);

const run = (args: string[]) =>
	spawnSync("npx", args, { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

// Types: the component, its tests and the docs examples, with the package name pointing at the source
const tsconfig = path.join(previewDir, `tsconfig.handover-${slug}.json`);
write(
	tsconfig,
	JSON.stringify({
		compilerOptions: {
			target: "ES2020",
			lib: ["dom", "dom.iterable", "esnext"],
			jsx: "react-jsx",
			module: "esnext",
			moduleResolution: "bundler",
			strict: true,
			noEmit: true,
			skipLibCheck: true,
			esModuleInterop: true,
			types: ["jest", "@testing-library/jest-dom", "jest-extended"],
			baseUrl: root,
			paths: { [pkgName]: [path.join(pkgDir, "src", `${pascal}.tsx`)] }
		},
		include: [path.join(outDir, "**/*.ts"), path.join(outDir, "**/*.tsx")]
	})
);
const types = run(["tsc", "-p", tsconfig, "--pretty", "false"]);
for (const line of types.stdout.split("\n").filter((l) => l.includes("error TS")))
	problems.push(`Type error: ${line.replace(root + path.sep, "")}`);

const styles = run(["stylelint", `sketches/${slug}/handover/**/*.scss`, "--formatter", "compact"]);
if (styles.status !== 0)
	problems.push(`Style rules: ${(styles.stdout + styles.stderr).trim().slice(0, 1500)}`);

const tests = run(["jest", "--config", "jest.handover.config.js", "--rootDir", root, `sketches/${slug}/handover/`]);
const testOutput = (tests.stderr + tests.stdout).replace(/\u001b\[[0-9;]*m/g, "");
if (tests.status !== 0) problems.push(`Tests failed:\n${testOutput.trim().slice(-2500)}`);
const testSummary = testOutput.match(/^Tests:.*$/m)?.[0] ?? "";

console.log(`Package: ${rel(outDir)}/`);
for (const file of filesIn(outDir, /./).sort()) console.log(`  ${path.relative(outDir, file)}`);
if (testSummary) console.log(`\n${testSummary}`);

if (problems.length) {
	console.log(`\nNOT READY TO HAND OVER: ${problems.length} thing(s) to finish`);
	for (const problem of problems) console.log(`  - ${problem}`);
	process.exit(1);
}
console.log(`\nReady to hand over. Give the ${rel(outDir)}/ folder to a design system developer; HANDOVER.md tells them what to do.`);
