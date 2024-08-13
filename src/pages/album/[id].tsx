import useAPI from "@/util/useAPI"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import getFilePath from "@/util/getFilePath"
import Head from "next/head"
import Image from "next/image"
import { Button } from "@chakra-ui/react"
import { Play, Shuffle } from "lucide-react"
import Track from "@/components/album/Track"
import sliderStyles from "@/styles/slider.module.css"
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import ArtistName from "@/components/ArtistName"

export default function Album() {
	const router = useRouter()

	const [albumData, setAlbumData] = useState<any>(null)
	const [albumTracks, setAlbumTracks] = useState<any>(null)

	useEffect(() => {
		async function fetchData() {
			if (!router.query.id) return

			const albumData: any = await useAPI(`albums/${router.query.id}`)

			if (albumData?.data?.status == "error")
				router.push("/404", undefined, { shallow: true })

			setAlbumData(albumData)

			setAlbumTracks(await useAPI(`albums/${router.query.id}/tracks`))
		}

		fetchData()
	}, [router.query.id, router])

	const {
		playAlbum,
		addQueueItem,
		shuffle,
		clear,
		play: musicPlay,
	} = useMusicPlayer()

	function play() {
		playAlbum(albumTracks)
	}

	function shuffleAndPlay() {
		clear()

		albumTracks.forEach((track: any) => {
			addQueueItem(track)
		})

		shuffle()
		musicPlay()
	}

	if (!albumData || !albumTracks) return <></>

	if (albumData?.status == 400 || albumTracks?.status == 400) {
		return (
			<>
				<Head>
					<title>Error</title>
				</Head>
				An error occurred
			</>
		)
	}

	return (
		<>
			<Head>
				<title>{albumData?.name}</title>
			</Head>
			<section className="info">
				<img
					src={getFilePath("Album", albumData?.cover)}
					alt="Album cover image"
				/>

				<div className="details">
					<h1>{albumData?.name}</h1>
					<ArtistName artists={albumData.artists} element="h2" />

					<span className="buttons">
						<Button leftIcon={<Play />} onClick={() => play()}>
							Play
						</Button>
						<Button
							leftIcon={<Shuffle />}
							onClick={() => shuffleAndPlay()}>
							Shuffle
						</Button>
					</span>
				</div>
			</section>
			{albumTracks && albumTracks.length > 0 ? (
				<section className="tracks">
					{albumTracks?.map(function (track: any, j: number) {
						return (
							<Track
								key={j}
								index={j}
								track={track}
								album={albumTracks}
							/>
						)
					})}
				</section>
			) : (
				<p className={`${sliderStyles.categoryLink} mt-8`}>
					No albums were found
				</p>
			)}
		</>
	)
}
