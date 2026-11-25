// Mirrors nice-design-system/jest.setup.ts
import "@testing-library/jest-dom";
import "@testing-library/jest-dom/extend-expect";
import "jest-extended";
import { TextEncoder, TextDecoder as NodeTextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = NodeTextDecoder as typeof TextDecoder;

jest.mock("react", () => ({
	...jest.requireActual("react"),
	useId: () => "r:id"
}));
