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
} from "@chakra-ui/react"
import { Select } from "chakra-react-select"
import { ReactElement, useEffect, useRef, useState } from "react"
import { NoSSR } from "@kwooshung/react-no-ssr"

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

	const [createNewSingle, setCreateNewSingle] = useState(false)

	async function createSingleAlbum(): Promise<string> {
		let formData = new FormData()

		formData.append("name", `${trackName} - Single`)
		formData.append("artist", artistId)
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

				<FormControl isInvalid={!audioFile} isRequired>
					<FormLabel>Audio File</FormLabel>
					<FileUpload
						onFileSelected={(file) => setAudioFile(file)}
						accept="audio/*">
						<Button w="full">Upload audio file</Button>
					</FileUpload>
					<FormHelperText>
						{audioFile ? audioFile.name : ""}
					</FormHelperText>
				</FormControl>

				<Tabs
					variant="enclosed"
					onChange={(index) => setCreateNewSingle(index === 1)}>
					<TabList>
						<Tab>Use existing album</Tab>
						<Tab>Create as single</Tab>
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
						<TabPanel>
							<FormControl isInvalid={!coverImage} isRequired>
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
