import useAPI from "@/util/useAPI"
import { useEffect, useState } from "react"
import Slider from "./Slider"
import Card from "../album/Card"
import getFilePath from "@/util/getFilePath"

interface Genre {
	id: string
	name: string
}

interface AutomaticSliderProps {
	amount?: number
	genre?: Genre
}

export default function AutomaticSlider(props: AutomaticSliderProps) {
	if (props.amount) return AutoFetchGenreSlider(props.amount)
	else if (props.genre) return GenreProvidedSlider(props.genre)

	return <>An error happened</>
}

function AutoFetchGenreSlider(amount: number) {
	const [randomAlbums, setRandomAlbums] = useState<any[]>([])
	const [genreData, setGenreData] = useState<any[]>([])

	useEffect(() => {
		async function fetchData() {
			const genres: any[] = await useAPI(`/genres/random?limit=${amount}`)

			setGenreData(genres)

			let tempRandomAlbums = []

			for (const genre of genres) {
				const randomAlbumArray: any[] = await useAPI(
					`/albums/${genre._id}/random`
				)

				tempRandomAlbums.push(randomAlbumArray)
			}

			setRandomAlbums(tempRandomAlbums)
		}

		fetchData()
	}, [amount])

	return (
		<section className="flex flex-col gap-8">
			{genreData.map(function (genre, i) {
				return (
					<Slider title={genre.name} key={i}>
						{randomAlbums[i]?.map(function (album: any, j: number) {
							return (
								<Card
									key={j}
									imageUrl={getFilePath("Album", album.cover)}
									albumName={album.name}
									artistName={album.artist.name}
									albumId={album._id}
								/>
							)
						})}
					</Slider>
				)
			})}
		</section>
	)
}

function GenreProvidedSlider(genre: Genre) {
	const [randomAlbums, setRandomAlbums] = useState<any[]>([])

	useEffect(() => {
		async function fetchData() {
			const randomAlbumArray: [] = await useAPI(
				`/albums/${genre.id}/random`
			)

			console.log(randomAlbumArray)

			setRandomAlbums(randomAlbumArray)
		}

		fetchData()
	}, [genre.id])

	return (
		<Slider title={genre.name}>
			{randomAlbums?.map(function (album, j) {
				return (
					<Card
						key={j}
						imageUrl={getFilePath("Album", album.cover)}
						albumName={album.name}
						artistName={album.artist.name}
						albumId={album._id}
					/>
				)
			})}
		</Slider>
	)
}
