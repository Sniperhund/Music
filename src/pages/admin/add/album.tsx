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
} from "@chakra-ui/react"
import { Select } from "chakra-react-select"
import { ReactElement, useEffect, useState } from "react"
import { NoSSR } from "@kwooshung/react-no-ssr"

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

				<FormControl isInvalid={!coverImage} isRequired>
					<FormLabel>Cover Image</FormLabel>
					<FileUpload
						onFileSelected={(file) => setCoverImage(file)}
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
