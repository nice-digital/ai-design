import { MultiSelectComboBox } from "./MultiSelectComboBox";

const topics = [
	"Cancer",
	"Cardiovascular conditions",
	"Chronic pain",
	"Dementia",
	"Diabetes",
	"Eye conditions",
	"Heart failure",
	"Infections",
	"Kidney conditions",
	"Mental health and behavioural conditions",
	"Respiratory conditions",
	"Skin conditions"
];

/** Shows every variant and state of the sketch. Rendered at /sketches/multi-select-combo-box */
export default function Demo() {
	return (
		<>
			<h2>Default</h2>
			<MultiSelectComboBox
				label="Health topics"
				name="topics"
				itemName="topic"
				hint="Start typing, then choose as many as you need"
				options={topics}
			/>

			<h2>List open, with a field below</h2>
			<MultiSelectComboBox
				label="Health topics"
				name="topics-open"
				itemName="topic"
				options={topics}
				defaultValue={["Diabetes"]}
				defaultOpen
			/>
			<MultiSelectComboBox
				label="Age group"
				name="age-group"
				itemName="age group"
				options={["Children", "Young people", "Adults", "Older adults"]}
			/>

			<h2>With options already chosen</h2>
			<MultiSelectComboBox
				label="Health topics"
				name="topics-chosen"
				itemName="topic"
				options={topics}
				defaultValue={["Diabetes", "Kidney conditions", "Heart failure"]}
			/>

			<h2>Long option names</h2>
			<MultiSelectComboBox
				label="Health topics"
				name="topics-long"
				itemName="topic"
				options={topics}
				defaultValue={[
					"Mental health and behavioural conditions",
					"Cardiovascular conditions"
				]}
			/>

			<h2>Wait for 2 characters before narrowing</h2>
			<MultiSelectComboBox
				label="Health topics"
				name="topics-min"
				itemName="topic"
				hint="The list appears after you type 2 characters"
				options={topics}
				minLength={2}
			/>

			<h2>Error</h2>
			<MultiSelectComboBox
				label="Health topics"
				name="topics-error"
				itemName="topic"
				options={topics}
				errorMessage="Choose at least one health topic"
			/>
		</>
	);
}
