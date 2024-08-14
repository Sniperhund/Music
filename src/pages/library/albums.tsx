import Card from "@/components/album/Card"
import Track from "@/components/album/Track"
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import getFilePath from "@/util/getFilePath"
import useAPI from "@/util/useAPI"
import { Button, Divider, useToast } from "@chakra-ui/react"
import { ListEnd, ListPlus, ListStart, Minus, Play } from "lucide-react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function Albums() {
	const router = useRouter()
	const toast = useToast()

	const {
		playAlbumAtIndex,
		clear,
		addQueueItem,
		addQueueItemNext,
		next,
		play,
	} = useMusicPlayer()

	const [albums, setAlbums] = useState<any>()

	useEffect(() => {
		useAPI(`/user/albums`).then((albums: any) => {
			if (albums?.data?.status == "error") {
				router.push("/404", undefined, { shallow: true })
				return
			}

			setAlbums(albums)
		})
	}, [router])

	return (
		<>
			<h1>Albums</h1>

			<section>
				{albums && Array.isArray(albums)
					? albums?.map(function (album: any, j: number) {
							return (
								<Card
									key={j}
									albumId={album._id}
									albumName={album.name}
									imageUrl={getFilePath("album", album.cover)}
									artists={album.artists}
								/>
							)
					  })
					: ""}
			</section>
		</>
	)
}
