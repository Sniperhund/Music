import getFilePath from "@/util/getFilePath"
import { Ellipsis, Play } from "lucide-react"
import styles from "@/components/artist/track.module.css"
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"

interface TrackProps {
	index: number
	track: any
	album: any
}

export default function Track(props: TrackProps) {
	const { playAlbumAtIndex } = useMusicPlayer()

	function play() {
		console.log(props.album)

		playAlbumAtIndex(props.album, props.index)
	}

	return (
		<section className="w-full grid grid-cols-[50px_1fr_50px] gap-4">
			<article className="relative" onClick={play}>
				<img
					src={getFilePath("Album", props?.track.album.cover)}
					alt="Album cover image"
					className="rounded-md"
				/>
				<div className={styles.play}>
					<Play size="25px" />
				</div>
			</article>
			<article className="flex flex-col w-full truncate leading-snug">
				<p className="truncate">{props?.track.name}</p>
				<p className="truncate text-white/60 ">
					{props?.track.album.name}
				</p>
			</article>
			<article className="flex justify-center items-center">
				<Ellipsis />
			</article>
		</section>
	)
}
