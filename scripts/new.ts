/**
 * Scaffolds a new sketch or design so every one starts from the same shape.
 *
 *   npm run new:sketch -- character-count "Textarea with a live character count"
 *   npm run new:design -- guidance-search "Search guidance with filters"
 */
import fs from "fs";
import path from "path";

const root = path.join(__dirname, "..");
const [kind, slug, description = ""] = process.argv.slice(2);

if (!["sketch", "pattern", "design"].includes(kind) || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(slug ?? "")) {
	console.error(
		'Usage: npm run new:sketch -- kebab-case-name "One line description"\n       npm run new:pattern -- kebab-case-name "One line description"\n       npm run new:design -- kebab-case-name "One line description"'
	);
	process.exit(1);
}

const pascal = slug
	.split("-")
	.map((part) => part[0].toUpperCase() + part.slice(1))
	.join("");
const title = pascal.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase()).replace(/ ([A-Z])/g, (_, c: string) => ` ${c.toLowerCase()}`);

const write = (dir: string, files: Record<string, string>) => {
	if (fs.existsSync(dir)) {
		console.error(`${path.relative(root, dir)} already exists`);
		process.exit(1);
	}
	fs.mkdirSync(dir, { recursive: true });
	for (const [name, content] of Object.entries(files))
		fs.writeFileSync(path.join(dir, name), content);
	console.log(`Created ${path.relative(root, dir)}/ (${Object.keys(files).join(", ")})`);
};

if (kind === "sketch" || kind === "pattern") {
	write(path.join(root, "sketches", slug), {
		"sketch.json":
			JSON.stringify(
				{ title, description, type: kind === "pattern" ? "pattern" : "component", status: "sketch", figma: "", prompt: "", source: "" },
				null,
				"\t"
			) + "\n",
		"index.ts": `export * from "./${pascal}";\n`,
		[`${pascal}.tsx`]: `import classnames from "classnames";
import React from "react";

import styles from "./${pascal}.module.scss";

export interface ${pascal}Props {
	/** Allow any additional props to be passed to the root element */
	[prop: string]: unknown;
	children: React.ReactNode;
	className?: string;
}

export const ${pascal}: React.FC<${pascal}Props> = (props) => {
	const { children, className, ...rest } = props;

	return (
		<div
			className={classnames(styles["${slug}"], className)}
			data-component="${slug}"
			{...rest}
		>
			{children}
		</div>
	);
};
`,
		[`${pascal}.module.scss`]: `@use '@nice-digital/nds-core/scss/colours';
@use '@nice-digital/nds-core/scss/spacing';
@use '@nice-digital/nds-core/scss/typography';
@use '@nice-digital/nds-core/scss/utils';

.${slug} {
  @include typography.font-size(0);
  color: colours.$text;
  margin-bottom: utils.rem(spacing.$medium);
}
`,
		"demo.tsx": `import { ${pascal} } from "./${pascal}";

/** Shows every variant and state of the sketch. Rendered at /sketches/${slug} */
export default function Demo() {
	return (
		<>
			<h2>Default</h2>
			<${pascal}>Example content</${pascal}>
		</>
	);
}
`
	});
	console.log(`Preview: http://localhost:3000/sketches/${slug}`);
} else {
	write(path.join(root, "prototype", "pages", "designs", slug), {
		"design.json":
			JSON.stringify({ title, description, figma: "", prompt: "" }, null, "\t") + "\n",
		"index.page.tsx": `import Head from "next/head";
import { PageHeader } from "@nice-digital/nds-page-header";

export default function ${pascal}Page() {
	return (
		<>
			<Head>
				<title>${title}</title>
			</Head>
			<PageHeader heading="${title}" />
		</>
	);
}
`
	});
	console.log(`Preview: http://localhost:3000/designs/${slug}`);
}
