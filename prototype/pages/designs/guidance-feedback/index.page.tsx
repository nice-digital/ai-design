import Head from "next/head";
import { useState } from "react";
import { Alert } from "@nice-digital/nds-alert";
import { Button } from "@nice-digital/nds-button";
import { Card } from "@nice-digital/nds-card";
import {
	FilterGroup,
	FilterOption,
	FilterPanel,
	FilterSummary
} from "@nice-digital/nds-filters";
import { Grid, GridItem } from "@nice-digital/nds-grid";
import { PageHeader } from "@nice-digital/nds-page-header";
import { CharacterCount } from "@sketches/character-count";

import { guidance, guidanceTypes } from "./guidance";

export default function GuidanceFeedbackPage() {
	const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
	const [feedbackSent, setFeedbackSent] = useState(false);

	const toggleType = (type: string) =>
		setSelectedTypes((current) =>
			current.includes(type)
				? current.filter((t) => t !== type)
				: [...current, type]
		);

	const results = guidance.filter(
		(item) => selectedTypes.length === 0 || selectedTypes.includes(item.type)
	);

	return (
		<>
			<Head>
				<title>Guidance feedback</title>
			</Head>
			<PageHeader
				heading="Diabetes guidance"
				lead="Filter the list, then tell us what is missing."
			/>

			<Grid gutter="loose">
				<GridItem cols={12} md={4} lg={3}>
					<FilterPanel
						heading="Filter"
						onSubmit={(e) => e.preventDefault()}
					>
						<FilterGroup
							heading="Type"
							selectedCount={selectedTypes.length}
						>
							{guidanceTypes.map((type) => (
								<FilterOption
									key={type}
									value={type}
									isSelected={selectedTypes.includes(type)}
									onChanged={() => toggleType(type)}
								>
									{type}
								</FilterOption>
							))}
						</FilterGroup>
					</FilterPanel>
				</GridItem>

				<GridItem cols={12} md={8} lg={9}>
					<FilterSummary
						activeFilters={selectedTypes.map((type) => ({
							label: type,
							destination: "#",
							onClick: (e: React.MouseEvent) => {
								e.preventDefault();
								toggleType(type);
							}
						}))}
					>
						Showing {results.length} of {guidance.length}
					</FilterSummary>

					<ul className="list list--unstyled">
						{results.map((item) => (
							<Card
								elementType="li"
								key={item.id}
								headingText={item.title}
								headingLevel={2}
								link={{ destination: "#" }}
								summary={item.summary}
								metadata={[
									{ label: "Type", value: item.type },
									{ label: "Published", value: item.published }
								]}
							/>
						))}
					</ul>

					<h2>Tell us what is missing</h2>
					{feedbackSent ? (
						<Alert type="success" role="status">
							<p>Thank you. We have received your feedback.</p>
						</Alert>
					) : (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								setFeedbackSent(true);
							}}
						>
							<CharacterCount
								label="What guidance were you looking for?"
								name="feedback"
								hint="Do not include personal information"
								maxLength={300}
							/>
							<Button variant="cta" buttonType="submit">
								Send feedback
							</Button>
						</form>
					)}
				</GridItem>
			</Grid>
		</>
	);
}
