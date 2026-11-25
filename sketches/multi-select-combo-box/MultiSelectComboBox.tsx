import classnames from "classnames";
import React, { useId, useRef, useState } from "react";
import { Input } from "@nice-digital/nds-input";

import styles from "./MultiSelectComboBox.module.scss";

export interface MultiSelectComboBoxProps {
	/** Allow any additional props to be passed to the text input */
	[prop: string]: unknown;
	/** Visible label for the field */
	label: string;
	/** Name submitted with the form: one value is sent for each chosen option */
	name: string;
	/** The options people can choose from */
	options: string[];
	/** Extra help shown under the label */
	hint?: string;
	/** Options that are chosen to start with */
	defaultValue?: string[];
	/** Shows the error state with this message */
	errorMessage?: string;
	/** The fewest characters people must type before the list narrows. 0 shows every option on focus */
	minLength?: number;
	/** The most options shown at once */
	maxResults?: number;
	/** The word for the things being chosen, used in announcements, for example "topic" */
	itemName?: string;
	/** Shows the list open when the page loads. Used to show the open state in the demo */
	defaultOpen?: boolean;
	/** Called each time the chosen options change */
	onChange?: (selected: string[]) => void;
	className?: string;
}

/**
 * A filter field where people type to narrow a list and choose several
 * options. Chosen options appear underneath as buttons that remove them.
 * Built on the ARIA 1.2 combobox pattern with a multi-select list. GOV.UK has
 * a single choice accessible autocomplete but no multiple choice version, so
 * the list stays open after each choice. The list sits in the normal flow
 * under the field and pushes content down, so it is never covered by other
 * content and needs no stacking order.
 */
export const MultiSelectComboBox: React.FC<MultiSelectComboBoxProps> = (
	props
) => {
	const {
		label,
		name,
		options,
		hint,
		defaultValue = [],
		errorMessage,
		minLength = 0,
		maxResults = 8,
		itemName = "option",
		defaultOpen = false,
		onChange,
		className,
		...rest
	} = props;

	const id = useId();
	const listId = `${id}-list`;
	const statusId = `${id}-status`;
	const selectedLabelId = `${id}-selected`;
	const inputRef = useRef<HTMLInputElement>(null);
	const skipOpenOnFocus = useRef(false);

	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<string[]>(defaultValue);
	const [isOpen, setIsOpen] = useState(defaultOpen);
	const [activeIndex, setActiveIndex] = useState(-1);
	const [announcement, setAnnouncement] = useState("");

	// The field shows the chosen options as a comma separated list, followed by
	// whatever the person is typing to narrow the list
	// The separator only appears once something is typed after the last choice
	const chosenText = selected.join(", ");
	const fieldValue =
		query === "" || chosenText === ""
			? `${chosenText}${query}`
			: `${chosenText}, ${query}`;
	// The error no longer applies once at least one option is chosen
	const visibleError = selected.length === 0 ? errorMessage : undefined;

	const search = query.trim().toLowerCase();
	const canSearch = search.length >= minLength;
	const results = canSearch
		? options
				.filter((option) => option.toLowerCase().includes(search))
				.slice(0, maxResults)
		: [];
	const showList = isOpen && canSearch;
	const optionId = (index: number) => `${listId}-option-${index}`;

	const update = (next: string[], message: string) => {
		setSelected(next);
		setAnnouncement(`${message}. ${next.length} ${itemName}${next.length === 1 ? "" : "s"} selected.`);
		onChange?.(next);
	};

	const toggle = (option: string) => {
		if (selected.includes(option)) {
			update(
				selected.filter((item) => item !== option),
				`${option} removed`
			);
		} else {
			update([...selected, option], `${option} added`);
		}
		// The choice now shows in the field, so the typed text starts again
		setQuery("");
		setActiveIndex(-1);
	};

	// Typing happens after the comma separated choices. Editing into the
	// choices removes the ones that were broken, and backspace over the
	// separator removes the last choice.
	const handleInputChange = (value: string) => {
		// Typing straight after the last choice, before the separator is shown
		if (
			query === "" &&
			selected.length > 0 &&
			value.length > chosenText.length &&
			value.startsWith(chosenText)
		) {
			setQuery(value.slice(chosenText.length).replace(/^[,\s]+/, ""));
			setAnnouncement("");
			setIsOpen(true);
			setActiveIndex(-1);
			return;
		}
		const parts = value.split(",");
		const typed = (parts.pop() ?? "").replace(/^\s+/, "");
		const kept = parts
			.map((part) => part.trim())
			.filter((part) => selected.includes(part));
		const unchanged =
			kept.length === selected.length &&
			kept.every((item, index) => item === selected[index]);

		if (!unchanged) {
			const removed = selected.filter((item) => !kept.includes(item));
			update(
				kept,
				removed.length === 1 ? `${removed[0]} removed` : "Choices removed"
			);
			setQuery(typed);
		} else if (
			typed === "" &&
			query === "" &&
			selected.length > 0 &&
			value.length < fieldValue.length
		) {
			const last = selected[selected.length - 1];
			update(selected.slice(0, -1), `${last} removed`);
			setQuery("");
			setIsOpen(true);
			setActiveIndex(-1);
			return;
		} else {
			setQuery(typed);
			setAnnouncement("");
		}
		setIsOpen(true);
		setActiveIndex(-1);
	};

	// Return focus to the field after removing. A closed list stays closed and
	// an open list stays open.
	const focusInputWithoutOpening = () => {
		const wasOpen = isOpen;
		skipOpenOnFocus.current = true;
		inputRef.current?.focus();
		skipOpenOnFocus.current = false;
		setIsOpen(wasOpen);
	};

	const remove = (option: string) => {
		update(
			selected.filter((item) => item !== option),
			`${option} removed`
		);
		focusInputWithoutOpening();
	};

	const clearAll = () => {
		update([], "All cleared");
		focusInputWithoutOpening();
	};

	let status = announcement;
	if (!announcement && showList) {
		status =
			results.length === 0
				? "No results found"
				: `${results.length} ${results.length === 1 ? "result" : "results"} available. Use the up and down arrow keys to review and enter to select.`;
	}

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
				// Never submit the form while the list is open
				if (showList) {
					e.preventDefault();
					if (activeIndex >= 0 && results[activeIndex]) {
						toggle(results[activeIndex]);
					}
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
			className={classnames(styles["multi-select-combo-box"], className)}
			data-component="multi-select-combo-box"
			onBlur={(e) => {
				if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
					setIsOpen(false);
					setActiveIndex(-1);
				}
			}}
		>
			<div className={styles["multi-select-combo-box__field"]}>
				<Input
					label={label}
					name={`${name}-search`}
					hint={hint}
					error={Boolean(visibleError)}
					errorMessage={visibleError}
					inputRef={inputRef}
					value={fieldValue}
					autoComplete="off"
					role="combobox"
					aria-autocomplete="list"
					aria-expanded={showList}
					aria-controls={listId}
					aria-activedescendant={
						showList && activeIndex >= 0 ? optionId(activeIndex) : undefined
					}
					aria-describedby={statusId}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						handleInputChange(e.target.value)
					}
					onFocus={() => {
						if (!skipOpenOnFocus.current) setIsOpen(true);
					}}
					// The field may already have focus (for example after removing a
					// tag), so a click must open the list as well as focus
					onClick={() => setIsOpen(true)}
					onKeyDown={handleKeyDown}
					{...rest}
				/>

				<ul
					id={listId}
					role="listbox"
					aria-label={label}
					aria-multiselectable="true"
					hidden={!showList}
					className={classnames(styles["multi-select-combo-box__list"], {
						[styles["multi-select-combo-box__list--hidden"]]: !showList
					})}
				>
					{results.map((option, index) => {
						const isSelected = selected.includes(option);
						return (
							<li
								key={option}
								id={optionId(index)}
								role="option"
								aria-selected={isSelected}
								className={classnames(styles["multi-select-combo-box__option"], {
									[styles["multi-select-combo-box__option--active"]]:
										index === activeIndex
								})}
								// Keep focus in the text field so the list stays open
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => {
									setAnnouncement("");
									toggle(option);
								}}
								// Options are operated from the text field; this mirrors the click
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										setAnnouncement("");
										toggle(option);
									}
								}}
							>
								<span
									aria-hidden="true"
									className={styles["multi-select-combo-box__tick"]}
								>
									{isSelected ? "\u2713" : ""}
								</span>
								{option}
							</li>
						);
					})}
					{showList && results.length === 0 && (
						<li
							role="presentation"
							className={classnames(
								styles["multi-select-combo-box__option"],
								styles["multi-select-combo-box__option--empty"]
							)}
						>
							No results found
						</li>
					)}
				</ul>
			</div>

			<p
				id={statusId}
				role="status"
				aria-live="polite"
				className={styles["multi-select-combo-box__status"]}
			>
				{status}
			</p>

			{selected.length > 0 && (
				<div className={styles["multi-select-combo-box__selected"]}>
					<p
						id={selectedLabelId}
						className={styles["multi-select-combo-box__selected-label"]}
					>
						Selected ({selected.length})
					</p>
					<ul
						aria-labelledby={selectedLabelId}
						className={styles["multi-select-combo-box__chips"]}
					>
						{selected.map((option) => (
							<li key={option}>
								<button
									type="button"
									className={styles["multi-select-combo-box__chip"]}
									// Stops the click closing an open list in browsers that blur the field
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => remove(option)}
								>
									{option}
									<span
										aria-hidden="true"
										className={styles["multi-select-combo-box__chip-cross"]}
									>
										{"\u00d7"}
									</span>
									<span className={styles["multi-select-combo-box__hidden"]}>
										{" "}
										Remove {option}
									</span>
								</button>
							</li>
						))}
					</ul>
					{selected.length > 1 && (
						<button
							type="button"
							className={styles["multi-select-combo-box__clear"]}
							onMouseDown={(e) => e.preventDefault()}
							onClick={clearAll}
						>
							Clear all
						</button>
					)}
				</div>
			)}

			{selected.map((option) => (
				<input key={option} type="hidden" name={name} value={option} />
			))}
		</div>
	);
};
