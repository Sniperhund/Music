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
import { ReactElement, useState } from "react"

export default function Genre() {
	const [genreName, setGenreName] = useState("")

	const toast = useToast()

	async function submit(event: any) {
		event.preventDefault()

		if (!genreName) return

		const result = await useAPI("/admin/genre", {
			method: "POST",
			data: {
				name: genreName,
			},
		})

		toast({
			status: "success",
			title: "Genre added successfully",
		})
	}

	return (
		<>
			<h1>Add new genre</h1>

			<form onSubmit={submit} className="space-y-4 max-w-2xl mt-4">
				<FormControl isInvalid={genreName === ""} isRequired>
					<FormLabel>Genre Name</FormLabel>
					<Input onChange={(e) => setGenreName(e.target.value)} />
				</FormControl>

				<div>
					<Button className="mt-6" type="submit" w="full">
						Submit
					</Button>
				</div>
			</form>
		</>
	)
}

Genre.getLayout = function getLayout(page: ReactElement) {
	return <AdminLayout>{page}</AdminLayout>
}
