import FullscreenContext from "@/contexts/FullscreenContext"
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import getFilePath from "@/util/getFilePath"
import { useContext, useEffect, useRef, useState } from "react"
import styles from "./fullscreen.module.css"
import Image from "next/image"
import { X } from "lucide-react"

export default function Fullscreen() {
	const { shown, setShown } = useContext(FullscreenContext)

	const { getCurrentSong } = useMusicPlayer()

	function getSongAlbumUrl() {
		if (!getCurrentSong()) return ""

		return getFilePath("album", getCurrentSong().album.cover)
	}

	const imageRef = useRef<HTMLImageElement>(null)

	const [lyrics, setLyrics] = useState("")
	const [showLyrics, setShowLyrics] = useState(false)

	return (
		<section
			className={`fixed w-[200vw] h-[200vh] top-0 left-0 ${
				shown ? "block" : "hidden"
			}`}>
			<Image
				ref={imageRef}
				src={getSongAlbumUrl()}
				alt={getCurrentSong().name}
				className="absolute w-full h-full object-cover top-[-25%] left-[-25%] blur-2xl"
				width={500}
				height={500}
			/>

			<article className="fixed w-screen h-screen top-0 left-0 bg-black bg-opacity-25 flex justify-center items-center">
				<X
					className="absolute right-2 top-2 cursor-pointer"
					size={28}
					onClick={() => setShown(false)}
				/>

				<div
					className={`relative ${styles.image} ${
						showLyrics ? styles.active : ""
					}`}>
					<Image
						src={getSongAlbumUrl()}
						alt={getCurrentSong().name}
						className="rounded-lg"
						width={500}
						height={500}
					/>
				</div>
			</article>
		</section>
	)
}
