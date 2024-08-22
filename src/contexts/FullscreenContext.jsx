import { createContext } from "react"

const FullscreenContext = createContext({
	shown: false,
	setShown: (value) => {},
})

export default FullscreenContext
