import { FeedbackForm } from "./FeedbackForm";

/** Shows every variant and state of the pattern. Rendered at /sketches/feedback-form */
export default function Demo() {
	return (
		<>
			<h2>Default</h2>
			<FeedbackForm
				question="What guidance were you looking for?"
				name="looking-for"
				hint="Do not include personal information"
			/>

			<h2>Short limit and custom button</h2>
			<FeedbackForm
				question="Describe the problem in a few words"
				name="problem"
				maxLength={80}
				buttonText="Report problem"
				thanks="Thank you. We will look into it."
			/>
		</>
	);
}
