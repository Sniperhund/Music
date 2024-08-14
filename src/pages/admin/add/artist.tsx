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

	useEffect(() => {
		if (search.length > 2) {
			fetch(`/api/searchArtist?q=${search}`)
				.then(async (response) => {
					const data = await response.json()
					setSearchResults(data.artists)
				})
				.catch((error) => {
					toast({
						status: "error",
						title: "An error happened",
						description: error.message,
					})
				})
		}
	}, [search])

	async function addArtistBySearch(id: any) {
		const result: any = await fetch(`/api/addArtist?id=${id}`, {
			headers: {
				authorization: `${getCookie("access_token")}`,
			},
		}).then((response) => response.json())

		if (result._id) {
			toast({
				status: "success",
				title: "Artist added successfully",
			})
		} else {
			toast({
				status: "error",
				title: "An error happened",
				description: result?.message,
			})
		}
	}

	return (
		<Tabs variant="enclosed">
			<TabList>
				<Tab>Search after artist</Tab>
				<Tab>Create custom one</Tab>
			</TabList>
			<TabPanels>
				<TabPanel>
					<h1>Add new artist by searching</h1>

					<section className="space-y-4 max-w-2xl mt-4">
						<DebounceInput
							element={Input}
							debounceTimeout={1000}
							onChange={(e) => setSearch(e.target.value)}
						/>

						{searchResults.map((artist) => (
							<div
								key={artist.id}
								className="flex items-center space-x-4">
								<img
									src={artist.image}
									alt={artist.name}
									className="w-16 h-16 rounded-lg"
								/>
								<a href={artist.href} target="_blank">
									{artist.name}
								</a>
								<Spacer />
								<Button
									onClick={() =>
										addArtistBySearch(artist.id)
									}>
									Add
								</Button>
							</div>
						))}
					</section>
				</TabPanel>
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
