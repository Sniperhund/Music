// contexts/MusicPlayerContext.js
import { createContext, useContext, useState } from "react"
import { Howl } from "howler"
import getFilePath from "@/util/getFilePath"

const MusicPlayerContext = createContext()

export const MusicPlayerProvider = ({ children }) => {
	const [sound, setSound] = useState(null)
	const [queue, setQueue] = useState([])

	async function createHowl() {
		const howler = await import("howler")
	}

	return (
		<MusicPlayerContext.Provider value={{}}>
			{children}
		</MusicPlayerContext.Provider>
	)
}

export const useMusicPlayer = () => useContext(MusicPlayerContext)
