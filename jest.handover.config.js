/**
 * Runs the tests inside hand-over packages (sketches/<name>/handover/) with the same setup as the
 * nice-design-system monorepo (jsdom, ts-jest, SCSS mocked, useId mocked),
 * so a test that passes here should pass there.
 */
module.exports = {
	moduleFileExtensions: ["tsx", "ts", "js"],
	moduleNameMapper: { "^.+\\.(css|less|scss)$": "identity-obj-proxy" },
	setupFilesAfterEnv: ["<rootDir>/scripts/jest.setup.ts", "jest-extended/all"],
	// Never crawl the read-only copies of other projects, or build output
	modulePathIgnorePatterns: ["<rootDir>/.sources/", "<rootDir>/prototype/.next/", "<rootDir>/.preview/"],
	watchPathIgnorePatterns: ["<rootDir>/.sources/"],
	testEnvironment: "jsdom",
	testMatch: ["<rootDir>/sketches/*/handover/**/src/**/*.test.tsx"],
	transform: {
		"^.+\\.(ts|tsx)$": [
			"ts-jest",
			{ diagnostics: false, tsconfig: { jsx: "react-jsx", esModuleInterop: true, module: "commonjs", target: "ES2020" } }
		]
	}
};
