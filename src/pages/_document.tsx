import theme from "@/util/theme"
import { ColorModeScript } from "@chakra-ui/react"
import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<link rel="manifest" href="/manifest.json" />
			</Head>
			<body>
				<ColorModeScript
					initialColorMode={theme.config.initialColorMode}
				/>
				<Main />
				<NextScript />
			</body>
		</Html>
	)
}
