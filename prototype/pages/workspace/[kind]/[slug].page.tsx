import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

import { StatusMark, formatDate, formatDateTime } from "../../../components/StatusMark";
import { getItem, getUsersOf, type Item } from "../../../lib/workspace";

interface Props {
	item: Item;
	/** The confirmation step of deleting has been asked for */
	confirmDelete: boolean;
	deleteFailed: boolean;
	/** What the delete command said when it failed */
	deleteReason: string;
	/** Designs and patterns built on this sketch: it cannot be deleted while there are any */
	usedBy: { kind: string; slug: string; title: string; type: string }[];
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params, query }) => {
	const item = getItem(String(params?.kind), String(params?.slug));
	if (!item) return { notFound: true };
	return {
		props: {
			item,
			confirmDelete: query.delete === "1",
			deleteFailed: query.failed === "1",
			deleteReason: typeof query.reason === "string" ? query.reason.slice(0, 300) : "",
			usedBy: item.kind === "sketch" ? getUsersOf(item.slug) : []
		}
	};
};

/** "accessibility/color-contrast" -> "Accessibility" */
const ruleLabel = (rule: string): string => {
	const group = rule.split("/")[0];
	const labels: Record<string, string> = {
		accessibility: "Accessibility",
		keyboard: "Keyboard",
		responsive: "Small screens",
		"mobile-first": "Mobile first",
		"tap-target": "Tap size",
		styles: "Design system styles",
		tokens: "Design system colours",
		imports: "Design system components",
		experimental: "Not yet in the design system",
		types: "Component used incorrectly",
		code: "Markup",
		structure: "Missing information",
		"browser-error": "Browser error",
		"page-loads": "Page did not load",
		browser: "Could not be tested"
	};
	return labels[group] ?? group;
};

export default function ItemPage({ item, confirmDelete, deleteFailed, deleteReason, usedBy }: Props) {
	const { status } = item;
	const what = item.kind === "design" ? "design" : item.type === "pattern" ? "pattern" : "sketch";

	return (
		<>
			<Head>
				<title>{`${item.title} | NICE design workspace`}</title>
			</Head>

			<header className="ws-masthead ws-masthead--item">
				<div className="ws-masthead__inner">
					<p className="ws-masthead__kicker">
						<Link href="/">Design workspace</Link> /{" "}
						{item.kind === "design" ? "Design" : item.type === "pattern" ? "Pattern" : "Sketch"}
					</p>
					<h1 className="ws-masthead__title">{item.title}</h1>
					<p className="ws-masthead__lead">{item.description}</p>
					<p className="ws-masthead__actions">
						<Link className="ws-button" href={item.url}>
							Open the {item.kind}
						</Link>
						{item.figma && (
							<a className="ws-button ws-button--quiet" href={item.figma}>
								Source in Figma
							</a>
						)}
					</p>
				</div>
			</header>

			<div className="ws-page ws-page--item">
				{item.prompt && (
					<section className="ws-section" aria-labelledby="prompt-heading">
						<div className="ws-section__head">
							<h2 id="prompt-heading">The request</h2>
							<p>What was typed into Kiro to make the first version.</p>
						</div>
						<blockquote className="ws-request">{item.prompt}</blockquote>
					</section>
				)}

				{item.parts.length > 0 && (
					<section className="ws-section" aria-labelledby="parts-heading">
						<div className="ws-section__head">
							<h2 id="parts-heading">Made from</h2>
							<p>
								{item.type === "pattern"
									? "The components this pattern is composed of."
									: `The components this ${what} is built on.`}
							</p>
						</div>
						<ul className="ws-parts">
							{item.parts.map((part) => (
								<li key={part.href}>
									{part.from === "design-system" ? (
										<a href={part.href}>{part.name}</a>
									) : (
										<Link href={part.href}>{part.name}</Link>
									)}
									<span className="ws-parts__from">
										{part.from === "design-system"
											? "In the design system"
											: "Sketch: not yet in the design system"}
									</span>
								</li>
							))}
						</ul>
					</section>
				)}

				<section className="ws-section" aria-labelledby="checks-heading">
					<div className="ws-section__head">
						<h2 id="checks-heading">Checks</h2>
						<p>
							{status.checkedAt
								? `Last checked ${formatDateTime(status.checkedAt)}.`
								: "Ask Kiro to “check this” to run them."}
						</p>
					</div>

					<div className="ws-checks">
						<p className="ws-checks__result">
							<StatusMark status={status} />
						</p>

						{item.kind === "sketch" && (
							<p>
								{item.stage === "ready"
									? `Marked ready, so it is held to the full rules and designs can use it. It is not part of the design system until a developer adds it.${item.hasHandover ? " A hand-over package has been made for the design system team." : ""}`
									: "Still a sketch, so only serious problems count and designs cannot use it yet. Ask Kiro to “make this ready to use in designs”."}
							</p>
						)}
						{item.experimental.length > 0 && (
							<p>
								Uses {item.experimental.length === 1 ? "a component" : "components"} not yet in
								the design system:{" "}
								{item.experimental.map((slug, index) => (
									<span key={slug}>
										{index > 0 && ", "}
										<Link href={`/workspace/sketch/${slug}`}>{slug}</Link>
									</span>
								))}
								. It cannot go to production until {item.experimental.length === 1 ? "that is" : "those are"} added.
							</p>
						)}
						{status.state === "stale" && (
							<p>It has been changed since this result, so the result may be out of date.</p>
						)}

						{status.problems.length > 0 && (
							<>
								<h3>To fix</h3>
								<ul className="ws-findings">
									{status.problems.map((problem, index) => (
										<li key={index}>
											<span className="ws-label">{ruleLabel(problem.rule)}</span>
											{problem.message}
										</li>
									))}
								</ul>
							</>
						)}
						{status.notes.length > 0 && (
							<>
								<h3>Worth a look</h3>
								<ul className="ws-findings ws-findings--notes">
									{status.notes.map((note, index) => (
										<li key={index}>
											<span className="ws-label">{ruleLabel(note.rule)}</span>
											{note.message}
										</li>
									))}
								</ul>
							</>
						)}
					</div>
				</section>

				{(item.memory.length > 0 || item.source) && (
					<section className="ws-section" aria-labelledby="memory-heading">
						<div className="ws-section__head">
							<h2 id="memory-heading">Worth knowing</h2>
							<p>Background that is not a decision: who it is for, constraints, findings.</p>
						</div>
						<ul className="ws-memory">
							{item.source && (
								<li>
									Brought in from {item.source.split(":")[0]} (<code>{item.source.split(":")[1]}</code>).
								</li>
							)}
							{item.memory.map((entry, index) => (
								<li key={index}>
									{entry.note}{" "}
									<span className="ws-memory__when">
										{entry.who}, {formatDate(entry.date)}
									</span>
								</li>
							))}
						</ul>
					</section>
				)}

				<section className="ws-section" aria-labelledby="screens-heading">
					<div className="ws-section__head">
						<h2 id="screens-heading">Screens</h2>
						<p>As captured at the last check, smallest screen first.</p>
					</div>
					{status.screenshots.length === 0 ? (
						<p className="ws-empty">No screenshots yet. They are taken when the checks run.</p>
					) : (
						<ul className="ws-sheet">
							{status.screenshots.map((width) => {
								const src = `/api/screenshot?kind=${item.kind}&slug=${item.slug}&width=${width}`;
								return (
									<li key={width} className="ws-sheet__frame">
										<a href={src}>
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={src}
												alt={`${item.title} at ${width} pixels wide`}
												loading="lazy"
											/>
										</a>
										<span className="ws-sheet__caption">{width} pixels</span>
									</li>
								);
							})}
						</ul>
					)}
				</section>

				<section className="ws-section" aria-labelledby="decisions-heading">
					<div className="ws-section__head">
						<h2 id="decisions-heading">Decisions</h2>
						<p>What has been agreed and why, newest first.</p>
					</div>
					{item.decisions.length === 0 ? (
						<p className="ws-empty">
							Nothing logged yet. Kiro records a decision whenever you choose between options, or
							when you say “log that we decided…”.
						</p>
					) : (
						<ol className="ws-log">
							{item.decisions.map((entry, index) => (
								<li key={index} className="ws-log__entry">
									<p className="ws-log__when">
										<time dateTime={entry.date}>{formatDate(entry.date)}</time>
										<span>{entry.who}</span>
									</p>
									<div>
										<p className="ws-log__what">{entry.decision}</p>
										<p className="ws-log__why">{entry.why}</p>
									</div>
								</li>
							))}
						</ol>
					)}
					{item.archivedDecisions > 0 && (
						<p className="ws-empty">
							{item.archivedDecisions} older {item.archivedDecisions === 1 ? "decision is" : "decisions are"} in the archive. Ask
							Kiro to “show the older decisions”.
						</p>
					)}
				</section>

				<section className="ws-section" aria-labelledby="sessions-heading">
					<div className="ws-section__head">
						<h2 id="sessions-heading">Sessions</h2>
						<p>A short note from each day someone worked on this.</p>
					</div>
					{item.sessions.length === 0 ? (
						<p className="ws-empty">No session notes yet. Kiro writes one when you say “save this”.</p>
					) : (
						<ol className="ws-log">
							{item.sessions.map((note, index) => (
								<li key={index} className="ws-log__entry">
									<p className="ws-log__when">
										<time dateTime={note.date}>{formatDate(note.date)}</time>
										<span>{note.who}</span>
									</p>
									<dl className="ws-note">
										<dt>Asked for</dt>
										<dd>{note.asked}</dd>
										<dt>What changed</dt>
										<dd>{note.changed}</dd>
										<dt>Still open</dt>
										<dd>{note.open}</dd>
									</dl>
								</li>
							))}
						</ol>
					)}
				</section>

				<section className="ws-section" aria-labelledby="delete-heading">
					<div className="ws-section__head">
						<h2 id="delete-heading">Delete</h2>
						<p>Removes it from this workspace only. Nothing in Figma is touched.</p>
					</div>

					{deleteFailed && (
						<p className="ws-notice ws-notice--error" role="alert">
							It could not be deleted.{" "}
							{/EBUSY|EPERM|ENOTEMPTY|EACCES/.test(deleteReason)
								? "A file in it is open in another program. Close the sketch in Kiro and in the browser, then try again."
								: `Ask Kiro to “delete the ${item.title} ${what}” and it will sort it out.`}
							{deleteReason && <span className="ws-notice__detail">What the computer said: {deleteReason}</span>}
						</p>
					)}

					{usedBy.length > 0 ? (
						<div className="ws-confirm">
							<p>
								<strong>This {what} cannot be deleted yet</strong> because{" "}
								{usedBy.length === 1 ? "something is" : `${usedBy.length} things are`} built on it:
							</p>
							<ul>
								{usedBy.map((user) => (
									<li key={`${user.kind}-${user.slug}`}>
										<Link href={`/workspace/${user.kind}/${user.slug}`}>{user.title}</Link> (
										{user.kind === "design" ? "design" : "pattern"})
									</li>
								))}
							</ul>
							<p>Take it out of {usedBy.length === 1 ? "that" : "those"} first, or delete {usedBy.length === 1 ? "that" : "those"}.</p>
						</div>
					) : confirmDelete ? (
						<div className="ws-confirm">
							<h3>Delete the {what} “{item.title}”?</h3>
							<p>This removes:</p>
							<ul>
								<li>the {what} itself</li>
								<li>
									its {item.decisions.length + item.archivedDecisions} logged{" "}
									{item.decisions.length + item.archivedDecisions === 1 ? "decision" : "decisions"},{" "}
									{item.memory.length} background {item.memory.length === 1 ? "note" : "notes"} and{" "}
									{item.sessions.length} session {item.sessions.length === 1 ? "note" : "notes"}
								</li>
								{item.hasHandover && <li>its hand-over package for the design system team</li>}
								<li>its check results and screenshots</li>
							</ul>
							<p>
								If it had been saved, Kiro can bring it back (“restore the {item.title} {what}”).
								If not, it is gone for good.
							</p>
							<form className="ws-confirm__actions" method="post" action="/api/delete">
								<input type="hidden" name="kind" value={item.kind} />
								<input type="hidden" name="id" value={item.slug} />
								<input type="hidden" name="confirm" value="yes" />
								<button type="submit" className="ws-button ws-button--danger">
									Yes, delete it
								</button>
								<Link href={`/workspace/${item.kind}/${item.slug}`}>Cancel</Link>
							</form>
						</div>
					) : (
						<p className="ws-confirm__actions">
							<Link
								className="ws-button ws-button--danger"
								href={`/workspace/${item.kind}/${item.slug}?delete=1#delete-heading`}
							>
								Delete this {what}
							</Link>
							<span>You will be asked to confirm.</span>
						</p>
					)}
				</section>
			</div>
		</>
	);
}
