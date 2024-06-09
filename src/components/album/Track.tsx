import styles from "@/components/album/track.module.css"
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import { Ellipsis, Play } from "lucide-react"
import { useState } from "react"

interface TrackProps {
	index: number
	track: {}
	album: []
}

export default function Track(props: TrackProps) {
	const [hovering, setHovering] = useState<boolean>(false)

	const { playAlbumAtIndex } = useMusicPlayer()

	function play() {
		console.log(props.index)
		playAlbumAtIndex(props.album, props.index)
	}

	return (
		<article
			className={styles.track}
			onMouseOver={() => setHovering(true)}
			onMouseLeave={() => setHovering(false)}>
			<div className={styles.index}>
				{hovering ? (
					<Play onClick={() => play()} size={20} />
				) : (
					<p>{props.index + 1}</p>
				)}
			</div>
			<p className={styles.name}>{props.track.name}</p>
			<p className={styles.duration}>
				{new Date(props.track.durationInSeconds * 1000)
					.toISOString()
					.slice(14, 19)}
			</p>
			<Ellipsis size={20} />
		</article>
	)
}
