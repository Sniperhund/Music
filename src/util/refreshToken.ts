import cookie from "@boiseitguru/cookie-cutter"
import axios from "axios"

export default async function () {
	const refreshToken = cookie.get("refresh_token")

	const result = await axios.post("https://api.lucasskt.dk/auth/refresh", {
		refreshToken: refreshToken,
	})

	const { accessToken } = result.data
	cookie.set("access_token", accessToken, { path: "/" })
}
