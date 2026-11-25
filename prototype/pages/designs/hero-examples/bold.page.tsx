import Head from "next/head";
import { Button } from "@nice-digital/nds-button";
import { Hero } from "@nice-digital/nds-hero";

export default function HeroExamplesPage() {
return (
<>
<Head>
<title>Hero examples: bold</title>
</Head>
<Hero
title="Guidance for health and social care"
intro="Evidence-based recommendations to help you provide the best care."
description="Browse our guidance by topic, or search for a condition or treatment."
actions={
<Button variant="cta" to="/designs/hero-examples">
Browse guidance
</Button>
}
isDark
/>
</>
);
}

