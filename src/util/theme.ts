import {
	extendTheme,
	type ThemeConfig,
	theme as baseTheme,
} from "@chakra-ui/react"

const config: ThemeConfig = {
	initialColorMode: "dark",
	useSystemColorMode: false,
}

const theme = extendTheme({
	config,
	colors: {
		primary: {
			default: "#F87171",
			_dark: "#F87171",
		},
	},
})

export default theme
