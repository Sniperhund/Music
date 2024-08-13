import getSpotifyToken from "@/util/server/getSpotifyToken"
import axios from "axios"
import type { NextApiRequest, NextApiResponse } from "next"

type ResponseData = {
	message?: String
	name?: string
	image?: string
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ResponseData>
) {
	const { id } = req.query

	const accessToken = await getSpotifyToken()

	if (!accessToken) {
		res.status(500).json({ message: "Failed to get Spotify access token" })
		return
	}

	const response = await axios
		.get(`https://api.spotify.com/v1/artists/${id}`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		})
		.then((response) => response.data)
		.catch((error) => error.response.data)

	if (response.error) {
		res.status(500).json({ message: response.error.message })
		return
	}

	res.status(200).json({ name: response.name, image: response.images[0].url })
}
