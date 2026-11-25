import classnames from "classnames";
import React from "react";

import styles from "./InfogramEmbed.module.scss";

/** One bar in the stand-in chart. Values are percentages that add up to 100 */
export interface InfogramRow {
	/** Label for the bar, for example a year */
	label: string;
	/** One value for each series, in the same order as the series */
	values: number[];
}

export interface InfogramEmbedProps {
	/** Allow any additional props to be passed to the root element */
	[prop: string]: unknown;
	/** The id of the Infogram, as entered in the Storyblok block. The live embed loads from this id */
	infogramId: string;
	/** Short title that says what the chart shows. Also used as the name of the embedded chart */
	title: string;
	/** A plain-text summary of the main message of the chart, read out instead of the chart by screen readers */
	description: string;
	/** Names of the data series, shown in the key. At most 3 */
	series: string[];
	/** Dummy data used to draw the stand-in chart in the preview */
	rows: InfogramRow[];
	/** Caption shown under the chart */
	caption?: string;
	/** Where the data comes from */
	source?: string;
	/** A text alternative to the chart, such as a data table. Always provide one */
	children?: React.ReactNode;
	className?: string;
}

/**
 * A Storyblok content block that embeds an Infogram chart.
 * In the live site the chart loads from the Infogram id. Here, a simple stacked bar chart
 * drawn from dummy data stands in for it, so the block can be designed without a network request.
 */
export const InfogramEmbed: React.FC<InfogramEmbedProps> = (props) => {
	const {
		infogramId,
		title,
		description,
		series,
		rows,
		caption,
		source,
		children,
		className,
		...rest
	} = props;

	const titleId = `infogram-${infogramId}-title`;
	const descriptionId = `infogram-${infogramId}-description`;

	return (
		<figure
			className={classnames(styles["infogram-embed"], className)}
			data-component="infogram-embed"
			data-infogram-id={infogramId}
			aria-labelledby={titleId}
			aria-describedby={descriptionId}
			{...rest}
		>
			<p id={titleId} className={styles["infogram-embed__title"]}>
				{title}
			</p>
			<p id={descriptionId} className="visually-hidden">
				{description}
			</p>

			<ul className={styles["infogram-embed__key"]} aria-hidden="true">
				{series.map((name, i) => (
					<li key={name} className={styles["infogram-embed__key-item"]}>
						<span
							className={classnames(
								styles["infogram-embed__swatch"],
								styles[`infogram-embed__swatch--${i + 1}`]
							)}
						/>
						{name}
					</li>
				))}
			</ul>

			<div className={styles["infogram-embed__chart"]} aria-hidden="true">
				{rows.map((row) => {
					let start = 0;
					return (
						<div key={row.label} className={styles["infogram-embed__row"]}>
							<span className={styles["infogram-embed__label"]}>
								{row.label}
							</span>
							<svg
								className={styles["infogram-embed__bar"]}
								viewBox="0 0 100 10"
								preserveAspectRatio="none"
								focusable="false"
							>
								{row.values.map((value, i) => {
									const x = start;
									start += value;
									return (
										<rect
											key={i}
											className={styles[`infogram-embed__segment--${i + 1}`]}
											x={x}
											y={0}
											width={value}
											height={10}
										/>
									);
								})}
							</svg>
							<span className={styles["infogram-embed__values"]}>
								{row.values.map((v) => `${v}%`).join(" / ")}
							</span>
						</div>
					);
				})}
			</div>

			{(caption || source) && (
				<figcaption className={styles["infogram-embed__caption"]}>
					{caption}
					{caption && source ? " " : null}
					{source ? `Source: ${source}.` : null}
				</figcaption>
			)}

			{children && (
				<div className={styles["infogram-embed__alternative"]}>{children}</div>
			)}
		</figure>
	);
};
