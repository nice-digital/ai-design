// @ts-check
const fs = require("fs");
const path = require("path");

/**
 * NICE Design System components import their own SCSS, so every
 * @nice-digital package has to be transpiled (same approach as next-web).
 */
const niceDigitalDir = path.join(__dirname, "..", "node_modules", "@nice-digital");
const niceDigitalModules = fs
	.readdirSync(niceDigitalDir)
	.map((name) => `@nice-digital/${name}`);

/** @type {import('next').NextConfig} */
module.exports = {
	reactStrictMode: true,
	poweredByHeader: false,
	// Next's development badge must not appear in screenshots or get in a designer's way
	devIndicators: false,
	transpilePackages: niceDigitalModules,
	// sketches/ lives outside this folder
	experimental: { externalDir: true },
	sassOptions: {
		includePaths: [niceDigitalDir],
		// The design system's own SCSS triggers these; they are not problems in a design
		silenceDeprecations: ["legacy-js-api", "import", "global-builtin", "if-function"],
		quietDeps: true
	},
	// The gates (npm run check) do linting and type checking
	pageExtensions: ["page.tsx", "api.ts"],
	eslint: { ignoreDuringBuilds: true }
};
