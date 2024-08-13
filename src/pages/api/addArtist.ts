import getSpotifyToken from "@/util/server/getSpotifyToken"
import axios, { AxiosRequestConfig } from "axios"
import type { NextApiRequest, NextApiResponse } from "next"
import defu from "defu"

type ResponseData = {
	message?: string
	name?: string
	image?: string
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ResponseData>
) {
	const { id } = req.query

	const backendAccessToken = req.headers.authorization as string

	if (!backendAccessToken)
		return res.status(401).json({ message: "Unauthorized" })

	const spotifyAccessToken = await getSpotifyToken()

	if (!spotifyAccessToken) {
		res.status(500).json({ message: "Failed to get Spotify access token" })
		return
	}

	const response = await axios
		.get(`https://api.spotify.com/v1/artists/${id}`, {
			headers: { Authorization: `Bearer ${spotifyAccessToken}` },
		})
		.then((response) => response.data)
		.catch((error) => error.response.data)

	if (response.error) {
		res.status(500).json({ message: response.error.message })
		return
	}

	const artistName = response.name
	const coverImageUrl = response.images[0].url

	const imageResponse = await axios.get(coverImageUrl, {
		responseType: "arraybuffer",
	})
	const imageBuffer = Buffer.from(imageResponse.data, "binary")

	const formData = new FormData()
	formData.append("name", artistName)
	formData.append(
		"file",
		new Blob([imageBuffer], { type: "image/jpeg" }),
		`${artistName}.jpg`
	)

	const defaults: AxiosRequestConfig = {
		baseURL: process.env.NEXT_PUBLIC_API_URL,
		headers: {
			Authorization: `${backendAccessToken}`,
		},
	}

	const config: AxiosRequestConfig = defu(
		{
			method: "POST",
			data: formData,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		},
		defaults
	)

	const result: any = await axios("/admin/artist", config).catch((error) => {
		if (error.response) {
			console.error(error.response.data)
		}
	})

	if (result?.data?.status === "ok") {
		res.status(200).json(result?.data?.response)
	} else {
		res.status(500).json({
			message: "An error occurred while adding the artist",
		})
	}
}
