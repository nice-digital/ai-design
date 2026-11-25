import Head from "next/head";
import { Accordion, AccordionGroup } from "@nice-digital/nds-accordion";
import { Grid, GridItem } from "@nice-digital/nds-grid";
import { PageHeader } from "@nice-digital/nds-page-header";

export default function AccordionExamplesPage() {
return (
<>
<Head>
<title>Accordion examples</title>
</Head>
<PageHeader
heading="Accordion examples"
lead="The default, caution and grouped forms of the accordion."
/>

<Grid gutter="loose">
<GridItem cols={12} md={8}>
<h2>Default accordion</h2>
<Accordion title="Who this guidance is for">
<p>
This guidance is for healthcare professionals who diagnose and
manage type 2 diabetes in adults.
</p>
</Accordion>

<h2>Caution accordion</h2>
<Accordion title="Before you prescribe" variant="caution">
<p>
Check the person&apos;s kidney function before starting
treatment.
</p>
</Accordion>

<h2>Grouped accordions</h2>
<AccordionGroup>
<Accordion
title="Diagnosis"
displayTitleAsHeading={true}
headingLevel={3}
>
<p>Offer a blood test to adults with symptoms of type 2 diabetes.</p>
</Accordion>
<Accordion
title="Managing blood glucose"
displayTitleAsHeading={true}
headingLevel={3}
>
<p>Agree a personal HbA1c target with each adult.</p>
</Accordion>
<Accordion
title="Review and follow up"
displayTitleAsHeading={true}
headingLevel={3}
>
<p>Review care at least once a year.</p>
</Accordion>
</AccordionGroup>
</GridItem>
</Grid>
</>
);
}

