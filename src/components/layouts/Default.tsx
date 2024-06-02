import { MutableRefObject, useRef } from "react"
import Player from "../common/Player"
import Sidebar from "../common/Sidebar"
import useResizeObserver from "use-resize-observer"

export default function DefaultLayout({ children }: any) {
	let playerContainer = useRef<HTMLDivElement>(null)
	const sidebar = useRef<HTMLDivElement>(null)

	useResizeObserver<HTMLDivElement>({
		ref: sidebar,
		onResize: ({ width, height }) => {
			if (!playerContainer.current || !sidebar.current) return
			playerContainer.current.style.width =
				"calc(100vw - " + sidebar.current?.offsetWidth + "px)"
		},
	})

	return (
		<section className="w-screen h-screen flex">
			<article
				className="flex flex-col gap-5 relative p-5 border-r border-r-[var(--chakra-colors-chakra-border-color)] md:min-w-64 xl:min-w-80"
				ref={sidebar}>
				<Sidebar />
			</article>
			<article className="py-14 px-12">{children}</article>
			<div
				className="p-2.5 h-24 fixed right-0 bottom-0"
				ref={playerContainer}>
				<article className="border border-[var(--chakra-colors-chakra-border-color)] rounded-2xl w-full h-full">
					<Player />
				</article>
			</div>
		</section>
	)
}
