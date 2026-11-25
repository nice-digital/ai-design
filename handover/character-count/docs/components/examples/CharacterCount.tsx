import { CharacterCount } from "@nice-digital/nds-character-count";

export const DemoCharacterCount = () => (
	<CharacterCount
		label="What guidance were you looking for?"
		name="demo-feedback"
		hint="Do not include personal information"
		maxLength={200}
	/>
);

export const DefaultCharacterCount = () => (
	<CharacterCount label="Your comment" name="default-comment" maxLength={200} />
);

export const OverLimitCharacterCount = () => (
	<CharacterCount
		label="Short summary"
		name="over-summary"
		maxLength={20}
		defaultValue="This summary is longer than twenty characters"
	/>
);
