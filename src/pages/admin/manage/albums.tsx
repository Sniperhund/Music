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
import getFilePath from "@/util/getFilePath"

export default function Albums() {
	const router = useRouter()
	const toast = useToast()
	const { isOpen, onOpen, onClose } = useDisclosure()

	function setLimit(limit: number) {
		if (!limit) return

		const page = parseInt(router.query.page as string) || 1

		router.push(
			{
				pathname: "/admin/manage/albums",
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
				pathname: "/admin/manage/albums",
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
				pathname: "/admin/manage/albums",
				query: { limit, page: page - 1 },
			},
			undefined,
			{ shallow: true }
		)
	}

	const [tableData, setTableData] = useState<any>()
	const [activeAlbum, setActiveAlbum] = useState<any>()

	async function fetchData() {
		const page = parseInt(router.query.page as string) || 1
		const limit = parseInt(router.query.limit as string) || 10

		const result: any = await useAPI(
			`/all/albums?offset=${(page - 1) * limit}&limit=${limit}`
		)

		if (result.status)
			return alert(`Failed to fetch data: ${result.message}`)

		setTableData(result)
	}

	useEffect(() => {
		fetchData()
	}, [router.query.page, router.query.limit])

	const [albumName, setAlbumName] = useState("")
	const [artistId, setArtistId] = useState<any>("")
	const [coverImage, setCoverImage] = useState<any>(null)
	const [genreId, setGenreId] = useState("")

	const [artistOptions, setArtistOptions] = useState<any[]>([])
	const [genreOptions, setGenreOptions] = useState<any[]>([])

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

			const genreResult: any = await useAPI("/all/genres")

			if (!Array.isArray(genreResult) && genreResult?.status != 200)
				return

			const tempGenreOptions = genreResult.map((item: any) => ({
				label: item.name,
				value: item._id,
			}))

			setGenreOptions(tempGenreOptions)
		}

		fetchOptionsData()
	}, [])

	async function submit(event: any) {
		event.preventDefault()

		if (!albumName && !artistId && !coverImage && !genreId) return

		let formData = new FormData()

		if (albumName) formData.append("name", albumName)
		if (artistId) {
			if (artistId.length > 1)
				artistId.forEach((id: string) => formData.append("artists", id))
			else formData.append("artist", artistId)
		}
		if (coverImage) formData.append("file", coverImage)
		if (genreId) formData.append("genres", genreId)

		const result: any = await useAPI(`/admin/album?id=${activeAlbum._id}`, {
			method: "PUT",
			data: formData,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		})

		if (result._id)
			toast({
				status: "success",
				title: "Album changed successfully",
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
			<h1>Manage albums</h1>

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
							<Th>artist(s)</Th>
							<Th>cover</Th>
							<Th>genres</Th>
							<Th className="w-12">action</Th>
						</Tr>
					</Thead>
					<Tbody>
						{tableData?.map((album: any) => (
							<Tr key={album._id}>
								<Td>{album._id}</Td>
								<Td>{album.name}</Td>
								<Td>
									<ArtistName
										artists={album.artists}
										element="p"
									/>
								</Td>
								<Td>
									<img
										src={getFilePath("album", album.cover)}
										className="w-12 rounded-lg"
									/>
								</Td>
								<Td>
									{album.genres.map((genre: any) => (
										<p key={genre._id}>{genre.name}</p>
									))}
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
													setActiveAlbum(album)
													setAlbumName(album.name)
													setArtistId(
														album.artists.map(
															(artist: any) =>
																artist._id
														)
													)
													setGenreId(
														album.genres[0]._id
													)
													setCoverImage(null)
													onOpen()
												}}>
												Edit details
											</MenuItem>
											<MenuItem
												onClick={async () => {
													if (
														confirm(
															"Are you sure you want to delete this album?"
														)
													) {
														const result: any =
															await useAPI(
																`/admin/album?id=${album._id}`,
																{
																	method: "DELETE",
																}
															)

														if (result?.status)
															return alert(
																`Failed to delete album: ${result.message}`
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
					<ModalHeader>{activeAlbum?.name}</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<form
							onSubmit={submit}
							className="space-y-4 max-w-2xl mt-4">
							<FormControl>
								<FormLabel>Album Name</FormLabel>
								<Input
									onChange={(e) =>
										setAlbumName(e.target.value)
									}
									value={albumName}
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
											if (!activeAlbum) return

											return activeAlbum.artists.map(
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
								<FormLabel>Cover image</FormLabel>
								<FileUpload
									onFileSelected={(file) =>
										setCoverImage(file)
									}
									accept="image/*">
									<Button w="full">Upload cover image</Button>
								</FileUpload>
								<FormHelperText>
									{coverImage ? coverImage.name : ""}
								</FormHelperText>
							</FormControl>

							<NoSSR>
								<FormControl>
									<FormLabel>Choose a genre</FormLabel>
									<MultiSelect
										options={genreOptions}
										onChange={(e: any) =>
											setGenreId(e.value)
										}
										defaultValue={() => {
											if (!activeAlbum) return

											return {
												label: activeAlbum.genres[0]
													.name,
												value: activeAlbum.genres[0]
													._id,
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

Albums.getLayout = function getLayout(page: ReactElement) {
	return <AdminLayout>{page}</AdminLayout>
}
