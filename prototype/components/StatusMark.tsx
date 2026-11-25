import type { CheckStatus } from "../lib/workspace";

const labels: Record<CheckStatus["state"], string> = {
	passed: "Passes all checks",
	partly: "Passes the rules, not yet tested in a browser",
	failed: "Needs work",
	stale: "Changed since it was last checked",
	unchecked: "Not checked yet"
};

/** The check result for a sketch or design, as a mark and plain words */
export const StatusMark = ({ status }: { status: CheckStatus }) => (
	<span className={`ws-status ws-status--${status.state}`}>
		<span className="ws-status__mark" aria-hidden="true" />
		{labels[status.state]}
		{status.state === "failed" && status.problems.length > 0 && (
			<span className="ws-status__count">
				{" "}
				({status.problems.length} {status.problems.length === 1 ? "problem" : "problems"})
			</span>
		)}
	</span>
);

export const formatDate = (iso: string): string => {
	const date = new Date(iso);
	return Number.isNaN(date.getTime())
		? iso
		: date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

export const formatDateTime = (iso: string): string => {
	const date = new Date(iso);
	return Number.isNaN(date.getTime())
		? iso
		: `${formatDate(iso)} at ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
};
