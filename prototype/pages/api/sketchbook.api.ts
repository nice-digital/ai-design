import type { NextApiRequest, NextApiResponse } from "next";

import { renameSketchbook } from "../../lib/workspace";

/** Renames a sketchbook from the form on its page. Works without JavaScript. */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "POST") return res.status(405).end();
	const { id, name, description } = req.body as Record<string, string>;
	if (!/^[a-z0-9-]+$/.test(String(id))) return res.status(400).end();
	const ok = renameSketchbook(String(id), String(name ?? ""), description === undefined ? undefined : String(description));
	res.redirect(303, `/workspace/sketchbook/${id}${ok ? "?saved=1" : "?error=1"}`);
}
