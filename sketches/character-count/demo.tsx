import { CharacterCount } from "./CharacterCount";

/** Shows every variant and state of the sketch. Rendered at /sketches/character-count */
export default function Demo() {
	return (
		<>
			<h2>Default</h2>
			<CharacterCount
				label="Describe the problem"
				name="problem"
				hint="Do not include personal information"
				maxLength={200}
			/>

			<h2>Over the limit</h2>
			<CharacterCount
				label="Short summary"
				name="summary"
				maxLength={20}
				defaultValue="This summary is longer than twenty characters"
			/>
		</>
	);
}
