import AutomaticSlider, {
	DataProvidedSliderProps,
} from "@/components/common/AutomaticSlider"
import PageTitle from "@/components/PageTitle"
import useAPI from "@/util/useAPI"
import { useEffect, useState } from "react"
import { useSessionStorage } from "usehooks-ts"

export default function Home() {
	const [data, setData] = useState<DataProvidedSliderProps>()
	const [homeData, setHomeData, removeHomeData] = useSessionStorage(
		"home-data",
		[],
	)

	useEffect(() => {
		if (homeData.length != 0) {
			// @ts-ignore
			setData(homeData as DataProvidedSliderProps)
			return
		}

		async function fetchData() {
			const genres: any = await useAPI(`/genres/random?limit=10`)

			const albumPromises = genres.map((genre: any) =>
				useAPI(`/albums/${genre._id}/random`),
			)
			const tempRandomAlbums = await Promise.all(albumPromises)

			const tempData = genres?.map((genre: any, i: number) => {
				if (!tempRandomAlbums[i] || tempRandomAlbums[i].status) return

				return {
					title: genre.name,
					albums: tempRandomAlbums[i],
				}
			})

			setHomeData(tempData)
			setData(tempData)
		}

		fetchData()
	}, [homeData])

	return (
		<>
			<PageTitle>Home</PageTitle>
			<AutomaticSlider data={data} />
		</>
	)
}
