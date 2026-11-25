import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

import { Ledger } from "../components/Ledger";
import {
	getCandidateRegisters,
	getDesigns,
	getSketchbooks,
	getSketches,
	type Item,
	type Sketchbook
} from "../lib/workspace";

interface HomeProps {
	designs: Item[];
	sketches: Item[];
	sketchbooks: Sketchbook[];
	candidates: { total: number; proposed: number; projects: string[] };
	/** Name of something just deleted from its page */
	deleted: string;
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({ query }) => {
	const registers = getCandidateRegisters();
	const all = registers.flatMap((register) => register.candidates);
	return {
		props: {
			designs: getDesigns(),
			sketches: getSketches(),
			sketchbooks: getSketchbooks(),
			deleted: typeof query.deleted === "string" ? query.deleted.slice(0, 80) : "",
			candidates: {
				total: all.length,
				proposed: all.filter((c) => c.triage === "candidate").length,
				projects: registers.map((register) => register.projectName)
			}
		}
	};
};

export default function Home({ designs, sketches, sketchbooks, candidates, deleted }: HomeProps) {
	const all = [...designs, ...sketches];
	const needWork = all.filter((item) => ["failed", "stale"].includes(item.status.state)).length;

	const patterns = sketches.filter((item) => item.type === "pattern");
	const components = sketches.filter((item) => item.type !== "pattern");
	const inBook = (id: string) => components.filter((item) => item.sketchbook === id);
	const loose = components.filter(
		(item) => !sketchbooks.some((book) => book.id === item.sketchbook)
	);

	return (
		<>
			<Head>
				<title>NICE design workspace</title>
			</Head>

			<header className="ws-masthead">
				<div className="ws-masthead__inner">
					<p className="ws-masthead__kicker">NICE Design System</p>
					<h1 className="ws-masthead__title">Design workspace</h1>
					<p className="ws-masthead__lead">
						Sketches, patterns and designs built in code from the design system. Describe what
						you want in Kiro; look at the result here.
					</p>
					<dl className="ws-tally">
						<div>
							<dt>Designs</dt>
							<dd>{designs.length}</dd>
						</div>
						<div>
							<dt>Patterns</dt>
							<dd>{patterns.length}</dd>
						</div>
						<div>
							<dt>Sketches</dt>
							<dd>{components.length}</dd>
						</div>
						<div>
							<dt>Need attention</dt>
							<dd>{needWork}</dd>
						</div>
					</dl>
				</div>
			</header>

			<div className="ws-page">
				{deleted && (
					<p className="ws-notice" role="status">
						Deleted: {deleted}.
					</p>
				)}
				<section className="ws-section" aria-labelledby="designs-heading">
					<div className="ws-section__head">
						<h2 id="designs-heading">Designs</h2>
						<p>Pages and flows built only from the design system and ready sketches.</p>
					</div>
					<Ledger
						items={designs}
						empty="No designs yet. In Kiro, try: “Design a page that lists guidance with filters”."
					/>
				</section>

				<section className="ws-section" aria-labelledby="patterns-heading">
					<div className="ws-section__head">
						<h2 id="patterns-heading">Patterns</h2>
						<p>Larger pieces composed from several components, reusable across designs.</p>
					</div>
					<Ledger
						items={patterns}
						empty="No patterns yet. In Kiro, try: “Make a pattern for a search box with filters and a results summary”."
					/>
				</section>

				<section className="ws-section" aria-labelledby="sketches-heading">
					<div className="ws-section__head">
						<h2 id="sketches-heading">Sketches</h2>
						<p>Ideas for components the design system does not have yet.</p>
					</div>

					{sketchbooks.map((book) => (
						<div className="ws-book" key={book.id}>
							<div className="ws-book__head">
								<h3>
									<Link href={`/workspace/sketchbook/${book.id}`}>{book.name}</Link>
								</h3>
								<p>
									Sketchbook, {inBook(book.id).length}{" "}
									{inBook(book.id).length === 1 ? "sketch" : "sketches"}
									{book.description && `. ${book.description}`}
								</p>
							</div>
							<Ledger items={inBook(book.id)} empty="Nothing in this sketchbook yet." />
						</div>
					))}

					{(loose.length > 0 || sketchbooks.length === 0) && (
						<div className="ws-book">
							{sketchbooks.length > 0 && (
								<div className="ws-book__head">
									<h3>Not in a sketchbook</h3>
								</div>
							)}
							<Ledger
								items={loose}
								empty="No sketches yet. In Kiro, try: “Sketch a toggle for turning email alerts on and off”."
							/>
						</div>
					)}
				</section>

				<section className="ws-section" aria-labelledby="candidates-heading">
					<div className="ws-section__head">
						<h2 id="candidates-heading">Candidates from other projects</h2>
						<p>Components already built elsewhere at NICE that could join the design system.</p>
					</div>
					{candidates.total === 0 ? (
						<p className="ws-empty">
							Nothing scanned yet. In Kiro, try: “What in the website could go into the design
							system?”
						</p>
					) : (
						<p className="ws-empty">
							{candidates.total} components found in {candidates.projects.join(" and ")},{" "}
							{candidates.proposed} put forward by the team so far.{" "}
							<Link href="/workspace/candidates">See the candidates</Link>
						</p>
					)}
				</section>
			</div>
		</>
	);
}
