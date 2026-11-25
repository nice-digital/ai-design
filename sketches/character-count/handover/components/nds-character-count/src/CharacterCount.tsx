import classnames from "classnames";
import React, { useState } from "react";
import { Textarea } from "@nice-digital/nds-textarea";

import "./../scss/character-count.scss";

export interface CharacterCountProps {
	/** Allow any additional props to be passed to the textarea */
	[prop: string]: unknown;
	/** Visible label for the textarea */
	label: string;
	/** Name and id of the textarea */
	name: string;
	/** The most characters people can enter */
	maxLength: number;
	/** Extra help shown under the label */
	hint?: string;
	defaultValue?: string;
	className?: string;
}

/**
 * A textarea that tells people how many characters they have left.
 * It never blocks typing: going over the limit shows an error instead.
 */
export const CharacterCount: React.FC<CharacterCountProps> = (props) => {
	const { label, name, maxLength, hint, defaultValue = "", className, ...rest } =
		props;
	const [length, setLength] = useState(defaultValue.length);

	const remaining = maxLength - length;
	const isOver = remaining < 0;
	const plural = (count: number) => (count === 1 ? "character" : "characters");
	const message = isOver
		? `You have ${-remaining} ${plural(-remaining)} too many`
		: `You have ${remaining} ${plural(remaining)} remaining`;

	return (
		<div
			className={classnames("character-count", className)}
			data-component="character-count"
		>
			<Textarea
				label={label}
				name={name}
				hint={hint}
				defaultValue={defaultValue}
				error={isOver}
				errorMessage={`${label} must be ${maxLength} characters or fewer`}
				aria-describedby={`${name}-count`}
				onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
					setLength(e.target.value.length)
				}
				{...rest}
			/>
			<p
				id={`${name}-count`}
				aria-live="polite"
				className={classnames("character-count__message", {
					"character-count__message--over": isOver
				})}
			>
				{message}
			</p>
		</div>
	);
};
