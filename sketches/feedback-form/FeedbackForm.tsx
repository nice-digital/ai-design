import classnames from "classnames";
import React, { useState } from "react";
import { Alert } from "@nice-digital/nds-alert";
import { Button } from "@nice-digital/nds-button";
import { CharacterCount } from "@sketches/character-count";

import styles from "./FeedbackForm.module.scss";

/**
 * Pattern: a single question with a character-limited answer.
 * Composed of: CharacterCount (sketch), Button and Alert (design system).
 * Use it for short, optional feedback at the end of a page. For anything with
 * more than one question, use question pages instead.
 */
export interface FeedbackFormProps {
	/** The question, used as the label */
	question: string;
	/** Name and id of the field */
	name: string;
	/** Help shown under the question */
	hint?: string;
	/** The most characters people can enter */
	maxLength?: number;
	/** Text of the submit button */
	buttonText?: string;
	/** Message shown once the feedback has been sent */
	thanks?: string;
	className?: string;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = (props) => {
	const {
		question,
		name,
		hint,
		maxLength = 300,
		buttonText = "Send feedback",
		thanks = "Thank you. We have received your feedback.",
		className
	} = props;
	const [sent, setSent] = useState(false);

	if (sent)
		return (
			<Alert type="success" role="status">
				<p>{thanks}</p>
			</Alert>
		);

	return (
		<form
			className={classnames(styles["feedback-form"], className)}
			data-component="feedback-form"
			onSubmit={(e) => {
				e.preventDefault();
				setSent(true);
			}}
		>
			<CharacterCount label={question} name={name} hint={hint} maxLength={maxLength} />
			<Button variant="cta" buttonType="submit">
				{buttonText}
			</Button>
		</form>
	);
};
