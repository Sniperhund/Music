import axios from "axios"
import qs from "qs"

// These variables will cache the token and its expiry time
let cachedToken: any = null
let tokenExpiry: any = null

async function getSpotifyToken() {
	const now = Date.now()

	// Check if the token is still valid
	if (cachedToken && tokenExpiry && now < tokenExpiry) {
		return cachedToken
	}

	// Prepare the request data
	const data = qs.stringify({
		grant_type: "client_credentials",
		client_id: process.env.SPOTIFY_CLIENT_ID,
		client_secret: process.env.SPOTIFY_CLIENT_SECRET,
	})

	try {
		// Request a new token from Spotify
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
			// Cache the new token and its expiry time
			cachedToken = response.data.access_token
			tokenExpiry = Date.now() + response.data.expires_in * 1000 // Convert expires_in to milliseconds

			return cachedToken
		} else {
			throw new Error("Failed to obtain access token")
		}
	} catch (error) {
		console.error("Error getting Spotify token:", error)
		throw error
	}
}

export default getSpotifyToken
