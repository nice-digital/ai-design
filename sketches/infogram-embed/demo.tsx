import { InfogramEmbed } from "./InfogramEmbed";
import { dummyInfogram } from "./dummyData";

/** Shows every variant and state of the sketch. Rendered at /sketches/infogram-embed */
export default function Demo() {
	return (
		<>
			<h2>Default</h2>
			<InfogramEmbed {...dummyInfogram}>
				<p>
					Text alternative: the data behind this chart is also available as a
					table.
				</p>
			</InfogramEmbed>

			<h2>Without caption or source</h2>
			<InfogramEmbed
				{...dummyInfogram}
				infogramId="no-caption"
				caption={undefined}
				source={undefined}
			/>

			<h2>Two series, long title</h2>
			<InfogramEmbed
				infogramId="two-series"
				title="Proportion of adults with type 2 diabetes who had their blood glucose checked in the last 12 months, by region of England"
				description="A stacked bar chart showing most adults had their blood glucose checked in each year."
				series={["Checked", "Not checked"]}
				rows={[
					{ label: "2025", values: [82, 18] },
					{ label: "2026", values: [86, 14] }
				]}
				caption="Share of adults checked."
				source="NHS England data"
			/>
		</>
	);
}
