import { MutableRefObject, useRef, useState } from "react"
import Player from "../common/player/Player"
import Sidebar from "../common/Sidebar"
import useResizeObserver from "use-resize-observer"
import styles from "@/styles/layout.module.css"
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import { Home, LayoutGrid, Menu, Search, X } from "lucide-react"
import MobileNavIcon from "../common/MobileNavIcon"

export default function DefaultLayout({ children }: any) {
	let playerContainer = useRef<HTMLDivElement>(null)
	const sidebar = useRef<HTMLDivElement>(null)

	const [isMenuOpen, setIsMenuOpen] = useState(false)

	useResizeObserver<HTMLDivElement>({
		ref: sidebar,
		onResize: ({ width, height }) => {
			if (!playerContainer.current || !sidebar.current) return
			playerContainer.current.style.width =
				"calc(100vw - " + sidebar.current?.offsetWidth + "px)"

			if (window.matchMedia("(max-width: 768px)").matches) {
				playerContainer.current.style.width = "100vw"
			}
		},
	})

	const { getQueue, getCurrentSong } = useMusicPlayer()

	return (
		<section className="w-screen h-screen flex max-[768px]:pb-safe">
			{/* Desktop/Tablet nav/sidebar */}
			<article
				className={`${styles.sidebar} ${
					isMenuOpen ? styles.active : ""
				}`}
				ref={sidebar}>
				<Sidebar admin={false} />
				<Menu
					className={styles.menuButton}
					size={36}
					onClick={() => setIsMenuOpen(!isMenuOpen)}
				/>
			</article>
			{/* Mobile nav */}
			<article className={styles.mobileNav}>
				<MobileNavIcon href="/" icon={<Home />} label="Home" />
				<MobileNavIcon
					href="/library"
					icon={<LayoutGrid />}
					label="Library"
				/>
				<MobileNavIcon
					href="/search"
					icon={<Search />}
					label="Search"
				/>
			</article>
			<article
				className={`${styles.content} ${
					getCurrentSong() || getQueue().length !== 0
						? "mb-[5.5rem]"
						: ""
				}`}>
				{children}
			</article>
			<div
				className={`p-2.5 h-24 fixed right-0 bottom-0 ${
					getCurrentSong() || getQueue().length !== 0
						? "pointer-events-auto"
						: "pointer-events-none"
				}`}
				ref={playerContainer}>
				<article
					className={`${styles.playerContainer} ${
						getCurrentSong() || getQueue().length !== 0
							? styles.active
							: ""
					}`}>
					<Player />
				</article>
			</div>
		</section>
	)
}
