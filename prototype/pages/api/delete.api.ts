import type { NextApiRequest, NextApiResponse } from "next";

import { getItem, getSketchbooks, runScript } from "../../lib/workspace";

/**
 * Deletes a sketch, a design or a sketchbook from the confirmation step on its
 * page. Runs the same command Kiro runs (npm run remove, npm run sketchbook),
 * so the same safety checks apply. Only ever touches this project's files.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "POST") return res.status(405).end();
	const { kind, id, confirm } = req.body as Record<string, string>;
	if (!/^[a-z0-9-]+$/.test(String(id)) || confirm !== "yes") return res.status(400).end();

	if (kind === "sketchbook") {
		const book = getSketchbooks().find((b) => b.id === id);
		if (!book) return res.status(404).end();
		const { ok } = runScript("sketchbook", ["delete", id]);
		return res.redirect(
			303,
			ok ? `/?deleted=${encodeURIComponent(`${book.name} sketchbook`)}` : `/workspace/sketchbook/${id}?delete=1&failed=1#delete-heading`
		);
	}

	const item = getItem(String(kind), id);
	if (!item) return res.status(404).end();
	const { ok, output } = runScript("remove", [item.kind, item.slug, "--yes"]);
	// Pass on why, so the page can say (a file locked by another program, for example)
	const reason = output.split("\n").filter((line) => /error|cannot|EBUSY|EPERM|ENOTEMPTY|EACCES/i.test(line)).pop() ?? output.split("\n").pop() ?? "";
	res.redirect(
		303,
		ok
			? `/?deleted=${encodeURIComponent(item.title)}`
			: `/workspace/${item.kind}/${item.slug}?delete=1&failed=1&reason=${encodeURIComponent(reason.slice(0, 300))}#delete-heading`
	);
}
