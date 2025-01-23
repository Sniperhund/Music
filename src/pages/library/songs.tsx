import Track from "@/components/album/Track"
import PageTitle from "@/components/PageTitle"
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import useAPI from "@/util/useAPI"
import { Button, Divider, useToast } from "@chakra-ui/react"
import {
	ListEnd,
	ListPlus,
	ListStart,
	Minus,
	Play,
	Shuffle,
} from "lucide-react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function Songs() {
	const router = useRouter()
	const toast = useToast()

	const {
		playAlbumAtIndex,
		playAlbum,
		clear,
		addQueueItem,
		addQueueItemNext,
		next,
		play,
		shuffle,
	} = useMusicPlayer()

	const [tracks, setTracks] = useState<any>()

	useEffect(() => {
		useAPI(`/user/tracks`, {
			params: {
				limit: 0,
			},
		}).then((tracks: any) => {
			if (tracks?.data?.status == "error") {
				router.push("/404", undefined, { shallow: true })
				return
			}

			setTracks(tracks)
		})
	}, [router])

	function shuffleAndPlay() {
		clear()

		tracks.forEach((track: any) => {
			addQueueItem(track)
		})

		shuffle()
		play()
	}

	return (
		<>
			<PageTitle>Songs</PageTitle>

			<span className="flex gap-4">
				<Button leftIcon={<Play />} onClick={() => playAlbum(tracks)}>
					Play
				</Button>
				<Button leftIcon={<Shuffle />} onClick={() => shuffleAndPlay()}>
					Shuffle
				</Button>
			</span>

			<section className="tracks" style={{ marginTop: "20px" }}>
				{tracks && Array.isArray(tracks)
					? tracks?.map(function (track: any, j: number) {
							return (
								<Track
									key={j}
									index={j}
									track={track}
									extendedInfo={{
										album: {
											name: track.album.name,
											_id: track.album._id,
										},
										artists: track.artists,
									}}
									album={tracks}>
									<Button
										onClick={() => {
											clear()
											addQueueItem(track)
											next()
											play()
										}}
										rightIcon={<Play />}>
										Play only this
									</Button>
									<Divider />
									<Button
										onClick={async () => {
											const result: any = await useAPI(
												"/user/tracks",
												{
													method: "DELETE",
													data: {
														ids: [track._id],
													},
												},
											)

											if (result == undefined) {
												toast({
													title: "Removed track from library",
													status: "success",
												})

												setTracks(
													[...tracks].filter(
														(t) =>
															t._id != track._id,
													),
												)
											} else
												toast({
													title: "Could not remove track from library",
													status: "error",
												})
										}}
										rightIcon={<Minus />}>
										Remove from Library
									</Button>
									<Button
										onClick={() => {
											toast({
												title: "Sorry, but this has not been implemented yet",
												status: "error",
											})
										}}
										rightIcon={<ListPlus />}>
										Add to a Playlist...
									</Button>
									<Divider />
									<Button
										onClick={() => {
											addQueueItemNext(track)
											toast({
												title: "Playing next",
												status: "info",
											})
										}}
										rightIcon={<ListStart />}>
										Play Next
									</Button>
									<Button
										onClick={() => {
											addQueueItem(track)
											toast({
												title: "Added to queue",
												status: "info",
											})
										}}
										rightIcon={<ListEnd />}>
										Add to Queue
									</Button>
								</Track>
							)
						})
					: ""}
			</section>
		</>
	)
}
