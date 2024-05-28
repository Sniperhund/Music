import axios from "axios"
import cookie from "@boiseitguru/cookie-cutter"

export default async function signin(email: string, password: string) {
	try {
		const result = await axios.post("https://api.lucasskt.dk/auth/login", {
			email: email,
			password: password,
		})

		if (result.status !== 200) {
			return {
				error: true,
				result: result,
			}
		}

		cookie.set("access_token", result.data.accessToken, { path: "/" })
		cookie.set("refresh_token", result.data.refreshToken, { path: "/" })
	} catch (error: any) {
		console.error(error)
		return {
			error: true,
			result: error.result ? error.result : error,
		}
	}
}
