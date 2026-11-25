# `@nice-digital/nds-character-count`

> Character count component for the NICE Design System

## Installation

Install Node, and then:

```sh
npm i @nice-digital/nds-character-count --save
```

## Usage

### React

Import the `CharacterCount` component from the package and use within JSX:

```jsx
import React from "react";
import { CharacterCount } from "@nice-digital/nds-character-count";

<CharacterCount
	label="Your comment"
	name="comment"
	hint="Do not include personal information"
	maxLength={200}
/>;
```

#### Props

##### label

- Type: `string` (required)

The visible label for the text area. Also used in the error message shown when over the limit.

##### name

- Type: `string` (required)

The name and id of the text area. Must be unique on the page.

##### maxLength

- Type: `number` (required)

The most characters people can enter. Going over shows an error but does not stop typing or form submission.

##### hint

- Type: `string`

Extra help shown under the label.

##### defaultValue

- Type: `string`
- Default: `""`

Text to start with. It counts towards the limit.

##### className

- Type: `string`

Additional classes for the container, for example spacing modifiers like `mt--0`.

##### additional props

Any additional props are passed to the `textarea` element, for example `rows`.

### SCSS

If you're not using [React](#react), then import the SCSS directly into your application, along with the textarea styles it builds on:

```scss
@forward '@nice-digital/nds-textarea/scss/textarea';
@forward '@nice-digital/nds-character-count/scss/character-count';
```

### HTML

If you're not using [React](#react), then include the [SCSS as above](#scss) and use the HTML. You will need your own script to update the message as the user types:

```html
<div class="character-count" data-component="character-count">
	<div class="textarea" data-component="textarea">
		<label class="textarea__label" for="comment">Your comment</label>
		<textarea class="textarea__textarea" id="comment" name="comment" aria-describedby="comment-count"></textarea>
	</div>
	<p id="comment-count" aria-live="polite" class="character-count__message">You have 200 characters remaining</p>
</div>
```
