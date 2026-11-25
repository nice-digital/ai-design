/**
 * Sketchbooks: named groups of related sketches.
 *
 *   npm run sketchbook -- list
 *   npm run sketchbook -- create "Form inputs" --description "Ideas for collecting text and choices"
 *   npm run sketchbook -- rename form-inputs "Forms and inputs"
 *   npm run sketchbook -- describe form-inputs "New description"
 *   npm run sketchbook -- add form-inputs character-count combo-box
 *   npm run sketchbook -- take character-count          (out of whichever sketchbook it is in)
 *   npm run sketchbook -- delete form-inputs            (the sketches themselves are kept)
 *
 * A sketchbook has an id that never changes and a name that can, so renaming
 * one never breaks a link. A sketch is in at most one sketchbook; adding it to
 * another moves it.
 *
 * sketches/sketchbooks.json holds only each sketchbook's id, name and
 * description. Membership is recorded in the sketch's own sketch.json
 * ("sketchbook": "<id>"), so deleting a sketch's folder leaves nothing behind.
 */
import { getTargets, readSketchbooks, setMeta, tidyName, writeSketchbooks } from "./targets";

const args = process.argv.slice(2);
const flagIndex = args.indexOf("--description");
const description = flagIndex > -1 ? (args[flagIndex + 1] ?? "").replace(/\s+/g, " ").trim().slice(0, 200) : undefined;
const [command, first, ...rest] = args.filter((arg, index) => arg !== "--description" && index !== flagIndex + 1 || flagIndex === -1);

const fail = (message: string): never => {
	console.error(message);
	process.exit(1);
};

const books = readSketchbooks();
const find = (id: string) => books.find((book) => book.id === id) ?? fail(`There is no sketchbook with the id "${id}". Run: npm run sketchbook -- list`);
const sketches = getTargets().filter((t) => t.kind === "sketch");
const inBook = (id: string) => sketches.filter((t) => t.meta.sketchbook === id).map((t) => t.slug);

switch (command) {
	case "list": {
		if (!books.length) console.log("No sketchbooks yet.");
		for (const book of books) {
			const members = inBook(book.id);
			console.log(`${book.id}  "${book.name}"  (${members.length ? members.join(", ") : "empty"})`);
		}
		const loose = sketches.filter((t) => !books.some((book) => book.id === t.meta.sketchbook)).map((t) => t.slug);
		if (loose.length) console.log(`Not in a sketchbook: ${loose.join(", ")}`);
		break;
	}
	case "create": {
		const name = tidyName(first ?? "");
		if (!name) fail('Usage: npm run sketchbook -- create "Name"');
		let id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "sketchbook";
		while (books.some((book) => book.id === id)) id += "-2";
		books.push({ id, name, description: description ?? "" });
		writeSketchbooks(books);
		console.log(`Created the sketchbook "${name}" (id: ${id})`);
		break;
	}
	case "rename": {
		const book = find(first);
		const name = tidyName(rest.join(" "));
		if (!name) fail('Usage: npm run sketchbook -- rename <id> "New name"');
		const old = book.name;
		book.name = name;
		writeSketchbooks(books);
		console.log(`Renamed "${old}" to "${name}" (id stays ${book.id})`);
		break;
	}
	case "describe": {
		const book = find(first);
		book.description = rest.join(" ").replace(/\s+/g, " ").trim().slice(0, 200);
		writeSketchbooks(books);
		console.log(`Updated the description of "${book.name}"`);
		break;
	}
	case "add": {
		const book = find(first);
		if (!rest.length) fail("Usage: npm run sketchbook -- add <id> <sketch> [<sketch>...]");
		for (const slug of rest) {
			const sketch = sketches.find((t) => t.slug === slug) ?? fail(`There is no sketch called "${slug}"`);
			setMeta(sketch, "sketchbook", book.id);
			sketch.meta.sketchbook = book.id;
		}
		console.log(`"${book.name}" now holds: ${inBook(book.id).join(", ")}`);
		break;
	}
	case "take": {
		const sketch = sketches.find((t) => t.slug === first) ?? fail(`There is no sketch called "${first}"`);
		if (!sketch.meta.sketchbook) fail(`"${first}" is not in a sketchbook`);
		setMeta(sketch, "sketchbook", "");
		console.log(`Took "${first}" out of its sketchbook. The sketch itself is unchanged.`);
		break;
	}
	case "delete": {
		const book = find(first);
		const members = sketches.filter((t) => t.meta.sketchbook === book.id);
		for (const sketch of members) setMeta(sketch, "sketchbook", "");
		writeSketchbooks(books.filter((b) => b.id !== book.id));
		console.log(
			`Deleted the sketchbook "${book.name}".${members.length ? ` Its sketches are kept: ${members.map((t) => t.slug).join(", ")}` : ""}`
		);
		break;
	}
	default:
		fail(
			'Usage: npm run sketchbook -- list | create "Name" | rename <id> "New name" | describe <id> "Text" | add <id> <sketch>... | take <sketch> | delete <id>'
		);
}
