import axios from "axios"
import { deleteCookie, getCookie, setCookie } from "cookies-next"

let refreshPromise: Promise<any> | null = null
let waitForPromise: boolean = false

export default async function refreshToken() {
	if (waitForPromise) {
		for (let i = 0; i < 10; i++) {
			if (refreshPromise != null) {
				break
			}

			await new Promise((resolve) => setTimeout(resolve, 5))
		}
	}

	waitForPromise = true

	if (refreshPromise != null) {
		waitForPromise = false
		return refreshPromise
	}

	const refreshToken = getCookie("refresh_token")

	if (!refreshToken) {
		return null
	}

	refreshPromise = axios
		.post(`${process.env.NEXT_PUBLIC_API_URL}auth/refresh`, {
			refreshToken,
		})
		.then((result) => {
			const accessToken = result.data.response.accessToken
			setCookie("access_token", accessToken, {
				path: "/",
			})

			refreshPromise = null

			return accessToken
		})
		.catch((error) => {
			console.error("Token refresh failed:", error)
			refreshPromise = null
			deleteCookie("access_token")

			return null
		})

	return refreshPromise
}
