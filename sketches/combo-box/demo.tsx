import { ComboBox } from "./ComboBox";

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

/** Shows every variant and state of the sketch. Rendered at /sketches/combo-box */
export default function Demo() {
	return (
		<>
			<h2>Default</h2>
			<ComboBox
				label="Health topic"
				name="topic"
				hint="Start typing, then choose from the list or keep your own words"
				options={topics}
			/>

			<h2>With a starting value</h2>
			<ComboBox
				label="Condition you are interested in"
				name="condition"
				options={topics}
				defaultValue="Diabetes"
			/>

			<h2>Wait for 3 characters before suggesting</h2>
			<ComboBox
				label="Health topic"
				name="topic-min"
				hint="Suggestions appear after you type 3 characters"
				options={topics}
				minLength={3}
			/>

			<h2>Error</h2>
			<ComboBox
				label="Health topic"
				name="topic-error"
				options={topics}
				errorMessage="Enter a health topic"
			/>
		</>
	);
}
