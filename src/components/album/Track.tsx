import styles from "@/components/album/track.module.css"
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import useAPI from "@/util/useAPI"
import { useToast } from "@chakra-ui/react"
import { Play } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import ArtistName from "../ArtistName"
import Link from "next/link"
import React from "react"
import EllipsisMenu from "../common/EllipsisMenu"

interface TrackProps {
	index: number
	track: any
	album: { _id: string }[]
	extendedInfo?: {
		album: { name: string; _id: string }
		artists: { name: string; _id: string }[]
	}
	children?: any
}

export default function Track(props: TrackProps) {
	const [hovering, setHovering] = useState<boolean>(false)

	const { playAlbumAtIndex } = useMusicPlayer()

	function playAlbum() {
		playAlbumAtIndex(props.album, props.index)
	}

	const [inLibrary, setInLibrary] = useState<boolean>(false)

	useEffect(() => {
		useAPI(`/user/tracks/contains?id=${props.track._id}`).then(
			(response: any) => {
				if (!response.status) setInLibrary(response)
			},
		)
	}, [])

	return (
		<article
			className={`${styles.track} ${
				props.extendedInfo ? styles.extendedTrackInfo : ""
			}`}
			onMouseOver={() => setHovering(true)}
			onMouseLeave={() => setHovering(false)}>
			<div className={styles.index}>
				{hovering ? (
					<Play onClick={() => playAlbum()} size={20} />
				) : (
					<p>{props.index + 1}</p>
				)}
			</div>
			<p className={styles.name}>{props.track.name}</p>

			{props.extendedInfo ? (
				<>
					<ArtistName
						artists={props.extendedInfo.artists}
						element="p"
					/>
					<Link href={`/album/${props.extendedInfo.album._id}`}>
						<p>{props.extendedInfo.album.name}</p>
					</Link>
				</>
			) : (
				""
			)}

			<p className={styles.duration}>
				{new Date(props.track.durationInSeconds * 1000)
					.toISOString()
					.slice(14, 19)}
			</p>

			<EllipsisMenu albumIndex={props.index} album={props.album} />
		</article>
	)
}
