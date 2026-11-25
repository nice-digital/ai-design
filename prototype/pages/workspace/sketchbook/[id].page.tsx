import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";

import { Ledger } from "../../../components/Ledger";
import {
	getCandidateRegisters,
	getSketchbooks,
	getSketches,
	type Item,
	type Sketchbook
} from "../../../lib/workspace";

interface Props {
	book: Sketchbook;
	sketches: Item[];
	saved: boolean;
	error: boolean;
	confirmDelete: boolean;
	deleteFailed: boolean;
	/** Only for the "Design system candidates" sketchbook: put forward by the team, not yet a sketch */
	waiting: { name: string; project: string; note: string }[] | null;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params, query }) => {
	const book = getSketchbooks().find((b) => b.id === params?.id);
	if (!book) return { notFound: true };
	return {
		props: {
			book,
			sketches: getSketches().filter((item) => item.sketchbook === book.id),
			saved: query.saved === "1",
			error: query.error === "1",
			confirmDelete: query.delete === "1",
			deleteFailed: query.failed === "1",
			waiting:
				book.id === "design-system-candidates"
					? getCandidateRegisters().flatMap((register) =>
							register.candidates
								.filter((c) => c.triage === "candidate" && !c.sketch)
								.map((c) => ({ name: c.name, project: register.projectName, note: c.note }))
					  )
					: null
		}
	};
};

export default function SketchbookPage({ book, sketches, saved, error, confirmDelete, deleteFailed, waiting }: Props) {
	return (
		<>
			<Head>
				<title>{`${error ? "Error: " : ""}${book.name} | Sketchbook | NICE design workspace`}</title>
			</Head>

			<header className="ws-masthead ws-masthead--item">
				<div className="ws-masthead__inner">
					<p className="ws-masthead__kicker">
						<Link href="/">Design workspace</Link> / Sketchbook
					</p>
					<h1 className="ws-masthead__title">{book.name}</h1>
					{book.description && <p className="ws-masthead__lead">{book.description}</p>}
				</div>
			</header>

			<div className="ws-page ws-page--item">
				<section className="ws-section" aria-labelledby="sketches-heading">
					<div className="ws-section__head">
						<h2 id="sketches-heading">In this sketchbook</h2>
						<p>
							To add or move a sketch, ask Kiro: “put the combo box sketch in the {book.name}{" "}
							sketchbook”.
						</p>
					</div>
					<Ledger
						items={sketches}
						empty={
							waiting
								? "No candidates have been brought in as sketches yet."
								: "Nothing in this sketchbook yet."
						}
					/>
				</section>

				{waiting && (
					<section className="ws-section" aria-labelledby="waiting-heading">
						<div className="ws-section__head">
							<h2 id="waiting-heading">Put forward, not yet brought in</h2>
							<p>
								Chosen by the team from <Link href="/workspace/candidates">the candidates</Link>.
								To start one, ask Kiro: “bring Testimonial in from the website as a sketch”.
							</p>
						</div>
						{waiting.length === 0 ? (
							<p className="ws-empty">
								Nothing is waiting. Put one forward from the candidates list.
							</p>
						) : (
							<ul className="ws-candidates">
								{waiting.map((candidate) => (
									<li className="ws-candidate" key={`${candidate.project}-${candidate.name}`}>
										<div>
											<h3 className="ws-candidate__name">{candidate.name}</h3>
											<p className="ws-candidate__path">{candidate.project}</p>
										</div>
										<p className="ws-candidate__found">{candidate.note || "No reason recorded"}</p>
									</li>
								))}
							</ul>
						)}
					</section>
				)}

				<section className="ws-section" aria-labelledby="rename-heading">
					<div className="ws-section__head">
						<h2 id="rename-heading">Name and description</h2>
						<p>Renaming never breaks links: the address stays the same.</p>
					</div>

					{saved && (
						<p className="ws-notice" role="status">
							Saved.
						</p>
					)}
					{error && (
						<p className="ws-notice ws-notice--error" role="alert">
							Enter a name for the sketchbook.
						</p>
					)}

					<form className="ws-form" method="post" action="/api/sketchbook">
						<input type="hidden" name="id" value={book.id} />
						<div className="ws-form__field">
							<label htmlFor="sketchbook-name">Name</label>
							<input
								id="sketchbook-name"
								name="name"
								type="text"
								defaultValue={book.name}
								maxLength={60}
								required
								autoComplete="off"
							/>
						</div>
						<div className="ws-form__field">
							<label htmlFor="sketchbook-description">Description (optional)</label>
							<input
								id="sketchbook-description"
								name="description"
								type="text"
								defaultValue={book.description}
								maxLength={200}
								autoComplete="off"
							/>
						</div>
						<button type="submit" className="ws-button ws-button--dark">
							Save
						</button>
					</form>
				</section>

				<section className="ws-section" aria-labelledby="delete-heading">
					<div className="ws-section__head">
						<h2 id="delete-heading">Delete this sketchbook</h2>
						<p>
							Only the grouping goes. {sketches.length === 0 ? "It is empty." : "The sketches in it are kept."}
						</p>
					</div>

					{deleteFailed && (
						<p className="ws-notice ws-notice--error" role="alert">
							It could not be deleted. Ask Kiro to “delete the {book.name} sketchbook” and it
							will say why.
						</p>
					)}

					{confirmDelete ? (
						<div className="ws-confirm">
							<h3>Delete the sketchbook “{book.name}”?</h3>
							{sketches.length > 0 ? (
								<>
									<p>
										{sketches.length === 1 ? "This sketch is" : `These ${sketches.length} sketches are`} kept,
										and will be listed with the sketches that are not in a sketchbook:
									</p>
									<ul>
										{sketches.map((sketch) => (
											<li key={sketch.slug}>{sketch.title}</li>
										))}
									</ul>
								</>
							) : (
								<p>It is empty, so nothing else changes.</p>
							)}
							{waiting && (
								<p>
									Components brought in from other projects are filed here automatically, so this
									sketchbook will come back the next time one is brought in.
								</p>
							)}
							<form className="ws-confirm__actions" method="post" action="/api/delete">
								<input type="hidden" name="kind" value="sketchbook" />
								<input type="hidden" name="id" value={book.id} />
								<input type="hidden" name="confirm" value="yes" />
								<button type="submit" className="ws-button ws-button--danger">
									Yes, delete the sketchbook
								</button>
								<Link href={`/workspace/sketchbook/${book.id}`}>Cancel</Link>
							</form>
						</div>
					) : (
						<p className="ws-confirm__actions">
							<Link
								className="ws-button ws-button--danger"
								href={`/workspace/sketchbook/${book.id}?delete=1#delete-heading`}
							>
								Delete this sketchbook
							</Link>
							<span>You will be asked to confirm.</span>
						</p>
					)}
				</section>
			</div>
		</>
	);
}
