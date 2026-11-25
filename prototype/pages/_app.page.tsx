import type { AppProps } from "next/app";
import Link from "next/link";
import { Inter, Lora } from "next/font/google";
import { Container } from "@nice-digital/nds-container";

import "@nice-digital/design-system/scss/base.scss";
import "../styles/app.scss";

// Same fonts and CSS variables as next-web
const inter = Inter({ subsets: ["latin"], variable: "--sans-font-family" });
const lora = Lora({ subsets: ["latin"], variable: "--serif-font-family" });

export default function App({ Component, pageProps, router }: AppProps) {
	const fonts = `${inter.variable} ${lora.variable}`;

	// The workspace's own pages (home, and the details of a sketch or design)
	// look deliberately different from the designs, so nobody mistakes one for the other
	const isWorkspacePage = router.pathname === "/" || router.pathname.startsWith("/workspace");
	if (isWorkspacePage)
		return (
			<div className={`${fonts} ws`}>
				<main>
					<Component {...pageProps} />
				</main>
			</div>
		);

	// A design or a sketch: a thin bar, then nothing but the design system
	const [, section, name] = router.asPath.split(/[/?#]/);
	const about =
		section === "designs" && name
			? `/workspace/design/${name}`
			: section === "sketches" && name
			? `/workspace/sketch/${name}`
			: null;

	return (
		<div className={fonts}>
			<nav className="ws-bar" aria-label="Workspace">
				<Link href="/">Design workspace</Link>
				{about && <Link href={about}>Checks, screens and decisions</Link>}
				<span className="ws-bar__note">Prototype, not a live NICE service</span>
			</nav>
			<main className="ws-design">
				<Container>
					<Component {...pageProps} />
				</Container>
			</main>
		</div>
	);
}
