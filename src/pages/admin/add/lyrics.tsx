import useAPI from "@/util/useAPI"
import { FormEvent, ReactElement, useEffect, useState } from "react"
import AdminLayout from "@/components/layouts/Admin"
import {
	Button,
	Checkbox,
	FormControl,
	FormLabel,
	Textarea,
	useToast,
} from "@chakra-ui/react"
import { NoSSR } from "@kwooshung/react-no-ssr"
import { Select } from "chakra-react-select"

export default function Lyrics() {
	const toast = useToast()

	const [trackOptions, setTrackOptions] = useState([])

	useEffect(() => {
		async function fetchData() {
			const trackResults: [] = await useAPI("/all/tracks")

			const tempTrackResults: any = trackResults.map((item: any) => ({
				label: item.name,
				value: item._id,
			}))

			setTrackOptions(tempTrackResults)
		}

		fetchData()
	}, [])

	const [trackId, setTrackId] = useState<string>("")
	const [trackSelectValue, setTrackSelectValue] = useState([])

	const [lyrics, setLyrics] = useState<string>("")

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		if (!trackId || !lyrics) return

		const result: any = await useAPI("/admin/lyrics", {
			method: "POST",
			data: {
				songId: trackId,
				synced: "false",
				lyrics: lyrics,
			},
		})

		if (result?._id) {
			toast({
				status: "success",
				title: "Lyrics added successfully",
			})

			setTrackId("")
			setTrackSelectValue([])
			setLyrics("")
		} else
			toast({
				title: "An error happened",
				description: result?.message,
				status: "error",
			})
	}

	return (
		<>
			<h1>Add new lyrics</h1>

			<form onSubmit={submit} className="space-y-4 max-w-2xl mt-4">
				<NoSSR>
					<FormControl
						isInvalid={trackId === ""}
						isRequired
						id="artist-id">
						<FormLabel>Choose a track</FormLabel>
						<Select
							name="genre"
							inputId="genre-id"
							instanceId="chakra-react-select-2"
							options={trackOptions}
							onChange={(e: any) => {
								setTrackId(e.value)
								setTrackSelectValue(e)
							}}
							value={trackSelectValue}
						/>
					</FormControl>
				</NoSSR>

				<FormControl id="lyrics" isRequired>
					<FormLabel>Lyrics</FormLabel>
					<Textarea
						placeholder="Lyrics"
						id="lyrics"
						name="lyrics"
						required
						rows={10}
						cols={50}
						onChange={(e) => setLyrics(e.target.value)}
						value={lyrics}
					/>
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

Lyrics.getLayout = function getLayout(page: ReactElement) {
	return <AdminLayout>{page}</AdminLayout>
}
