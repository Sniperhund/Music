import DefaultLayout from "@/components/layouts/Default"
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import useAPI from "@/util/useAPI"
import { ReactElement, useEffect, useState } from "react"

export default function Home() {
	const {
		isPlaying,
		play,
		pause,
		next,
		prev,
		getCurrentSong,
		addQueueItem,
		getDuration,
		getSecondsPlayed,
	} = useMusicPlayer()

	useEffect(() => {
		async function fetchData() {
			const result = await useAPI("/all/tracks")

			addQueueItem(result[0])
		}

		fetchData()
	}, [])

	useEffect(() => {
		async function fetchDuration() {
			console.log(await getDuration())
		}

		fetchDuration()
	}, [getCurrentSong()])

	return (
		<div>
			<button onClick={play}>Play</button>
			<button onClick={pause}>Pause</button>
			<button onClick={next}>Next</button>
			<button onClick={prev}>Previous</button>
			<div>
				Current Song:{" "}
				{getCurrentSong() ? getCurrentSong().name : "None"}
			</div>
		</div>
	)
}
