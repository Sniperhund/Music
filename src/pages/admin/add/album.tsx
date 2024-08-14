import FileUpload from "@/components/common/FileUpload"
import AdminLayout from "@/components/layouts/Admin"
import useAPI from "@/util/useAPI"
import {
	Button,
	FormControl,
	FormHelperText,
	FormLabel,
	Input,
	Spacer,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	useToast,
} from "@chakra-ui/react"
import { Select } from "chakra-react-select"
import { ReactElement, useEffect, useState } from "react"
import { NoSSR } from "@kwooshung/react-no-ssr"
import { DebounceInput } from "react-debounce-input"

export default function Album() {
	const [albumName, setAlbumName] = useState("")
	const [artistId, setArtistId] = useState<any>("")
	const [coverImage, setCoverImage] = useState<any>(null)
	const [genreId, setGenreId] = useState("")

	const toast = useToast()

	const [artistSelectValue, setArtistSelectValue] = useState<any>(null)
	const [genreSelectValue, setGenreSelectValue] = useState<any>(null)

	async function submit(event: any) {
		event.preventDefault()

		if (!albumName || !artistId || !coverImage || !genreId) return

		let formData = new FormData()

		formData.append("name", albumName)
		if (artistId.length > 1)
			artistId.forEach((id: string) => formData.append("artists", id))
		else formData.append("artist", artistId)
		formData.append("file", coverImage)
		formData.append("genres", genreId)

		const result: any = await useAPI("/admin/album", {
			method: "POST",
			data: formData,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		})

		if (result?._id)
			toast({
				status: "success",
				title: "Album added successfully",
			})
		else
			toast({
				title: "An error happened",
				description: result?.message,
				status: "error",
			})

		setAlbumName("")
		setArtistId("")
		setCoverImage(null)
		setGenreId("")
		setArtistSelectValue(null)
		setGenreSelectValue(null)
	}

	const [artistOptions, setArtistOptions] = useState<any[]>([])
	const [genreOptions, setGenreOptions] = useState<any[]>([])

	useEffect(() => {
		async function fetchData() {
			const artistResult: [] = await useAPI("/all/artists")

			const tempArtistOptions = artistResult.map((item: any) => ({
				label: item.name,
				value: item._id,
			}))

			setArtistOptions(tempArtistOptions)

			const genreResult: [] = await useAPI("/all/genres")

			const tempGenreOptions = genreResult.map((item: any) => ({
				label: item.name,
				value: item._id,
			}))

			setGenreOptions(tempGenreOptions)
		}

		fetchData()
	}, [])

	const [search, setSearch] = useState("")
	const [searchResults, setSearchResults] = useState<any[]>([])

	useEffect(() => {
		if (search.length > 2) {
			fetch(`/api/searchAlbum?q=${search}`)
				.then(async (response) => {
					const data = await response.json()
					setSearchResults(data.albums)
				})
				.catch((error) => {
					toast({
						title: "An error happened",
						description: error,
						status: "error",
					})
				})
		}
	}, [search])

	async function useImageBySearch(image: any) {
		try {
			const response = await fetch(image)
			const blob = await response.blob()
			const file = new File([blob], "cover_image.jpg", {
				type: "image/jpeg",
			})
			setCoverImage(file)
		} catch (error) {
			toast({
				title: "An error happened",
				description: error,
				status: "error",
			})
		}
	}

	return (
		<>
			<h1>Add new album</h1>

			<form onSubmit={submit} className="space-y-4 max-w-2xl mt-4">
				<FormControl isInvalid={albumName === ""} isRequired>
					<FormLabel>Album Name</FormLabel>
					<Input
						onChange={(e) => setAlbumName(e.target.value)}
						value={albumName}
					/>
				</FormControl>

				<NoSSR>
					<FormControl
						isInvalid={artistId === ""}
						isRequired
						id="artist-id">
						<FormLabel>Choose an artist</FormLabel>
						<Select
							value={artistSelectValue}
							isMulti
							inputId="artist-id"
							instanceId="chakra-react-select-1"
							options={artistOptions}
							onChange={(e) => {
								setArtistId(
									Array.from(e).map((option) => option.value)
								)
								setArtistSelectValue(e)
							}}
						/>
					</FormControl>
				</NoSSR>

				<Tabs variant="enclosed">
					<TabList>
						<Tab>Upload image</Tab>
						<Tab>Search for image</Tab>
					</TabList>
					<TabPanels>
						<TabPanel>
							<FormControl isInvalid={!coverImage}>
								<FormLabel>Cover Image</FormLabel>
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
						</TabPanel>
						<TabPanel className="space-y-4">
							{coverImage ? (
								<>
									<img
										src={URL.createObjectURL(coverImage)}
										alt="Cover image"
										className="w-32 h-32 rounded-lg"
									/>

									<Button onClick={() => setCoverImage(null)}>
										Choose new image
									</Button>
								</>
							) : (
								<>
									<FormControl isInvalid={search === ""}>
										<FormLabel>Search for image</FormLabel>
										<DebounceInput
											element={Input}
											debounceTimeout={1000}
											onChange={(e) =>
												setSearch(e.target.value)
											}
										/>
									</FormControl>

									{searchResults.map((album) => (
										<div
											key={album.id}
											className="flex items-center space-x-4">
											<img
												src={album.image}
												alt={album.name}
												className="w-16 h-16 rounded-lg"
											/>
											<p>{album.name}</p>
											<Spacer />
											<Button
												onClick={() =>
													useImageBySearch(
														album.image
													)
												}>
												Use
											</Button>
										</div>
									))}
								</>
							)}
						</TabPanel>
					</TabPanels>
				</Tabs>

				<NoSSR>
					<FormControl
						isInvalid={genreId === ""}
						isRequired
						id="genre-id">
						<FormLabel>Choose a genre</FormLabel>
						<Select
							inputId="genre-id"
							instanceId="chakra-react-select-2"
							options={genreOptions}
							onChange={(e) => {
								setGenreId(e.value)
								setGenreSelectValue(e)
							}}
							value={genreSelectValue}
						/>
					</FormControl>
				</NoSSR>

				<div>
					<Button className="mt-6" type="submit" w="full">
						Submit
					</Button>
				</div>
			</form>
		</>
	)
}

Album.getLayout = function getLayout(page: ReactElement) {
	return <AdminLayout>{page}</AdminLayout>
}
