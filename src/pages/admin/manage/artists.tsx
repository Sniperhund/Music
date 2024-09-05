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
import { DebounceInput } from "react-debounce-input"

export default function Artists() {
	const router = useRouter()
	const toast = useToast()
	const { isOpen, onOpen, onClose } = useDisclosure()

	function setLimit(limit: number) {
		if (!limit) return

		const page = parseInt(router.query.page as string) || 1

		router.push(
			{
				pathname: "/admin/manage/artists",
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
				pathname: "/admin/manage/artists",
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
				pathname: "/admin/manage/artists",
				query: { limit, page: page - 1 },
			},
			undefined,
			{ shallow: true }
		)
	}

	const [tableData, setTableData] = useState<any>()
	const [activeArtist, setActiveArtist] = useState<any>()

	async function fetchData() {
		const page = parseInt(router.query.page as string) || 1
		const limit = parseInt(router.query.limit as string) || 10

		const result: any = await useAPI(
			`/all/artists?offset=${(page - 1) * limit}&limit=${limit}`
		)

		if (result.status)
			return alert(`Failed to fetch data: ${result.message}`)

		setTableData(result)

		if (search.length < 3) {
			setShownData(result)
		}
	}

	useEffect(() => {
		fetchData()
	}, [router.query.page, router.query.limit])

	const [artistName, setArtistName] = useState("")
	const [coverImage, setCoverImage] = useState<any>(null)

	async function submit(event: any) {
		event.preventDefault()

		if (!artistName && !coverImage) return

		let formData = new FormData()

		if (artistName) formData.append("name", artistName)
		if (coverImage) formData.append("file", coverImage)

		const result: any = await useAPI(
			`/admin/artist?id=${activeArtist._id}`,
			{
				method: "PUT",
				data: formData,
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		)

		if (result._id)
			toast({
				status: "success",
				title: "Artist changed successfully",
			})
		else
			toast({
				title: "An error happened",
				description: result.message,
				status: "error",
			})

		fetchData()
	}

	const [search, setSearch] = useState("")
	const [shownData, setShownData] = useState<any>()

	useEffect(() => {
		if (search.length < 3) {
			setShownData(tableData)
			return
		}

		useAPI("/search", {
			params: {
				q: search,
				type: "artist",
				limit: parseInt(router.query.limit as string) || 10,
			},
		}).then((result: any) => {
			setShownData(result)
		})
	}, [search])

	return (
		<>
			<h1>Manage artists</h1>

			<DebounceInput
				element={Input}
				debounceTimeout={500}
				placeholder="Search..."
				onChange={(e) => setSearch(e.target.value)}
				className="my-4"
			/>

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
							<Th>cover image</Th>
							<Th>name</Th>
							<Th className="w-12">action</Th>
						</Tr>
					</Thead>
					<Tbody>
						{shownData?.map((artist: any) => (
							<Tr key={artist._id}>
								<Td>{artist._id}</Td>
								<Td>
									<img
										alt="Artist image"
										src={getFilePath(
											"artist",
											artist.cover
										)}
										className="w-12 rounded-lg"
									/>
								</Td>
								<Td>{artist.name}</Td>
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
													setActiveArtist(artist)
													setArtistName(artist.name)
													setCoverImage(null)
													onOpen()
												}}>
												Edit details
											</MenuItem>
											<MenuItem
												onClick={async () => {
													if (
														confirm(
															"Are you sure you want to delete this artist?"
														)
													) {
														const result: any =
															await useAPI(
																`/admin/artist?id=${artist._id}`,
																{
																	method: "DELETE",
																}
															)

														if (result?.status)
															return alert(
																`Failed to delete artist: ${result.message}`
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
					<ModalHeader>{activeArtist?.name}</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<form
							onSubmit={submit}
							className="space-y-4 max-w-2xl mt-4">
							<FormControl>
								<FormLabel>Artist Name</FormLabel>
								<Input
									onChange={(e) =>
										setArtistName(e.target.value)
									}
									value={artistName}
								/>
							</FormControl>

							<FormControl>
								<FormLabel>Cover image</FormLabel>
								<FileUpload
									onFileSelected={(file) =>
										setCoverImage(file)
									}
									accept="image/*">
									<Button w="full">Upload cover file</Button>
								</FileUpload>
								<FormHelperText>
									{coverImage ? coverImage.name : ""}
								</FormHelperText>
							</FormControl>

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

Artists.getLayout = function getLayout(page: ReactElement) {
	return <AdminLayout>{page}</AdminLayout>
}
