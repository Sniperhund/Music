import useAPI from "@/util/useAPI"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import getFilePath from "@/util/getFilePath"
import Head from "next/head"
import styles from "@/pages/album/album.module.css"
import Image from "next/image"
import { Button } from "@chakra-ui/react"
import { Play } from "lucide-react"
import Track from "@/components/album/Track"
import Link from "next/link"
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import ArtistName from "@/components/ArtistName"

export default function Album() {
	const router = useRouter()

	const [albumData, setAlbumData] = useState<any>(null)
	const [albumTracks, setAlbumTracks] = useState<any>(null)

	useEffect(() => {
		async function fetchData() {
			if (!router.query.id) return

			setAlbumData(await useAPI(`albums/${router.query.id}`))
			setAlbumTracks(await useAPI(`albums/${router.query.id}/tracks`))
		}

		fetchData()
	}, [router.query.id])

	const { playAlbum } = useMusicPlayer()

	function play() {
		playAlbum(albumTracks)
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
			<section className={styles.info}>
				<img
					src={getFilePath("Album", albumData?.cover)}
					alt="Album cover image"
				/>

				<div className={styles.info_details}>
					<h1>{albumData?.name}</h1>
					<ArtistName artists={albumData.artists} element="h2" />

					<span className={styles.play}>
						<Button leftIcon={<Play />} onClick={() => play()}>
							Play
						</Button>
					</span>
				</div>
			</section>
			<section className={styles.tracks}>
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
		</>
	)
}
