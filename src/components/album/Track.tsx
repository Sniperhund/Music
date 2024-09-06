import styles from "@/components/album/track.module.css"
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import useAPI from "@/util/useAPI"
import { Button, ButtonGroup, Divider, useToast } from "@chakra-ui/react"
import {
	ClipboardCopy,
	Ellipsis,
	ListEnd,
	ListPlus,
	ListStart,
	Minus,
	Play,
	Plus,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import ArtistName from "../ArtistName"
import Link from "next/link"
import React from "react"

interface TrackProps {
	index: number
	track: any
	album: { _id: string }[]
	extendedInfo?: {
		album: { name: string; _id: string }
		artists: { name: string; _id: string }[]
	}
	children?: any
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

	const menuRef = useRef<any>(null)

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

	const withMenuClose = (handler: any) => () => {
		setIsMenuOpen(false)
		handler()
	}

	const [inLibrary, setInLibrary] = useState(false)

	useEffect(() => {
		useAPI(`/user/tracks/contains?id=${props.track._id}`).then(
			(response: any) => {
				if (!response.status) setInLibrary(response)
			}
		)
	}, [])

	const wrappedChildren = React.Children.map(props.children, (child: any) => {
		if (React.isValidElement(child)) {
			return React.cloneElement(child, {
				// @ts-ignore
				onClick: withMenuClose(child.props.onClick || (() => {})),
			})
		}
		return child
	})

	return (
		<article
			className={`${styles.track} ${
				props.extendedInfo ? styles.extendedTrackInfo : ""
			}`}
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

			{props.extendedInfo ? (
				<>
					<ArtistName
						artists={props.extendedInfo.artists}
						element="p"
					/>
					<Link href={`/album/${props.extendedInfo.album._id}`}>
						<p>{props.extendedInfo.album.name}</p>
					</Link>
				</>
			) : (
				""
			)}

			<p className={styles.duration}>
				{new Date(props.track.durationInSeconds * 1000)
					.toISOString()
					.slice(14, 19)}
			</p>

			<div className="relative" ref={menuRef}>
				<Ellipsis
					size={20}
					onClick={() => setIsMenuOpen(!isMenuOpen)}
					className="cursor-pointer"
				/>
				<ButtonGroup
					className={`${styles.menu} ${
						isMenuOpen ? styles.menuActive : ""
					}`}
					flexDirection="column"
					spacing={0}
					variant="ghost">
					{props.children ? (
						<>{wrappedChildren}</>
					) : (
						<>
							<Button
								onClick={withMenuClose(() => {
									clear()
									addQueueItem(props.album[props.index])
									next()
									play()
								})}
								rightIcon={<Play />}>
								Play only this
							</Button>
							<Divider />
							{inLibrary ? (
								<Button
									onClick={withMenuClose(async () => {
										const result: any = await useAPI(
											"/user/tracks",
											{
												method: "DELETE",
												data: {
													ids: [
														props.album[props.index]
															._id,
													],
												},
											}
										)

										if (result == undefined) {
											toast({
												title: "Removed track from library",
												status: "success",
											})

											setInLibrary(!inLibrary)
										} else
											toast({
												title: "Could not remove track from library",
												status: "error",
											})
									})}
									rightIcon={<Minus />}>
									Remove from Library
								</Button>
							) : (
								<Button
									onClick={withMenuClose(async () => {
										const result: any = await useAPI(
											"/user/tracks",
											{
												method: "PUT",
												data: {
													ids: [
														props.album[props.index]
															._id,
													],
												},
											}
										)

										if (result == undefined) {
											toast({
												title: "Added track to library",
												status: "success",
											})

											setInLibrary(!inLibrary)
										} else
											toast({
												title: "Could not add track to library",
												status: "error",
											})
									})}
									rightIcon={<Plus />}>
									Add to Library
								</Button>
							)}
							<Button
								onClick={withMenuClose(() => {
									toast({
										title: "Sorry, but this has not been implemented yet",
										status: "error",
									})
								})}
								rightIcon={<ListPlus />}>
								Add to a Playlist...
							</Button>
							<Divider />
							<Button
								onClick={withMenuClose(() => {
									addQueueItemNext(props.album[props.index])
									toast({
										title: "Playing next",
										status: "info",
									})
								})}
								rightIcon={<ListStart />}>
								Play Next
							</Button>
							<Button
								onClick={withMenuClose(() => {
									addQueueItem(props.album[props.index])
									toast({
										title: "Added to queue",
										status: "info",
									})
								})}
								rightIcon={<ListEnd />}>
								Add to Queue
							</Button>
							<Divider />
							<Button
								onClick={withMenuClose(() => {
									navigator.clipboard.writeText(
										window.location.href
									)
									toast({
										title: "Link copied to clipboard",
										status: "info",
									})
								})}
								rightIcon={<ClipboardCopy />}>
								Share link
							</Button>
						</>
					)}
				</ButtonGroup>
			</div>
		</article>
	)
}
