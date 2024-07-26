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

export default function Track() {
	const [trackName, setTrackName] = useState("")
	const [artistId, setArtistId] = useState<any>("")
	const [audioFile, setAudioFile] = useState<any>(null)
	const [albumId, setAlbumId] = useState("")

	const toast = useToast()

	async function submit(event: any) {
		event.preventDefault()

		if (!trackName || !artistId || !audioFile || !albumId) return

		let formData = new FormData()

		formData.append("name", trackName)
		if (artistId.length > 1)
			artistId.forEach((id: string) => formData.append("artists", id))
		else formData.append("artist", artistId)
		formData.append("file", audioFile)
		formData.append("album", albumId)

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
	}

	const [artistOptions, setArtistOptions] = useState<any[]>([])
	const [albumOptions, setAlbumOptions] = useState<any[]>([])

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
					<Input onChange={(e) => setTrackName(e.target.value)} />
				</FormControl>

				<NoSSR>
					<FormControl isInvalid={artistId === ""} isRequired>
						<FormLabel>Choose an artist</FormLabel>
						<Select
							isMulti
							options={artistOptions}
							onChange={(e) =>
								setArtistId(
									Array.from(e).map((option) => option.value)
								)
							}
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

				<NoSSR>
					<FormControl isInvalid={albumId === ""} isRequired>
						<FormLabel>Choose an album</FormLabel>
						<Select
							options={albumOptions}
							onChange={(e) => setAlbumId(e.value)}
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

Track.getLayout = function getLayout(page: ReactElement) {
	return <AdminLayout>{page}</AdminLayout>
}
