import styles from "@/components/album/track.module.css"
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import useAPI from "@/util/useAPI"
import {
	Button,
	ButtonGroup,
	Divider,
	Menu,
	MenuButton,
	MenuDivider,
	MenuList,
	Portal,
	useToast,
} from "@chakra-ui/react"
import {
	ChevronDown,
	Ellipsis,
	ListEnd,
	ListPlus,
	ListStart,
	Play,
	Plus,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface TrackProps {
	index: number
	track: any
	album: []
}

export default function Track(props: TrackProps) {
	const toast = useToast()

	const [hovering, setHovering] = useState<boolean>(false)

	const {
		playAlbumAtIndex,
		clear,
		addQueueItem,
		addQueueItemNext,
		next,
		play,
	} = useMusicPlayer()

	function playAlbum() {
		playAlbumAtIndex(props.album, props.index)
	}

	const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

	const menuRef = useRef(null)

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setIsMenuOpen(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [])

	return (
		<article
			className={styles.track}
			onMouseOver={() => setHovering(true)}
			onMouseLeave={() => setHovering(false)}>
			<div className={styles.index}>
				{hovering ? (
					<Play onClick={() => playAlbum()} size={20} />
				) : (
					<p>{props.index + 1}</p>
				)}
			</div>
			<p className={styles.name}>{props.track.name}</p>
			<p className={styles.duration}>
				{new Date(props.track.durationInSeconds * 1000)
					.toISOString()
					.slice(14, 19)}
			</p>

			<div className="relative" ref={menuRef}>
				<Ellipsis
					size={20}
					onClick={() => setIsMenuOpen(true)}
					className="cursor-pointer"
				/>
				<ButtonGroup
					className={`${styles.menu} ${
						isMenuOpen ? styles.active : ""
					}`}
					flexDirection="column"
					spacing={0}
					variant="ghost">
					<Button
						onClick={() => {
							setIsMenuOpen(false)
							clear()
							addQueueItem(props.album[props.index])
							next()
							play()
						}}
						rightIcon={<Play />}>
						Play only this
					</Button>
					<Divider />
					<Button
						onClick={async () => {
							setIsMenuOpen(false)
							const result = await useAPI("/user/tracks", {
								method: "PUT",
								data: {
									ids: [props.album[props.index]._id],
								},
							})

							if (result?.status == "ok")
								toast({
									title: "Added track to library",
									status: "success",
								})
							else
								toast({
									title: "Could not add track to library",
									status: "error",
								})
						}}
						rightIcon={<Plus />}>
						Add to Library
					</Button>
					<Button
						onClick={() => {
							setIsMenuOpen(false)
							alert("This has not been implemented yet")
						}}
						rightIcon={<ListPlus />}>
						Add to a Playlist...
					</Button>
					<Divider />
					<Button
						onClick={() => {
							setIsMenuOpen(false)
							addQueueItemNext(props.album[props.index])
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
							setIsMenuOpen(false)
							addQueueItem(props.album[props.index])
							toast({
								title: "Added to queue",
								status: "info",
							})
						}}
						rightIcon={<ListEnd />}>
						Add to Queue
					</Button>
				</ButtonGroup>
			</div>
		</article>
	)
}
