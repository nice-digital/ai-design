import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";

import { screenshotPath } from "../../lib/workspace";

/** Serves the screenshots the checks take, for the workspace pages */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const { kind, slug, width } = req.query;
	const file = screenshotPath(String(kind), String(slug), String(width));
	if (!file) return res.status(404).end();
	res.setHeader("Content-Type", "image/png");
	res.setHeader("Cache-Control", "no-store");
	fs.createReadStream(file).pipe(res);
}
