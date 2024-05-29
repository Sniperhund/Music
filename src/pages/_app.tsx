import DefaultLayout from "@/components/layouts/Default"
import "@/styles/globals.css"
import { ChakraProvider } from "@chakra-ui/react"
import { NextPage } from "next"
import type { AppProps } from "next/app"
import { ReactElement, ReactNode } from "react"

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
		<ChakraProvider
			toastOptions={{ defaultOptions: { position: "bottom-right" } }}>
			{" "}
			{getLayout(<Component {...pageProps} />)}
		</ChakraProvider>
	)
}
