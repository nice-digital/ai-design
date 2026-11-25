import type { InfogramRow } from "./InfogramEmbed";

/** Dummy data for the stand-in chart. Not real NHS figures */
export const dummyInfogram = {
	infogramId: "treatment-offered-2022-2026",
	title: "Treatment offered to people with type 2 diabetes, 2022 to 2026",
	description:
		"A stacked bar chart. The share of people offered metformin only falls from 41% in 2022 to 27% in 2026. The share offered metformin and one other treatment rises from 38% to 46%. The share offered three or more treatments rises from 21% to 27%.",
	series: ["Metformin only", "Metformin and one other", "Three or more treatments"],
	rows: [
		{ label: "2022", values: [41, 38, 21] },
		{ label: "2023", values: [38, 40, 22] },
		{ label: "2024", values: [34, 42, 24] },
		{ label: "2025", values: [31, 44, 25] },
		{ label: "2026", values: [27, 46, 27] }
	] as InfogramRow[],
	caption: "Share of people offered each type of treatment.",
	source: "NHS England data"
};
