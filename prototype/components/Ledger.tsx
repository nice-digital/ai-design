import Link from "next/link";

import type { Item } from "../lib/workspace";
import { StatusMark, formatDate } from "./StatusMark";

/** One row per sketch, pattern or design */
export const Ledger = ({ items, empty }: { items: Item[]; empty: string }) =>
	items.length === 0 ? (
		<p className="ws-empty">{empty}</p>
	) : (
		<ol className="ws-ledger">
			{items.map((item, index) => {
				const latest = item.decisions[0];
				return (
					<li className="ws-entry" key={`${item.kind}-${item.slug}`}>
						<span className="ws-entry__number" aria-hidden="true">
							{String(index + 1).padStart(2, "0")}
						</span>
						<div className="ws-entry__main">
							<h3 className="ws-entry__title">
								<Link href={item.url}>{item.title}</Link>
							</h3>
							<p className="ws-entry__description">{item.description}</p>
							{item.prompt && (
								<details className="ws-prompt">
									<summary>
										The request that made this
										<span className="visually-hidden">: {item.title}</span>
									</summary>
									<blockquote>{item.prompt}</blockquote>
								</details>
							)}
							{latest && (
								<p className="ws-entry__decision">
									<span className="ws-label">Latest decision</span> {latest.decision}{" "}
									<span className="ws-entry__when">
										{latest.who}, {formatDate(latest.date)}
									</span>
								</p>
							)}
						</div>
						<div className="ws-entry__side">
							<StatusMark status={item.status} />
							{item.kind === "sketch" && (
								<p className="ws-entry__fact">
									{item.stage === "ready"
										? "Ready to use in designs"
										: "Sketch: not yet usable in designs"}
									{item.hasHandover && ". Packaged for the design system team"}
								</p>
							)}
							{item.type === "pattern" && item.parts.length > 0 && (
								<p className="ws-entry__fact">
									Made from:{" "}
									{item.parts.map((part, index) => (
										<span key={part.href}>
											{index > 0 && ", "}
											{part.from === "design-system" ? (
												<a href={part.href}>{part.name}</a>
											) : (
												<>
													<Link href={part.href}>{part.name}</Link> (sketch)
												</>
											)}
										</span>
									))}
								</p>
							)}
							{item.source && (
								<p className="ws-entry__fact">Brought in from {item.source.split(":")[0]}</p>
							)}
							{item.experimental.length > 0 && (
								<p className="ws-entry__fact">
									Uses {item.experimental.length === 1 ? "a component" : "components"} not yet
									in the design system: {item.experimental.join(", ")}
								</p>
							)}
							<Link className="ws-entry__more" href={`/workspace/${item.kind}/${item.slug}`}>
								Checks, screens and decisions
								<span className="visually-hidden"> for {item.title}</span>
							</Link>
							<Link
								className="ws-entry__more"
								href={`/workspace/${item.kind}/${item.slug}?delete=1#delete-heading`}
							>
								Delete
								<span className="visually-hidden"> {item.title}</span>
							</Link>
						</div>
					</li>
				);
			})}
		</ol>
	);
