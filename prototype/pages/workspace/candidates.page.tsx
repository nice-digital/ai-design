import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

import { formatDate } from "../../components/StatusMark";
import { getCandidateRegisters, type Candidate, type CandidateRegister } from "../../lib/workspace";

interface Props {
	registers: CandidateRegister[];
	/** Result of pressing "Scan again" */
	scanned: "" | "1" | "offline" | "failed";
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => ({
	props: {
		registers: getCandidateRegisters(),
		scanned: ["1", "offline", "failed"].includes(String(query.scanned)) ? (String(query.scanned) as Props["scanned"]) : ""
	}
});

const daysSince = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);

const groups: { suggestion: string; title: string; intro: string }[] = [
	{
		suggestion: "Looks separable",
		title: "Look separable",
		intro: "No ties to the project’s own data. The easiest to bring into the design system."
	},
	{
		suggestion: "Needs untangling",
		title: "Need untangling",
		intro:
			"A reusable layout or behaviour mixed with content fields or other components. The reusable part has to be separated out first."
	},
	{
		suggestion: "Tied to the website",
		title: "Tied to the project",
		intro:
			"Depend on data feeds or several of the project’s services. Usually better left where they are."
	}
];

const Row = ({ candidate }: { candidate: Candidate }) => (
	<li className="ws-candidate">
		<div>
			<h4 className="ws-candidate__name">{candidate.name}</h4>
			<p className="ws-candidate__path">{candidate.path}</p>
		</div>
		<p className="ws-candidate__found">
			{candidate.why}.{" "}
			{candidate.usedIn === 0
				? "Not used anywhere else"
				: `Used in ${candidate.usedIn} ${candidate.usedIn === 1 ? "place" : "places"}`}
			{candidate.rawValues > 0 &&
				`. ${candidate.rawValues} style ${candidate.rawValues === 1 ? "value" : "values"} to convert to tokens`}
			{candidate.similarTo && `. Compare with the design system’s ${candidate.similarTo}`}.
		</p>
		<p className="ws-candidate__view">
			{candidate.triage === "candidate" && <strong>Put forward by the team</strong>}
			{candidate.triage === "not-suitable" && <strong>Ruled out by the team</strong>}
			{candidate.triage === "undecided" && <span>Not looked at yet</span>}
			{candidate.note && <span className="ws-candidate__note">{candidate.note}</span>}
			{candidate.sketch && (
				<Link href={`/workspace/sketch/${candidate.sketch}`}>
					Sketched as {candidate.sketch}
				</Link>
			)}
		</p>
	</li>
);

export default function CandidatesPage({ registers, scanned }: Props) {
	const total = registers.reduce((sum, register) => sum + register.candidates.length, 0);
	const oldest = Math.max(0, ...registers.map((register) => daysSince(register.scannedAt)));

	return (
		<>
			<Head>
				<title>Candidates from other projects | NICE design workspace</title>
			</Head>

			<header className="ws-masthead ws-masthead--item">
				<div className="ws-masthead__inner">
					<p className="ws-masthead__kicker">
						<Link href="/">Design workspace</Link> / Candidates
					</p>
					<h1 className="ws-masthead__title">Candidates from other projects</h1>
					<p className="ws-masthead__lead">
						{total} components already built elsewhere at NICE that are not in the design system.
						The scan reads the code; whether something belongs in the design system is the
						team’s call.
					</p>
				</div>
			</header>

			<div className="ws-page ws-page--item">
				{scanned === "1" && (
					<p className="ws-notice" role="status">
						Scanned again from the latest code. What the team has decided about each component
						is unchanged.
					</p>
				)}
				{scanned === "offline" && (
					<p className="ws-notice ws-notice--error" role="alert">
						At least one project could not be reached, so its list is from the copy fetched
						earlier. Check the connection and try again.
					</p>
				)}
				{scanned === "failed" && (
					<p className="ws-notice ws-notice--error" role="alert">
						The scan did not finish. Ask Kiro to “scan for candidates again” and it will say why.
					</p>
				)}

				<form className="ws-confirm__actions" method="post" action="/api/candidates">
					<button type="submit" className="ws-button ws-button--dark">
						Scan again
					</button>
					<span>
						{registers.length === 0
							? "Fetches each project from git and lists its components."
							: `Last scanned ${oldest === 0 ? "today" : oldest === 1 ? "yesterday" : `${oldest} days ago`}. Scanning fetches the latest code and can take a minute or two.`}
					</span>
				</form>

				<p className="ws-empty">
					To act on one, ask Kiro: “put Testimonial forward as a candidate, because…”, “rule out
					ProductCard”, or “bring Testimonial in from the website as a sketch”.
				</p>

				{registers.map((register) => (
					<section
						className="ws-section"
						key={register.project}
						aria-labelledby={`${register.project}-heading`}
					>
						<div className="ws-section__head">
							<h2 id={`${register.project}-heading`}>{register.projectName}</h2>
							<p>
								{register.candidates.length} components, read from git on{" "}
								{formatDate(register.scannedAt)}
								{register.commit && ` (version ${register.commit.split(" ")[0]})`}.
							</p>
						</div>

						{register.changes && (
							<p className="ws-empty">
								Changed since the scan of {formatDate(register.changes.since)}:
								{register.changes.added.length > 0 && ` new: ${register.changes.added.join(", ")}.`}
								{register.changes.removed.length > 0 &&
									` No longer in the project: ${register.changes.removed.join(", ")}.`}
							</p>
						)}

						{groups.map((group) => {
							const rows = register.candidates.filter((c) => c.suggestion === group.suggestion);
							if (rows.length === 0) return null;
							return (
								<details
									className="ws-fold"
									key={group.suggestion}
									open={group.suggestion === "Looks separable"}
								>
									<summary>
										<span className="ws-fold__title">
											{group.title} ({rows.length})
										</span>
										<span className="ws-fold__intro">{group.intro}</span>
									</summary>
									<ul className="ws-candidates">
										{rows.map((candidate) => (
											<Row key={candidate.path} candidate={candidate} />
										))}
									</ul>
								</details>
							);
						})}
					</section>
				))}

				{registers.length === 0 && (
					<p className="ws-empty">Nothing has been scanned yet.</p>
				)}
			</div>
		</>
	);
}
