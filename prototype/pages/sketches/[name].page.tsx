import type { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useMemo } from "react";
import { PageHeader } from "@nice-digital/nds-page-header";
import { Tag } from "@nice-digital/nds-tag";

import { getItem, type Item } from "../../lib/workspace";

export const getServerSideProps: GetServerSideProps<{
	sketch: Item;
}> = async ({ params }) => {
	const sketch = getItem("sketch", String(params?.name));
	return sketch ? { props: { sketch } } : { notFound: true };
};

export default function SketchPage({ sketch }: { sketch: Item }) {
	const Demo = useMemo(
		() =>
			dynamic(() =>
				import(`../../../sketches/${sketch.slug}/demo`).then((mod) => {
					const LoadedDemo = mod.default;
					// data-sketch-ready tells the checks the demo has rendered
					return function Loaded() {
						return (
							<div data-sketch-ready>
								<LoadedDemo />
							</div>
						);
					};
				})
			),
		[sketch.slug]
	);

	return (
		<>
			<Head>
				<title>{`${sketch.title} | Sketch`}</title>
			</Head>
			<PageHeader
				heading={sketch.title}
				lead={sketch.description}
				preheading={
					sketch.stage === "ready" ? (
						<Tag success>Ready to use in designs</Tag>
					) : (
						<Tag caution>Sketch: not part of the design system</Tag>
					)
				}
			/>
			<Demo />
		</>
	);
}
