import "@/styles/globals.css"
import { ChakraProvider } from "@chakra-ui/react"
import type { AppProps } from "next/app"

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ChakraProvider
			toastOptions={{ defaultOptions: { position: "bottom-right" } }}
		>
			<Component {...pageProps} />
		</ChakraProvider>
	)
}
