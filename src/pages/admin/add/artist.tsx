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
import { ReactElement, useEffect, useState } from "react"
import { DebounceInput } from "react-debounce-input"
import { getCookie } from "cookies-next"
import getFilePath from "@/util/getFilePath"

export default function Artist() {
	const [artistName, setArtistName] = useState("")
	const [coverImage, setCoverImage] = useState<any>(null)

	const toast = useToast()

	async function submit(event: any) {
		event.preventDefault()

		if (!artistName || !coverImage) return

		let formData = new FormData()

		formData.append("name", artistName)
		formData.append("file", coverImage)

		const result: any = await useAPI("/admin/artist", {
			method: "POST",
			data: formData,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		})

		if (result?._id)
			toast({
				status: "success",
				title: "Artist added successfully",
			})
		else
			toast({
				title: "An error happened",
				description: result?.message,
				status: "error",
			})

		setArtistName("")
		setCoverImage(null)
	}

	const [search, setSearch] = useState("")
	const [searchResults, setSearchResults] = useState<any[]>([])
	const [existingArtists, setExistingArtists] = useState<any[]>([])

	useEffect(() => {
		if (search.length > 2) {
			useAPI("/search", {
				params: {
					q: search,
					type: "artist",
					limit: 3,
				},
			}).then((result: any) => {
				console.log(result)
				setExistingArtists(result)
			})
		}
	}, [search])

	return (
		<Tabs variant="enclosed">
			<TabList>
				<Tab>Create custom one</Tab>
			</TabList>
			<TabPanels>
				<TabPanel>
					<h1>Add new artist</h1>

					<form
						onSubmit={submit}
						className="space-y-4 max-w-2xl mt-4">
						<FormControl isInvalid={artistName === ""} isRequired>
							<FormLabel>Artist Name</FormLabel>
							<Input
								onChange={(e) => setArtistName(e.target.value)}
								value={artistName}
							/>
						</FormControl>

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

						<div>
							<Button className="mt-6" type="submit" w="full">
								Submit
							</Button>
						</div>
					</form>
				</TabPanel>
			</TabPanels>
		</Tabs>
	)
}

Artist.getLayout = function getLayout(page: ReactElement) {
	return <AdminLayout>{page}</AdminLayout>
}
