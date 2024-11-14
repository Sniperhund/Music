import getFilePath from "@/util/getFilePath"
import Image from "next/image"
import ArtistName from "./ArtistName"
import Link from "next/link"
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import useAPI from "@/util/useAPI"
import { Play } from "lucide-react"
import { useLocalStorage } from "usehooks-ts"

enum SearchResultCardType {
	TRACK = "track",
	ALBUM = "album",
	ARTIST = "artist",
}

export interface SearchResultCardProps {
	type: SearchResultCardType
	id: string
	name: string
	imageUrl: string
	tracks?: any
	artists?: any
}

export default function SearchResultCard(props: SearchResultCardProps) {
	const [recentlyPlayed, setRecentlyPlayed] = useLocalStorage<
		SearchResultCardProps | any
	>("recentlyPlayed", [])

	const getLink = () => {
		if (props.type == SearchResultCardType.ARTIST) {
			return `/artist/${props.id}`
		}

		if (props.type == SearchResultCardType.ALBUM) {
			return `/album/${props.id}`
		}

		return "#"
	}

	const { addQueueItem, play: musicPlay, playAlbum, clear } = useMusicPlayer()

	const play = () => {
		setRecentlyPlayed([
			props,
			...recentlyPlayed.filter((track: any) => track.id != props.id),
		])

		// The amount of recently searched items to store (12 + 1)
		if (recentlyPlayed.length == 13) {
			setRecentlyPlayed(recentlyPlayed.slice(0, 12))
		}

		if (props.type == SearchResultCardType.TRACK) {
			useAPI(`/tracks/${props.id}`).then((track) => {
				clear()
				addQueueItem(track)
				musicPlay()
			})
		}

		if (props.type == SearchResultCardType.ALBUM) {
			useAPI(`/albums/${props.id}/tracks`).then((tracks) => {
				playAlbum(tracks)
			})
		}

		if (props.type == SearchResultCardType.ARTIST) {
			useAPI(`/artists/${props.id}/tracks`).then((tracks) => {
				playAlbum(tracks)
			})
		}
	}

	return (
		<article className="flex gap-4 w-full truncate">
			<article className="relative" onClick={play}>
				<Image
					src={
						props.type == SearchResultCardType.ARTIST
							? getFilePath("artist", props.imageUrl)
							: getFilePath("album", props.imageUrl)
					}
					alt={props.name}
					width={75}
					height={75}
					className="rounded-lg"
				/>

				<div className="play">
					<Play size="25px" />
				</div>
			</article>

			<Link
				href={getLink()}
				className={`flex flex-col justify-center truncate ${
					getLink() == "#" ? "cursor-default" : ""
				}`}>
				<p className="truncate">{props.name}</p>
				<div className="opacity-50 flex">
					<p className="capitalize">
						{props.type != "track" ? props.type : "Song"}
					</p>
					{props.type != "artist" ? (
						<p className="whitespace-pre"> - </p>
					) : (
						""
					)}
					<ArtistName artists={props.artists} element="p" />
				</div>
			</Link>
		</article>
	)
}
