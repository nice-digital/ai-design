import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CharacterCount } from "./CharacterCount";

describe("CharacterCount", () => {
	it("should render a labelled textarea", () => {
		render(<CharacterCount label="Your comment" name="comment" maxLength={50} />);
		expect(screen.getByLabelText("Your comment")).toHaveProperty(
			"tagName",
			"TEXTAREA"
		);
	});

	it("should show how many characters remain", () => {
		render(<CharacterCount label="Your comment" name="comment" maxLength={50} />);
		expect(
			screen.getByText("You have 50 characters remaining")
		).toBeInTheDocument();
	});

	it("should count down as the user types", async () => {
		const user = userEvent.setup();
		render(<CharacterCount label="Your comment" name="comment" maxLength={10} />);
		await user.type(screen.getByLabelText("Your comment"), "Hello");
		expect(
			screen.getByText("You have 5 characters remaining")
		).toBeInTheDocument();
	});

	it("should use the singular when 1 character remains", async () => {
		const user = userEvent.setup();
		render(<CharacterCount label="Your comment" name="comment" maxLength={3} />);
		await user.type(screen.getByLabelText("Your comment"), "Hi");
		expect(
			screen.getByText("You have 1 character remaining")
		).toBeInTheDocument();
	});

	it("should count the default value", () => {
		render(
			<CharacterCount
				label="Your comment"
				name="comment"
				maxLength={10}
				defaultValue="Hello"
			/>
		);
		expect(
			screen.getByText("You have 5 characters remaining")
		).toBeInTheDocument();
	});

	it("should not stop the user typing past the limit", async () => {
		const user = userEvent.setup();
		render(<CharacterCount label="Your comment" name="comment" maxLength={3} />);
		const textarea = screen.getByLabelText("Your comment");
		await user.type(textarea, "Hello");
		expect(textarea).toHaveValue("Hello");
	});

	it("should show an error and how many characters over when past the limit", async () => {
		const user = userEvent.setup();
		render(<CharacterCount label="Your comment" name="comment" maxLength={3} />);
		await user.type(screen.getByLabelText("Your comment"), "Hello");
		expect(
			screen.getByText("You have 2 characters too many")
		).toBeInTheDocument();
		expect(
			screen.getByText("Your comment must be 3 characters or fewer")
		).toBeInTheDocument();
	});

	it("should clear the error when back under the limit", async () => {
		const user = userEvent.setup();
		render(<CharacterCount label="Your comment" name="comment" maxLength={3} />);
		const textarea = screen.getByLabelText("Your comment");
		await user.type(textarea, "Hello");
		await user.clear(textarea);
		expect(
			screen.queryByText("Your comment must be 3 characters or fewer")
		).not.toBeInTheDocument();
	});

	it("should describe the textarea with the count message", () => {
		render(<CharacterCount label="Your comment" name="comment" maxLength={50} />);
		const message = screen.getByText("You have 50 characters remaining");
		expect(message).toHaveAttribute("id", "comment-count");
		expect(screen.getByLabelText("Your comment")).toHaveAttribute(
			"aria-describedby",
			"comment-count"
		);
	});

	it("should announce changes to the count politely", () => {
		render(<CharacterCount label="Your comment" name="comment" maxLength={50} />);
		expect(
			screen.getByText("You have 50 characters remaining")
		).toHaveAttribute("aria-live", "polite");
	});

	it("should show the hint", () => {
		render(
			<CharacterCount
				label="Your comment"
				name="comment"
				maxLength={50}
				hint="Do not include personal information"
			/>
		);
		expect(
			screen.getByText("Do not include personal information")
		).toBeInTheDocument();
	});

	it("should add a custom class name to the container", () => {
		const { container } = render(
			<CharacterCount
				label="Your comment"
				name="comment"
				maxLength={50}
				className="mt--0"
			/>
		);
		expect(container.firstChild).toHaveClass("character-count", "mt--0");
	});

	it("should pass additional props to the textarea", () => {
		render(
			<CharacterCount
				label="Your comment"
				name="comment"
				maxLength={50}
				rows={8}
			/>
		);
		expect(screen.getByLabelText("Your comment")).toHaveAttribute("rows", "8");
	});
});
