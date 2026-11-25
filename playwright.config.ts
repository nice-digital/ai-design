import { defineConfig } from "@playwright/test";

const port = Number(process.env.PREVIEW_PORT ?? 3000);

export default defineConfig({
	testDir: "./tests",
	outputDir: ".preview/playwright",
	reporter: [["line"]],
	fullyParallel: true,
	// Generous: the first load of each page builds it, which is slow on some machines
	timeout: 240_000,
	use: { baseURL: `http://localhost:${port}`, browserName: "chromium" },
	// Reuses the designer's running preview if there is one
	webServer: {
		command: `npx next dev prototype -p ${port}`,
		url: `http://localhost:${port}`,
		reuseExistingServer: true,
		timeout: 300_000
	}
});
