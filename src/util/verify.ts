import cookie from "@boiseitguru/cookie-cutter"
import axios, { AxiosError, AxiosResponse } from "axios"

export default async function (verifyToken: string) {
	let result: AxiosResponse

	try {
		result = await axios.get(
			`https://api.lucasskt.dk/auth/verify?q=${verifyToken}`
		)
	} catch (error: unknown) {
		return error.response.data
	}

	cookie.set("access_token", result.response.data.accessToken)
	cookie.set("refresh_token", result.response.data.refreshToken)

	return true
}
