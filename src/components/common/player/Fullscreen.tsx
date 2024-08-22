import FullscreenContext from "@/contexts/FullscreenContext"
import { useContext } from "react"

export default function Fullscreen() {
	const { shown, setShown } = useContext(FullscreenContext)

	if (!shown) return <></>

	return (
		<section className="fixed w-screen h-screen bg-black top-0 left-0"></section>
	)
}
