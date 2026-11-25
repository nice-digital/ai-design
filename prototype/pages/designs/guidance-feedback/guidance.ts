export interface Guidance {
	id: string;
	title: string;
	type: "NICE guideline" | "Technology appraisal" | "Quality standard";
	published: string;
	summary: string;
}

/** Example content only */
export const guidance: Guidance[] = [
	{
		id: "ng28",
		title: "Type 2 diabetes in adults: management",
		type: "NICE guideline",
		published: "June 2022",
		summary: "Covers care and management of type 2 diabetes in adults."
	},
	{
		id: "ng136",
		title: "Hypertension in adults: diagnosis and management",
		type: "NICE guideline",
		published: "November 2023",
		summary: "Covers identifying and treating high blood pressure in adults."
	},
	{
		id: "ta875",
		title: "Semaglutide for managing overweight and obesity",
		type: "Technology appraisal",
		published: "September 2023",
		summary: "Evidence-based recommendations on semaglutide for adults."
	},
	{
		id: "qs6",
		title: "Diabetes in adults",
		type: "Quality standard",
		published: "March 2023",
		summary: "Covers care and treatment for adults with diabetes."
	}
];

export const guidanceTypes = [
	"NICE guideline",
	"Technology appraisal",
	"Quality standard"
] as const;
