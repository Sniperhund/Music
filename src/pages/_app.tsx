import DefaultLayout from "@/components/layouts/Default"
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext"
import "@/styles/globals.css"
import theme from "@/util/theme"
import { ChakraProvider } from "@chakra-ui/react"
import { NextPage } from "next"
import type { AppProps } from "next/app"
import { ReactElement, ReactNode, useEffect, useState } from "react"
import { GoogleAnalytics } from "@next/third-parties/google"

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
	getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
	const getLayout =
		Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>)

	return (
		<MusicPlayerProvider>
			<ChakraProvider
				toastOptions={{ defaultOptions: { position: "bottom-right" } }}
				theme={theme}>
				{getLayout(<Component {...pageProps} />)}
				<GoogleAnalytics gaId="G-BCF20XMJQZ" />
			</ChakraProvider>
		</MusicPlayerProvider>
	)
}
