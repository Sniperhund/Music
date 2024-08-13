import axios from "axios"
import qs from "qs"

export default async function getSpotifyToken() {
	const data = qs.stringify({
		grant_type: "client_credentials",
		client_id: process.env.SPOTIFY_CLIENT_ID,
		client_secret: process.env.SPOTIFY_CLIENT_SECRET,
	})

	const response = await axios.post(
		"https://accounts.spotify.com/api/token",
		data,
		{
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		}
	)

	if (response.data.access_token) {
		return response.data.access_token
	}

	return ""
}
