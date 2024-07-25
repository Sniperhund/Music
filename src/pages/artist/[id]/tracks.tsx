import Track from "@/components/album/Track"
import useAPI from "@/util/useAPI"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"

export default function ArtistTracks() {
	const router = useRouter()

	const [tracks, setTracks] = useState<any>()

	useEffect(() => {
		async function fetchTracks() {
			setTracks(await useAPI(`artists/${router.query.id}/tracks`))
		}
		fetchTracks()
	}, [router.query.id])

	return (
		<>
			<h1>Songs</h1>

			<section className="tracks">
				{tracks && Array.isArray(tracks)
					? tracks?.map(function (track: any, j: number) {
							return (
								<Track
									key={j}
									index={j}
									track={track}
									album={tracks}
								/>
							)
					  })
					: ""}
			</section>
		</>
	)
}
