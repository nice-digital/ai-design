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

	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<string[]>(defaultValue);
	const [isOpen, setIsOpen] = useState(defaultOpen);
	const [activeIndex, setActiveIndex] = useState(-1);
	const [announcement, setAnnouncement] = useState("");

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
	};

	const remove = (option: string) => {
		update(
			selected.filter((item) => item !== option),
			`${option} removed`
		);
		inputRef.current?.focus();
	};

	const clearAll = () => {
		update([], "All cleared");
		inputRef.current?.focus();
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
					error={Boolean(errorMessage)}
					errorMessage={errorMessage}
					inputRef={inputRef}
					value={query}
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
						setQuery(e.target.value);
						setIsOpen(true);
						setActiveIndex(-1);
						setAnnouncement("");
					}}
					onFocus={() => setIsOpen(true)}
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
