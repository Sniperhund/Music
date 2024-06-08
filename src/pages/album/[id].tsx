import useAPI from "@/util/useAPI"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import getFilePath from "@/util/getFilePath"
import Head from "next/head"
import styles from "@/pages/album/album.module.css"
import Image from "next/image"

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

	if (!router.query.id || !albumData || !albumTracks) return <></>

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

				<div>
					<h1>{albumData?.name}</h1>
				</div>
			</section>
			<section className={styles.tracks}></section>
		</>
	)
}
