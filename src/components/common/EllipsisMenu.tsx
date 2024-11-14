import styles from "@/components/album/track.module.css"
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import useAPI from "@/util/useAPI"
import {
	Button,
	ButtonGroup,
	Divider,
	FormControl,
	FormLabel,
	Input,
	InputGroup,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Select,
	useDisclosure,
	useToast,
} from "@chakra-ui/react"
import { getCookie } from "cookies-next"
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
import React from "react"

interface EllipsisMenuProps {
	album: any
	albumIndex: number
	children?: any
}

export default function EllipsisMenu(props: EllipsisMenuProps) {
	const toast = useToast()

	const {
		playAlbumAtIndex,
		clear,
		addQueueItem,
		addQueueItemNext,
		next,
		play,
	} = useMusicPlayer()

	const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

	const menuRef = useRef<any>(null)

	const { isOpen, onOpen, onClose } = useDisclosure()

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

	const wrappedChildren = React.Children.map(props.children, (child: any) => {
		if (React.isValidElement(child)) {
			return React.cloneElement(child, {
				// @ts-ignore
				onClick: withMenuClose(child.props.onClick || (() => {})),
			})
		}
		return child
	})

	const [reportType, setReportType] = useState<string>("")
	const [reportMessage, setReportMessage] = useState<string>("")

	const submitReport = (e: any) => {
		e.preventDefault()

		onClose()

		fetch("/api/reportLyrics", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `${getCookie("access_token")}`,
			},
			body: JSON.stringify({
				trackId: props.album[props.albumIndex]._id,
				issueType: reportType,
				message: reportMessage,
			}),
		})

		setReportType("")
		setReportMessage("")
	}

	return (
		<>
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
									addQueueItem(props.album[props.albumIndex])
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
														props.album[
															props.albumIndex
														]._id,
													],
												},
											},
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
														props.album[
															props.albumIndex
														]._id,
													],
												},
											},
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
									addQueueItemNext(
										props.album[props.albumIndex],
									)
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
									addQueueItem(props.album[props.albumIndex])
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
										window.location.href,
									)
									toast({
										title: "Link copied to clipboard",
										status: "info",
									})
								})}
								rightIcon={<ClipboardCopy />}>
								Share link
							</Button>
							<Divider />
							<Button
								onClick={withMenuClose(() => {
									onOpen()
								})}
								rightIcon={<ClipboardCopy />}>
								Report lyrics
							</Button>
						</>
					)}
				</ButtonGroup>

				<Modal isOpen={isOpen} onClose={onClose} isCentered>
					<ModalOverlay />
					<ModalContent>
						<ModalHeader>Modal Title</ModalHeader>
						<ModalCloseButton />
						<ModalBody>
							<form onSubmit={submitReport} className="space-y-4">
								<FormControl
									isInvalid={reportType === ""}
									isRequired>
									<FormLabel>Report Type</FormLabel>
									<Select
										placeholder="Select option"
										required
										onChange={(e) =>
											setReportType(e.target.value)
										}>
										<option value="Wrong timing">
											Wrong timing
										</option>
										<option value="Wrong lyrics">
											Wrong lyrics
										</option>
										<option value="Other">Other</option>
									</Select>
								</FormControl>

								<FormControl
									isInvalid={reportMessage == ""}
									isRequired>
									<FormLabel>Message</FormLabel>
									<Input
										placeholder="Message"
										required
										onChange={(e) => {
											setReportMessage(e.target.value)
										}}
									/>
								</FormControl>

								<div>
									<Button
										className="mt-6"
										type="submit"
										w="full">
										Submit Report
									</Button>
								</div>
							</form>
						</ModalBody>

						<ModalFooter />
					</ModalContent>
				</Modal>
			</div>
		</>
	)
}
