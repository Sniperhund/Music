import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import {
	Drawer,
	DrawerBody,
	DrawerCloseButton,
	DrawerContent,
	DrawerHeader,
	DrawerOverlay,
} from "@chakra-ui/react"
import { ReactSortable } from "react-sortablejs"
import styles from "@/styles/player.module.css"
import getFilePath from "@/util/getFilePath"
import ArtistName from "@/components/ArtistName"
import { Play } from "lucide-react"

export default function Queue(props: any) {
	const { getQueue, setQueue, playAlbumAtIndex } = useMusicPlayer()

	function skipToIndex(index: number) {
		playAlbumAtIndex(getQueue(), index)
	}

	return (
		<Drawer isOpen={props.isOpen} placement="right" onClose={props.onClose}>
			<DrawerOverlay />
			<DrawerContent>
				<DrawerCloseButton />
				<DrawerHeader>Up Next</DrawerHeader>

				<DrawerBody className="flex flex-col">
					{getQueue().length === 0 ? (
						<p className="self-center my-auto text-white/50 text-sm">
							No upcoming songs.
						</p>
					) : (
						<>
							<ReactSortable
								list={getQueue()}
								setList={(newState) => setQueue(newState)}>
								{getQueue().map((track: any, index: any) => (
									<article
										key={index}
										className={`${styles.track} odd:bg-white/10`}>
										<article
											className="relative"
											onClick={() => skipToIndex(index)}>
											<img
												src={getFilePath(
													"album",
													track.album.cover
												)}
												alt="Cover Image"
												className="w-12 h-12 rounded-lg"
											/>
											<div className="play">
												<Play size="25px" />
											</div>
										</article>
										<div className="w-full truncate">
											<p className="truncate">
												{track.name}
											</p>
											<ArtistName
												artists={track.artists}
												element="p"
												className="opacity-50"
											/>
										</div>
									</article>
								))}
							</ReactSortable>
						</>
					)}
				</DrawerBody>
			</DrawerContent>
		</Drawer>
	)
}
