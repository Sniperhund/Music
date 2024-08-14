import FileUpload from "@/components/common/FileUpload"
import AdminLayout from "@/components/layouts/Admin"
import useAPI from "@/util/useAPI"
import {
	Button,
	FormControl,
	FormHelperText,
	FormLabel,
	Input,
	useToast,
	Select as ChakraSelect,
	Tabs,
	TabList,
	Tab,
	TabPanels,
	TabPanel,
	Spacer,
} from "@chakra-ui/react"
import { Select } from "chakra-react-select"
import { ReactElement, useEffect, useRef, useState } from "react"
import { NoSSR } from "@kwooshung/react-no-ssr"
import { DebounceInput } from "react-debounce-input"

export default function Track() {
	const [trackName, setTrackName] = useState("")
	const [artistId, setArtistId] = useState<any>("")
	const [audioFile, setAudioFile] = useState<any>(null)
	const [albumId, setAlbumId] = useState("")

	const [coverImage, setCoverImage] = useState<any>(null)
	const [genreId, setGenreId] = useState("")

	const toast = useToast()

	const [artistSelectValue, setArtistSelectValue] = useState<any>(null)
	const [albumSelectValue, setAlbumSelectValue] = useState<any>(null)

	const [genreSelectValue, setGenreSelectValue] = useState<any>(null)

	const [createNewSingle, setCreateNewSingle] = useState(0)

	async function createSingleAlbum(): Promise<string> {
		let formData = new FormData()

		formData.append("name", `${trackName} - Single`)
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

		if (!result?._id) {
			toast({
				title: "An error happened",
				description: result?.message,
				status: "error",
			})

			return ""
		}

		return result?._id
	}

	function clean() {
		setTrackName("")
		setArtistId("")
		setArtistSelectValue(null)
		setAudioFile(null)
		setAlbumId("")
		setAlbumSelectValue(null)
		setCoverImage(null)
		setGenreId("")
		setGenreSelectValue(null)
	}

	async function submit(event: any) {
		event.preventDefault()

		if (!trackName || !artistId || !audioFile) return

		if (createNewSingle && !coverImage && !genreId) return
		if (!createNewSingle && !artistId) return

		let correctAlbumId = albumId

		if (createNewSingle) correctAlbumId = await createSingleAlbum()

		if (correctAlbumId == "") {
			clean()

			return
		}

		let formData = new FormData()

		formData.append("name", trackName)
		if (artistId.length > 1)
			artistId.forEach((id: string) => formData.append("artists", id))
		else formData.append("artist", artistId)
		formData.append("file", audioFile)
		formData.append("album", correctAlbumId)

		const result: any = await useAPI("/admin/track", {
			method: "POST",
			data: formData,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		})

		console.log(result)

		if (result._id)
			toast({
				status: "success",
				title: "Track added successfully",
			})
		else
			toast({
				title: "An error happened",
				description: result.message,
				status: "error",
			})

		clean()
	}

	const [artistOptions, setArtistOptions] = useState<any[]>([])
	const [albumOptions, setAlbumOptions] = useState<any[]>([])
	const [genreOptions, setGenreOptions] = useState<any[]>([])

	useEffect(() => {
		async function fetchData() {
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
		} catch (error: any) {
			toast({
				title: "An error happened",
				description: error,
				status: "error",
			})
		}
	}

	const [youtubeLink, setYoutubeLink] = useState("")
	const [loading, setLoading] = useState(false)

	async function downloadYouTubeAudio() {
		try {
			setLoading(true)

			const response = await fetch(`/api/youtube?url=${youtubeLink}`)

			if (!response.ok) {
				const data = await response.json()
				toast({
					title: "An error happened",
					description: data.message,
					status: "error",
				})
				return
			}

			const blob = await response.blob()
			const file = new File([blob], "audio.mp3", {
				type: "audio/mpeg",
			})
			setAudioFile(file)

			setLoading(false)
		} catch (error: any) {
			toast({
				title: "An error happened",
				description: error,
				status: "error",
			})
		}
	}

	if (!artistOptions || !albumOptions)
		return <>Not enough artists or albums</>

	return (
		<>
			<h1>Add new track</h1>

			<form onSubmit={submit} className="space-y-4 max-w-2xl mt-4">
				<FormControl isInvalid={trackName === ""} isRequired>
					<FormLabel>Track Name</FormLabel>
					<Input
						name="track-name"
						onChange={(e) => setTrackName(e.target.value)}
						value={trackName}
					/>
				</FormControl>

				<NoSSR>
					<FormControl isInvalid={artistId === ""} isRequired>
						<FormLabel>Choose an artist</FormLabel>
						<Select
							name="artist"
							isMulti
							options={artistOptions}
							onChange={(e) => {
								setArtistId(
									Array.from(e).map((option) => option.value)
								)
								setArtistSelectValue(e)
							}}
							value={artistSelectValue}
						/>
					</FormControl>
				</NoSSR>

				<Tabs variant="enclosed">
					<TabList>
						<Tab>Upload audio file</Tab>
						<Tab>Use YouTube link</Tab>
					</TabList>
					<TabPanels>
						<TabPanel>
							<FormControl isInvalid={!audioFile} isRequired>
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
						</TabPanel>
						<TabPanel className="space-y-4">
							{audioFile ? (
								<>
									<audio
										className="w-full"
										controls
										src={URL.createObjectURL(audioFile)}
									/>
									<Button
										w="full"
										onClick={() => setAudioFile(null)}>
										Choose new file
									</Button>
								</>
							) : (
								<>
									<FormControl
										isInvalid={!audioFile}
										isRequired>
										<FormLabel>YouTube Link</FormLabel>
										<Input
											placeholder="https://www.youtube.com/watch?v=xxxxxxxxxxx"
											onChange={(e) =>
												setYoutubeLink(e.target.value)
											}
										/>
									</FormControl>

									<Button
										w="full"
										onClick={() => {
											downloadYouTubeAudio()
										}}
										isLoading={loading}>
										Use YouTube Link
									</Button>
								</>
							)}
						</TabPanel>
					</TabPanels>
				</Tabs>

				<Tabs
					variant="enclosed"
					onChange={(index) => setCreateNewSingle(index)}>
					<TabList>
						<Tab>Use existing album</Tab>
						<Tab>Create as single - Upload</Tab>
						<Tab>Create as single - Search</Tab>
					</TabList>
					<TabPanels>
						<TabPanel>
							<NoSSR>
								<FormControl isInvalid={albumId === ""}>
									<FormLabel>Choose an album</FormLabel>
									<Select
										name="album"
										options={albumOptions}
										onChange={(e) => {
											setAlbumId(e.value)
											setAlbumSelectValue(e)
										}}
										value={albumSelectValue}
									/>
								</FormControl>
							</NoSSR>
						</TabPanel>
						<TabPanel className="space-y-4">
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

							<NoSSR>
								<FormControl
									isInvalid={genreId === ""}
									id="genre-id">
									<FormLabel>Choose a genre</FormLabel>
									<Select
										name="genre"
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

							<NoSSR>
								<FormControl
									isInvalid={genreId === ""}
									id="genre-id">
									<FormLabel>Choose a genre</FormLabel>
									<Select
										name="genre"
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
						</TabPanel>
					</TabPanels>
				</Tabs>

				<div>
					<Button className="mt-6" type="submit" w="full">
						Submit
					</Button>
				</div>
			</form>
		</>
	)
}

Track.getLayout = function getLayout(page: ReactElement) {
	return <AdminLayout>{page}</AdminLayout>
}
