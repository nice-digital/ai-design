import classnames from "classnames";
import React, { useId, useRef, useState } from "react";
import { Input } from "@nice-digital/nds-input";

import styles from "./ComboBox.module.scss";

export interface ComboBoxProps {
	/** Allow any additional props to be passed to the text input */
	[prop: string]: unknown;
	/** Visible label for the field */
	label: string;
	/** Name and id of the text input */
	name: string;
	/** The suggestions people can choose from */
	options: string[];
	/** Extra help shown under the label */
	hint?: string;
	/** Text the field starts with */
	defaultValue?: string;
	/** Shows the error state with this message */
	errorMessage?: string;
	/** The fewest characters people must type before suggestions appear */
	minLength?: number;
	/** The most suggestions shown at once */
	maxResults?: number;
	/** Called when someone chooses a suggestion */
	onSelect?: (option: string) => void;
	className?: string;
}

/**
 * A text field with a list of suggestions that narrows as people type.
 * People can type their own answer or choose a suggestion, with the mouse,
 * finger or keyboard. Follows the GOV.UK accessible autocomplete pattern and
 * the ARIA 1.2 combobox pattern with a list.
 */
export const ComboBox: React.FC<ComboBoxProps> = (props) => {
	const {
		label,
		name,
		options,
		hint,
		defaultValue = "",
		errorMessage,
		minLength = 1,
		maxResults = 8,
		onSelect,
		className,
		...rest
	} = props;

	const listId = `${useId()}-list`;
	const statusId = `${useId()}-status`;
	const inputRef = useRef<HTMLInputElement>(null);

	const [value, setValue] = useState(defaultValue);
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);

	const query = value.trim().toLowerCase();
	const canSearch = query.length >= minLength;
	const results = canSearch
		? options
				.filter((option) => option.toLowerCase().includes(query))
				.slice(0, maxResults)
		: [];
	const showList = isOpen && canSearch;
	const optionId = (index: number) => `${listId}-option-${index}`;

	let status = "";
	if (showList) {
		status =
			results.length === 0
				? "No results found"
				: `${results.length} ${results.length === 1 ? "result" : "results"} available. Use the up and down arrow keys to review and enter to select.`;
	}

	const choose = (option: string) => {
		setValue(option);
		setIsOpen(false);
		setActiveIndex(-1);
		onSelect?.(option);
		inputRef.current?.focus();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				if (!showList) {
					setIsOpen(true);
				} else if (results.length > 0) {
					setActiveIndex((activeIndex + 1) % results.length);
				}
				break;
			case "ArrowUp":
				e.preventDefault();
				if (showList && results.length > 0) {
					setActiveIndex(
						activeIndex <= 0 ? results.length - 1 : activeIndex - 1
					);
				}
				break;
			case "Enter":
				if (showList && activeIndex >= 0 && results[activeIndex]) {
					e.preventDefault();
					choose(results[activeIndex]);
				}
				break;
			case "Escape":
				if (showList) {
					e.preventDefault();
					setIsOpen(false);
					setActiveIndex(-1);
				}
				break;
		}
	};

	return (
		<div
			className={classnames(styles["combo-box"], className)}
			data-component="combo-box"
			onBlur={(e) => {
				if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
					setIsOpen(false);
					setActiveIndex(-1);
				}
			}}
		>
			<Input
				label={label}
				name={name}
				hint={hint}
				error={Boolean(errorMessage)}
				errorMessage={errorMessage}
				inputRef={inputRef}
				value={value}
				autoComplete="off"
				role="combobox"
				aria-autocomplete="list"
				aria-expanded={showList}
				aria-controls={listId}
				aria-activedescendant={
					showList && activeIndex >= 0 ? optionId(activeIndex) : undefined
				}
				aria-describedby={statusId}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					setValue(e.target.value);
					setIsOpen(true);
					setActiveIndex(-1);
				}}
				onKeyDown={handleKeyDown}
				{...rest}
			/>

			<ul
				id={listId}
				role="listbox"
				aria-label={label}
				hidden={!showList}
				className={classnames(styles["combo-box__list"], {
					[styles["combo-box__list--hidden"]]: !showList
				})}
			>
				{results.map((option, index) => (
					<li
						key={option}
						id={optionId(index)}
						role="option"
						aria-selected={index === activeIndex}
						className={classnames(styles["combo-box__option"], {
							[styles["combo-box__option--active"]]: index === activeIndex
						})}
						// Keep focus in the text field so the list stays open
						onMouseDown={(e) => e.preventDefault()}
						onClick={() => choose(option)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								choose(option);
							}
						}}
					>
						{option}
					</li>
				))}
				{showList && results.length === 0 && (
					<li
						role="presentation"
						className={classnames(
							styles["combo-box__option"],
							styles["combo-box__option--empty"]
						)}
					>
						No results found
					</li>
				)}
			</ul>

			<p
				id={statusId}
				role="status"
				aria-live="polite"
				className={styles["combo-box__status"]}
			>
				{status}
			</p>
		</div>
	);
};
