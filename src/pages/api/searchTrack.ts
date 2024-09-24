import getSpotifyToken from "@/util/server/getSpotifyToken"
import axios from "axios"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { q } = req.query

	const accessToken = await getSpotifyToken()

	if (!accessToken) {
		res.status(500).json({ message: "Failed to get Spotify access token" })
		return
	}

	// Fetch tracks using the search query
	const response = await axios
		.get(`https://api.spotify.com/v1/search?q=${q}&type=track&limit=10`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		})
		.then((response) => response.data)
		.catch((error) => error.response.data)

	if (response.error) {
		res.status(500).json({ message: response.error.message })
		return
	}

	// Map through tracks and fetch additional artist info for genres
	const tracks = await Promise.all(
		response.tracks.items.map(async (track: any) => {
			let genre = "Unknown" // Default genre

			// Loop through artists and get the first genre found
			for (const artist of track.artists) {
				const artistResponse = await axios
					.get(`https://api.spotify.com/v1/artists/${artist.id}`, {
						headers: { Authorization: `Bearer ${accessToken}` },
					})
					.then((res) => res.data)
					.catch(() => null)

				if (
					artistResponse &&
					artistResponse.genres &&
					artistResponse.genres.length > 0
				) {
					genre =
						artistResponse.genres[0].charAt(0).toUpperCase() +
						artistResponse.genres[0].slice(1)
					break
				}
			}

			return {
				name: track.name,
				preview: track.preview_url,
				href: track.external_urls.spotify,
				id: track.id,
				album: {
					name: track.album.name,
					image: track.album.images[0]?.url,
					id: track.album.id,
				},
				artists: track.artists.map((artist: any) => ({
					name: artist.name,
					id: artist.id,
				})),
				genre,
			}
		})
	)

	res.status(200).json({ tracks })
}
