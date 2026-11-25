import type { NextApiRequest, NextApiResponse } from "next";

import { runScript } from "../../lib/workspace";

/**
 * "Scan again" on the candidates page: fetches the latest of each project from
 * git and rebuilds the register (npm run candidates). The team's view of each
 * component is kept.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "POST") return res.status(405).end();
	const { ok, output } = runScript("candidates", []);
	const stale = /could not be (updated|fetched)/.test(output);
	res.redirect(303, `/workspace/candidates?${ok && !stale ? "scanned=1" : stale ? "scanned=offline" : "scanned=failed"}`);
}
