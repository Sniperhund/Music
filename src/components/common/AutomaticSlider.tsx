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
	data?: DataProvidedSliderProps
}

export default function AutomaticSlider(props: AutomaticSliderProps) {
	if (props.genre) return GenreProvidedSlider(props.genre)
	else if (props.data) return DataProvidedSlider(props.data)
	else return AutoFetchGenreSlider(props.amount ? props.amount : 10)
}

function AutoFetchGenreSlider(amount: number) {
	const [randomAlbums, setRandomAlbums] = useState<any[]>([])
	const [genreData, setGenreData] = useState<any[]>([])

	useEffect(() => {
		async function fetchData() {
			const genres: any = await useAPI(`/genres/random?limit=${amount}`)

			setGenreData(genres)
		}

		fetchData()
	}, [amount])

	useEffect(() => {
		async function fetchData() {
			if (!genreData.length) return

			const albumPromises = genreData.map((genre) =>
				useAPI(`/albums/${genre._id}/random`),
			)
			const tempRandomAlbums = await Promise.all(albumPromises)

			setRandomAlbums(tempRandomAlbums)
		}

		fetchData()
	}, [genreData])

	if (!genreData.length) return <></>

	return (
		<section className="flex flex-col gap-8">
			{genreData?.map(function (genre, i) {
				if (!randomAlbums[i] || randomAlbums[i]?.status) return <></>
				/*return (
						<Slider title={genre.name} key={i}>
							{Array.apply(0, Array(10)).map(function (x, j) {
								return <Card key={j} loading />
							})}
						</Slider>
					)*/

				return (
					<Slider title={genre.name} key={i}>
						{randomAlbums[i]?.map(function (album: any, j: number) {
							return (
								<Card
									key={j}
									imageUrl={getFilePath("Album", album.cover)}
									albumName={album.name}
									artists={album.artists}
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
				`/albums/${genre.id}/random`,
			)

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
						artists={album.artists}
						albumId={album._id}
					/>
				)
			})}
		</Slider>
	)
}

export interface DataProvidedSliderProps {
	data: [GenreData]
}

interface GenreData {
	title: string
	albums: [
		{
			cover: string
			name: string
			artists: [
				{
					_id: string
					name: string
					cover: string
				},
			]
			_id: string
		},
	]
}

function DataProvidedSlider(data: DataProvidedSliderProps) {
	return (
		<section className="flex flex-col gap-8">
			{data &&
				// @ts-ignore
				data.map((genre: any, i: number) => {
					if (!genre || !genre.albums) return <></>

					return (
						<Slider title={genre.title} key={i}>
							{genre.albums.map((album: any, j: number) => {
								return (
									<Card
										key={j}
										imageUrl={getFilePath(
											"Album",
											album.cover,
										)}
										albumName={album.name}
										artists={album.artists}
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
