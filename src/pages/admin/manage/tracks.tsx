import ArtistName from "@/components/ArtistName"
import AdminLayout from "@/components/layouts/Admin"
import useAPI from "@/util/useAPI"
import {
	Button,
	TableContainer,
	Select,
	Table,
	Thead,
	Tr,
	Th,
	Tbody,
	Td,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
	useDisclosure,
	Input,
	FormLabel,
	FormControl,
	FormHelperText,
	useToast,
} from "@chakra-ui/react"
import { Select as MultiSelect } from "chakra-react-select"
import { NoSSR } from "@kwooshung/react-no-ssr"
import { ChevronDownIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/router"
import { ReactElement, useEffect, useState } from "react"
import FileUpload from "@/components/common/FileUpload"

export default function Tracks() {
	const router = useRouter()
	const toast = useToast()
	const { isOpen, onOpen, onClose } = useDisclosure()

	function setLimit(limit: number) {
		if (!limit) return

		const page = parseInt(router.query.page as string) || 1

		router.push(
			{
				pathname: "/admin/manage/tracks",
				query: { limit, page },
			},
			undefined,
			{ shallow: true }
		)
	}

	function nextPage() {
		const page = parseInt(router.query.page as string) || 1
		const limit = parseInt(router.query.limit as string) || 10

		router.push(
			{
				pathname: "/admin/manage/tracks",
				query: { limit, page: page + 1 },
			},
			undefined,
			{ shallow: true }
		)
	}

	function prevPage() {
		const page = parseInt(router.query.page as string) || 1
		const limit = parseInt(router.query.limit as string) || 10

		if (page <= 1) return

		router.push(
			{
				pathname: "/admin/manage/tracks",
				query: { limit, page: page - 1 },
			},
			undefined,
			{ shallow: true }
		)
	}

	const [tableData, setTableData] = useState<any>()
	const [activeTrack, setActiveTrack] = useState<any>()

	async function fetchData() {
		const page = parseInt(router.query.page as string) || 1
		const limit = parseInt(router.query.limit as string) || 10

		const result: any = await useAPI(
			`/all/tracks?offset=${(page - 1) * limit}&limit=${limit}`
		)

		if (result.status)
			return alert(`Failed to fetch data: ${result.message}`)

		setTableData(result)
	}

	useEffect(() => {
		fetchData()
	}, [router.query.page, router.query.limit])

	const [trackName, setTrackName] = useState("")
	const [artistId, setArtistId] = useState<any>("")
	const [audioFile, setAudioFile] = useState<any>(null)
	const [albumId, setAlbumId] = useState("")

	const [artistOptions, setArtistOptions] = useState<any[]>([])
	const [albumOptions, setAlbumOptions] = useState<any[]>([])

	useEffect(() => {
		async function fetchOptionsData() {
			const artistResult: any = await useAPI("/all/artists")

			if (!Array.isArray(artistResult) && artistResult?.status != 200)
				return

			const tempArtistOptions = artistResult.map((item: any) => ({
				label: item.name,
				value: item._id,
			}))

			setArtistOptions(tempArtistOptions)

			const albumResult: any = await useAPI("/all/albums")

			if (!Array.isArray(albumResult) && albumResult?.status != 200)
				return

			const tempAlbumOptions = albumResult.map((item: any) => ({
				label: item.name,
				value: item._id,
			}))

			setAlbumOptions(tempAlbumOptions)
		}

		fetchOptionsData()
	}, [])

	async function submit(event: any) {
		event.preventDefault()

		if (!trackName && !artistId && !audioFile && !albumId) return

		let formData = new FormData()

		if (trackName) formData.append("name", trackName)
		if (artistId) {
			if (artistId.length > 1)
				artistId.forEach((id: string) => formData.append("artists", id))
			else formData.append("artist", artistId)
		}
		if (audioFile) formData.append("file", audioFile)
		if (albumId) formData.append("album", albumId)

		const result: any = await useAPI(`/admin/track?id=${activeTrack._id}`, {
			method: "PUT",
			data: formData,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		})

		if (result._id)
			toast({
				status: "success",
				title: "Track changed successfully",
			})
		else
			toast({
				title: "An error happened",
				description: result.message,
				status: "error",
			})

		fetchData()
	}

	return (
		<>
			<h1>Manage tracks</h1>

			<section className="flex justify-between my-4">
				<Button onClick={() => prevPage()}>Previous page</Button>
				<Select
					maxW={72}
					value={router.query.limit || 10}
					onChange={(e) => setLimit(parseInt(e.target.value))}>
					<option value="10" selected>
						10
					</option>
					<option value="25">25</option>
					<option value="50">50</option>
				</Select>
				<Button onClick={() => nextPage()}>Next page</Button>
			</section>

			<TableContainer>
				<Table>
					<Thead>
						<Tr>
							<Th>id</Th>
							<Th>name</Th>
							<Th>album name</Th>
							<Th>artist(s)</Th>
							<Th className="w-12">action</Th>
						</Tr>
					</Thead>
					<Tbody>
						{tableData?.map((track: any) => (
							<Tr key={track._id}>
								<Td>{track._id}</Td>
								<Td>{track.name}</Td>
								<Td>
									<Link href={`/album/${track.album._id}`}>
										{track.album.name}
									</Link>
								</Td>
								<Td>
									<ArtistName
										artists={track.artists}
										element="p"
									/>
								</Td>
								<Td>
									<Menu>
										<MenuButton
											as={Button}
											rightIcon={<ChevronDownIcon />}>
											Actions
										</MenuButton>
										<MenuList>
											<MenuItem
												onClick={() => {
													setActiveTrack(track)
													setTrackName(track.name)
													setArtistId(
														track.artists.map(
															(artist: any) =>
																artist._id
														)
													)
													setAlbumId(track.album._id)
													setAudioFile(null)
													onOpen()
												}}>
												Edit details
											</MenuItem>
											<MenuItem
												onClick={async () => {
													if (
														confirm(
															"Are you sure you want to delete this track?"
														)
													) {
														const result: any =
															await useAPI(
																`/admin/track?id=${track._id}`,
																{
																	method: "DELETE",
																}
															)

														if (result.status)
															return alert(
																`Failed to delete track: ${result.message}`
															)
													}

													fetchData()
												}}>
												Delete
											</MenuItem>
										</MenuList>
									</Menu>
								</Td>
							</Tr>
						))}
					</Tbody>
				</Table>
			</TableContainer>

			<section className="flex justify-between my-4">
				<Button onClick={() => prevPage()}>Previous page</Button>
				<Select
					maxW={72}
					value={router.query.limit || 10}
					onChange={(e) => setLimit(parseInt(e.target.value))}>
					<option value="10" selected>
						10
					</option>
					<option value="25">25</option>
					<option value="50">50</option>
				</Select>
				<Button onClick={() => nextPage()}>Next page</Button>
			</section>

			<Modal isOpen={isOpen} onClose={onClose} size="xl">
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>
						{activeTrack?.name} -{" "}
						<ArtistName
							artists={activeTrack?.artists}
							element="p"
						/>
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<form
							onSubmit={submit}
							className="space-y-4 max-w-2xl mt-4">
							<FormControl>
								<FormLabel>Track Name</FormLabel>
								<Input
									onChange={(e) =>
										setTrackName(e.target.value)
									}
									value={trackName}
								/>
							</FormControl>

							<NoSSR>
								<FormControl>
									<FormLabel>Choose an artist</FormLabel>
									<MultiSelect
										isMulti
										options={artistOptions}
										onChange={(e) =>
											setArtistId(
												Array.from(e).map(
													(option: any) =>
														option.value
												)
											)
										}
										defaultValue={() => {
											if (!activeTrack) return

											return activeTrack.artists.map(
												(artist: any) => ({
													label: artist.name,
													value: artist._id,
												})
											)
										}}
									/>
								</FormControl>
							</NoSSR>

							<FormControl>
								<FormLabel>Audio File</FormLabel>
								<FileUpload
									onFileSelected={(file) =>
										setAudioFile(file)
									}
									accept="audio/*">
									<Button w="full">Upload audio file</Button>
								</FileUpload>
								<FormHelperText>
									{audioFile ? audioFile.name : ""}
								</FormHelperText>
							</FormControl>

							<NoSSR>
								<FormControl>
									<FormLabel>Choose an album</FormLabel>
									<MultiSelect
										options={albumOptions}
										onChange={(e: any) =>
											setAlbumId(e.value)
										}
										defaultValue={() => {
											if (!activeTrack) return

											return {
												label: activeTrack.album.name,
												value: activeTrack.album._id,
											}
										}}
									/>
								</FormControl>
							</NoSSR>

							<div>
								<Button
									className="mt-6"
									type="submit"
									w="full"
									onClick={() => onClose()}>
									Submit
								</Button>
							</div>
						</form>
					</ModalBody>

					<ModalFooter></ModalFooter>
				</ModalContent>
			</Modal>
		</>
	)
}

Tracks.getLayout = function getLayout(page: ReactElement) {
	return <AdminLayout>{page}</AdminLayout>
}
