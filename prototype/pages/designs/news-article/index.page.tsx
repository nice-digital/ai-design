import Head from "next/head";
import { useRef, useState } from "react";
import { Accordion } from "@nice-digital/nds-accordion";
import { Alert } from "@nice-digital/nds-alert";
import { Button } from "@nice-digital/nds-button";
import { Breadcrumb, Breadcrumbs } from "@nice-digital/nds-breadcrumbs";
import { Card } from "@nice-digital/nds-card";
import { FormGroup } from "@nice-digital/nds-form-group";
import { Grid, GridItem } from "@nice-digital/nds-grid";
import { PageHeader } from "@nice-digital/nds-page-header";
import { Radio } from "@nice-digital/nds-radio";
import { Table } from "@nice-digital/nds-table";
import { Tag } from "@nice-digital/nds-tag";
import { CharacterCount } from "@sketches/character-count";
import { InfogramEmbed, dummyInfogram } from "@sketches/infogram-embed";

import { article, relatedNews, treatmentData } from "./article";

type FeedbackState = "editing" | "error" | "sent";

export default function NewsArticlePage() {
	const [state, setState] = useState<FeedbackState>("editing");
	const [useful, setUseful] = useState<string | null>(null);
	const summaryRef = useRef<HTMLDivElement>(null);
	const confirmationRef = useRef<HTMLDivElement>(null);

	const errorMessage = "Select yes or no to say if this page was useful";

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!useful) {
			setState("error");
			// Wait for the error summary to render, then move focus to it
			setTimeout(() => summaryRef.current?.focus(), 0);
			return;
		}
		setState("sent");
		setTimeout(() => confirmationRef.current?.focus(), 0);
	};

	return (
		<>
			<Head>
				<title>
					{`${state === "error" ? "Error: " : ""}${article.title} | News | NICE`}
				</title>
			</Head>

			<PageHeader
				breadcrumbs={
					<Breadcrumbs>
						<Breadcrumb to="#">Home</Breadcrumb>
						<Breadcrumb to="#">News</Breadcrumb>
					</Breadcrumbs>
				}
				heading={article.title}
				lead={article.lead}
				metadata={[
					<Tag key="category">{article.category}</Tag>,
					`Published: ${article.published}`
				]}
			/>

			<Grid gutter="loose">
				<GridItem cols={12} md={9} lg={8}>
					<article>
						<p>
							People with type 2 diabetes will have more choice of treatments
							to help them manage their blood glucose, under updated guidance
							from NICE.
						</p>
						<p>
							The guidance says that doctors should talk with each person about
							their risk of heart and kidney problems, as well as their blood
							glucose levels, when deciding which medicines to offer.
						</p>

						<h2>What has changed</h2>
						<p>
							Until now, most people started on metformin alone. The guidance
							now recommends that people who also have heart failure, chronic
							kidney disease or a high risk of cardiovascular disease are
							offered an additional medicine earlier.
						</p>
						<p>
							The infographic below shows how the mix of treatments offered has
							changed over the last 5 years.
						</p>

						<h2>Treatment offered over time</h2>
						<InfogramEmbed {...dummyInfogram}>
							<Accordion
								title="View the infographic data as a table"
								headingLevel={3}
							>
								<Table>
									<caption>{treatmentData.caption}</caption>
									<thead>
										<tr>
											{treatmentData.headers.map((header) => (
												<th key={header} scope="col">
													{header}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{treatmentData.rows.map(([year, ...values]) => (
											<tr key={year}>
												<th scope="row">{year}</th>
												{values.map((value, i) => (
													<td key={i}>{value}</td>
												))}
											</tr>
										))}
									</tbody>
								</Table>
							</Accordion>
						</InfogramEmbed>

						<h2>What this means for people with diabetes</h2>
						<p>
							Anyone who is worried about their treatment should speak to their
							GP or diabetes care team. Nobody should stop taking their
							medicines without talking to a healthcare professional first.
						</p>
					</article>

					<section aria-labelledby="feedback-heading">
						<h2 id="feedback-heading">Help us improve this page</h2>

						{state === "sent" ? (
							<div ref={confirmationRef} tabIndex={-1}>
								<Alert type="success" role="status">
									<p>
										<strong>Thank you for your feedback.</strong>
									</p>
									<p>
										We use feedback to improve our news. We cannot reply to
										individual comments. If you need help with a health
										problem, speak to your GP.
									</p>
								</Alert>
							</div>
						) : (
							<form onSubmit={handleSubmit} noValidate>
								{state === "error" && (
									<div ref={summaryRef} tabIndex={-1}>
										<Alert type="error" role="alert">
											<h3>There is a problem</h3>
											<ul>
												<li>
													<a href="#useful_yes">{errorMessage}</a>
												</li>
											</ul>
										</Alert>
									</div>
								)}

								<FormGroup
									legend="Was this page useful?"
									name="useful"
									groupError={state === "error" ? errorMessage : undefined}
								>
									<Radio
										label="Yes"
										value="yes"
										onChange={() => setUseful("yes")}
									/>
									<Radio
										label="No"
										value="no"
										onChange={() => setUseful("no")}
									/>
								</FormGroup>

								<CharacterCount
									label="How could we improve this page? (optional)"
									name="improve"
									hint="Do not include personal information such as your name or health details."
									maxLength={500}
								/>

								<Button variant="cta" buttonType="submit">
									Send feedback
								</Button>
							</form>
						)}
					</section>
				</GridItem>

				<GridItem cols={12} md={3} lg={4}>
					<h2>Related news</h2>
					<ul className="list list--unstyled">
						{relatedNews.map((item) => (
							<Card
								elementType="li"
								key={item.id}
								headingText={item.title}
								headingLevel={3}
								link={{ destination: "#" }}
								summary={item.summary}
								metadata={[{ label: "Published", value: item.published }]}
							/>
						))}
					</ul>
				</GridItem>
			</Grid>
		</>
	);
}
