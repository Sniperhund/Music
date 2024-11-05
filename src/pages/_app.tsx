import DefaultLayout from "@/components/layouts/Default"
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext"
import "@/styles/globals.css"
import theme from "@/util/theme"
import { ChakraProvider } from "@chakra-ui/react"
import { NextPage } from "next"
import type { AppProps } from "next/app"
import { ReactElement, ReactNode, useEffect, useState } from "react"
import { GoogleAnalytics } from "@next/third-parties/google"
import Head from "next/head"
import FullscreenContext from "@/contexts/FullscreenContext"
import Fullscreen from "@/components/common/player/fullscreen/Fullscreen"

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
	getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
	const getLayout =
		Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>)

	const [fullscreenShown, setFullscreenShown] = useState(false)

	return (
		<MusicPlayerProvider>
			<FullscreenContext.Provider
				value={{
					shown: fullscreenShown,
					setShown: setFullscreenShown,
				}}>
				<ChakraProvider
					toastOptions={{
						defaultOptions: { position: "bottom-right" },
					}}
					theme={theme}>
					<Head>
						<title>Music Player</title>
					</Head>
					{getLayout(<Component {...pageProps} />)}
					<GoogleAnalytics gaId="G-BCF20XMJQZ" />
					<Fullscreen />
				</ChakraProvider>
			</FullscreenContext.Provider>
		</MusicPlayerProvider>
	)
}
