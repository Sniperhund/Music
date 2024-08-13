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

	const response = await axios
		.get(`https://api.spotify.com/v1/search?q=${q}&type=artist&limit=10`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		})
		.then((response) => response.data)
		.catch((error) => error.response.data)

	if (response.error) {
		res.status(500).json({ message: response.error.message })
		return
	}

	const artists = response.artists.items.map((artist: any) => ({
		name: artist.name,
		image: artist.images[0]?.url,
		id: artist.id,
	}))

	res.status(200).json({ artists })
}
