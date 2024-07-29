import useAPI from "@/util/useAPI"
import { Button, useToast } from "@chakra-ui/react"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import sliderStyles from "@/styles/slider.module.css"
import getFilePath from "@/util/getFilePath"
import { ChevronRight, Play } from "lucide-react"
import Link from "next/link"
import Track from "@/components/artist/Track"
import Slider from "@/components/common/Slider"
import Card from "@/components/album/Card"
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"

export default function Artist() {
	const router = useRouter()
	const toast = useToast()

	const [artistData, setArtistData] = useState<any>(null)
	const [artistTracks, setArtistTracks] = useState<any>(null)
	const [artistAlbums, setArtistAlbums] = useState<any>(null)

	useEffect(() => {
		async function fetchData() {
			if (!router.query.id) return

			const artistData: any = await useAPI(`artists/${router.query.id}`)

			if (artistData?.data?.status == "error")
				router.push("/404", undefined, { shallow: true })

			setArtistData(artistData)

			setArtistTracks(
				await useAPI(`artists/${router.query.id}/tracks?limit=9`)
			)
			setArtistAlbums(await useAPI(`artists/${router.query.id}/albums`))
		}

		fetchData()
	}, [router.query.id])

	const { playAlbum } = useMusicPlayer()

	function play() {
		playAlbum(artistTracks)
	}

	if (!artistData || !artistTracks || !artistAlbums) return <></>

	if (
		artistData?.status == 400 ||
		artistTracks?.status == 400 ||
		artistAlbums?.status == 400
	) {
		return (
			<>
				<Head>
					<title>Error</title>
				</Head>
				An error occurred
			</>
		)
	}

	function calculateGridStyles() {
		if (artistTracks.length < 3) return `grid-rows-${artistTracks.length}`
		return "grid-rows-3"
	}

	return (
		<section className="flex flex-col gap-8">
			<Head>
				<title>{artistData?.name}</title>
			</Head>
			<section className="info">
				<img
					src={getFilePath("Artist", artistData?.cover)}
					alt="Album cover image"
				/>

				<div className="details">
					<h1>{artistData?.name}</h1>

					<span className="buttons">
						<Button leftIcon={<Play />} onClick={() => play()}>
							Play
						</Button>
					</span>
				</div>
			</section>

			{artistTracks && artistTracks.length > 0 ? (
				<section>
					<Link
						href={`/artist/${router.query.id}/tracks`}
						className={sliderStyles.categoryLink}>
						Songs <ChevronRight size="24" />
					</Link>

					<article
						className={`grid ${calculateGridStyles()} 2xl:grid-cols-3 grid-cols-2 grid-flow-col gap-4 w-full pt-2`}>
						{artistTracks?.map((track: any, index: number) => {
							return (
								<Track
									key={index}
									index={index}
									track={track}
									album={artistTracks}
								/>
							)
						})}
					</article>
				</section>
			) : (
				<p className={sliderStyles.categoryLink}>
					No tracks were found
				</p>
			)}

			{artistAlbums && artistAlbums.length > 0 ? (
				<Slider title="Albums">
					{artistAlbums?.map((album: any, index: number) => {
						return (
							<Card
								key={index}
								imageUrl={getFilePath("Album", album.cover)}
								albumName={album.name}
								artists={album.artists}
							/>
						)
					})}
				</Slider>
			) : (
				<p className={sliderStyles.categoryLink}>
					No albums were found
				</p>
			)}
		</section>
	)
}
