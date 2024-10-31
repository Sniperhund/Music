import getSpotifyToken from "@/util/server/getSpotifyToken"
import axios, { AxiosRequestConfig } from "axios"
import type { NextApiRequest, NextApiResponse } from "next"
import defu from "defu"

let baseUrl: any

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		let { id, genreId, url } = req.query

		const backendAccessToken = req.headers.authorization as string

		if (!backendAccessToken)
			return res.status(401).json({ message: "Unauthorized" })

		const spotifyAccessToken = await getSpotifyToken()

		if (!spotifyAccessToken) {
			res.status(500).json({
				message: "Failed to get Spotify access token",
			})
			return
		}

		const host = req.headers.host
		const protocol = req.headers["x-forwarded-proto"] || "http"

		baseUrl = `${protocol}://${host}`

		if (!baseUrl) {
			return res.status(500).json({ message: "Failed to get base URL" })
		}

		const track = await axios
			.get(`https://api.spotify.com/v1/tracks/${id}`, {
				headers: { Authorization: `Bearer ${spotifyAccessToken}` },
			})
			.then((response) => response.data)
			.catch((error) => error.response.data)

		if (track.error) {
			res.status(500).json({ message: track.error.message })
			return
		}

		let youtubeUrl
		if (url) youtubeUrl = url
		else
			youtubeUrl = await searchYouTube(
				`${track.name} ${track.artists
					.map((artist: any) => artist.name)
					.join(" ")}`
			)

		if (!youtubeUrl) {
			return res.status(404).json({
				message: "No YouTube video found for the query",
			})
		}

		const trackName = track.name
		const artistNames = track.artists.map((artist: any) => {
			return {
				name: artist.name,
				id: artist.id,
			}
		})

		let albumId

		const imageResponse = await axios.get(track.album.images[0].url, {
			responseType: "arraybuffer",
		})
		const imageBuffer = Buffer.from(imageResponse.data, "binary")

		const formData = new FormData()

		formData.append("name", trackName)

		const defaults: AxiosRequestConfig = {
			baseURL: process.env.NEXT_PUBLIC_API_URL,
			headers: {
				Authorization: `${backendAccessToken}`,
			},
		}

		const artistIds = await fetchArtistIds(artistNames, defaults)

		if (artistIds.length > 1)
			artistIds.forEach((id: string) => formData.append("artists", id))
		else formData.append("artist", artistIds[0])

		if (track.album.album_type == "single") {
			albumId = await createAlbum(
				`${trackName} - Single`,
				artistIds,
				imageBuffer,
				genreId,
				defaults
			)

			formData.append("album", albumId)
		} else {
			const albumResponse = await axios(
				`/search?q=${track.album.name}&type=album`,
				defaults
			)

			if (albumResponse.data.response.length == 0) {
				albumId = await createAlbum(
					track.album.name,
					artistIds,
					imageBuffer,
					genreId,
					defaults
				)

				formData.append("album", albumId)
			} else {
				formData.append("album", albumResponse.data.response[0]._id)
			}
		}

		const audioResponse = await axios.get(
			`${baseUrl}/api/youtube?url=${youtubeUrl}`,
			{
				responseType: "arraybuffer",
			}
		)
		const audioBuffer = Buffer.from(audioResponse.data, "binary")

		formData.append(
			"file",
			new Blob([audioBuffer], { type: "audio/mpeg" }),
			`${trackName}.mp3`
		)

		const trackResponse = await axios(
			"/admin/track",
			defu(
				{
					method: "POST",
					data: formData,
				},
				defaults
			)
		)

		res.status(200).json({
			message: "Track added",
			track: trackResponse.data.response,
		})
	} catch (error: any) {
		res.status(500).json({ message: error.message })
	}
}

async function fetchArtistIds(
	artists: { name: string; id: string }[],
	defaults: any
) {
	const artistIds = []

	const spotifyAccessToken = await getSpotifyToken()

	for (const artist of artists) {
		const artistResponse = await axios(
			`/search?q=${artist.name}&type=artist`,
			defaults
		)

		if (artistResponse.data.response.length == 0) {
			const artistData = await fetch(
				`${baseUrl}/api/addArtist?id=${artist.id}`,
				{
					headers: {
						Authorization: `${defaults.headers.Authorization}`,
					},
				}
			).then((res) => res.json())

			artistIds.push(artistData._id)
		} else {
			artistIds.push(artistResponse.data.response[0]._id)
		}
	}

	return artistIds
}

async function createAlbum(
	trackName: any,
	artists: any,
	imageBuffer: any,
	genreId: any,
	defaults: any
) {
	const formData = new FormData()
	formData.append("name", trackName)
	if (artists.length > 1)
		artists.forEach((id: string) => formData.append("artists", id))
	else formData.append("artist", artists)
	formData.append(
		"file",
		new Blob([imageBuffer], { type: "image/jpeg" }),
		`${trackName}.jpg`
	)
	formData.append("genres", genreId)

	const albumResponse = await axios(
		"/admin/album",
		defu(
			{
				method: "POST",
				data: formData,
			},
			defaults
		)
	)

	return albumResponse.data.response._id
}

async function searchYouTube(query: string): Promise<string | null> {
	/*ytmusic.search("Never gonna give you up").then((songs) => {
		console.log(songs)
	})

	if (songs.length == 0) return ""

	return `https://www.youtube.com/watch?v=${songs[0].youtubeId}`*/

	throw new Error("Not implemented")
}
