import axios from "axios"
import { getCookie, setCookie } from "cookies-next"

let isRefreshing: any = false
let refreshPromise: any = null

export default async function refreshToken() {
	if (isRefreshing) {
		// Return the existing promise to avoid multiple refreshes
		return refreshPromise
	}

	isRefreshing = true

	const refreshToken = getCookie("refresh_token")

	refreshPromise = axios
		.post(`${process.env.NEXT_PUBLIC_API_URL}auth/refresh`, {
			refreshToken: refreshToken,
		})
		.then((result) => {
			let expireTime = new Date().getTime() + 1000 * 3600 * 24 * 30 // 30 days

			const accessToken = result.data.response.accessToken
			setCookie("access_token", accessToken, {
				path: "/",
				expires: new Date(expireTime),
			})

			isRefreshing = false
			refreshPromise = null

			return accessToken
		})
		.catch((error) => {
			// Handle error, e.g., logging out user or redirecting to login
			console.error("Token refresh failed:", error)
			isRefreshing = false
			refreshPromise = null
			throw error
		})

	return refreshPromise
}
