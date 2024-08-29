import FullscreenContext from "@/contexts/FullscreenContext"
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import getFilePath from "@/util/getFilePath"
import { useContext } from "react"
import styles from "./fullscreen.module.css"
import Image from "next/image"

export default function Fullscreen() {
	const { shown, setShown } = useContext(FullscreenContext)

	const { getCurrentSong } = useMusicPlayer()

	function getSongAlbumUrl() {
		if (!getCurrentSong()) return ""

		return getFilePath("album", getCurrentSong().album.cover)
	}

	if (!shown) return <></>

	return (
		<section className={`fixed w-[200vw] h-[200vh] top-0 left-0`}>
			<Image
				src={getSongAlbumUrl()}
				alt={getCurrentSong().name}
				className="absolute w-full h-full object-cover top-[-25%] left-[-25%] blur-2xl"
				width={500}
				height={500}
			/>

			<article className="fixed w-screen h-screen top-0 left-0 bg-black bg-opacity-25 flex justify-center items-center">
				<div className={`relative ${styles.image} ${styles.active}`}>
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
