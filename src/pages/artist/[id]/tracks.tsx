import Track from "@/components/album/Track"
import useAPI from "@/util/useAPI"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Head from "next/head"

export default function ArtistTracks() {
	const router = useRouter()

	const [tracks, setTracks] = useState<any>()
	const [artistName, setArtistName] = useState<string>()

	useEffect(() => {
		if (!router.query.id) return

		useAPI(`artists/${router.query.id}/tracks`).then((tracks: any) => {
			if (tracks?.data?.status == "error") {
				router.push("/404", undefined, { shallow: true })
				return
			}

			setTracks(tracks)
		})

		useAPI(`artists/${router.query.id}`).then((artist: any) => {
			if (artist?.data?.status == "error") {
				router.push("/404", undefined, { shallow: true })
				return
			}

			setArtistName(artist.name)
		})
	}, [router.query.id])

	return (
		<>
			<Head>
				{artistName ? (
					<title>{artistName} - Songs</title>
				) : (
					<title>Loading...</title>
				)}
			</Head>

			<h1>Songs</h1>

			<section className="tracks">
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
									album={tracks}
								/>
							)
					  })
					: ""}
			</section>
		</>
	)
}
