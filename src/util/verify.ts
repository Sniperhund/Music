import axios, { AxiosError, AxiosResponse } from "axios"
import { setCookie } from "cookies-next"

export default async function verify(verifyToken: string) {
	let result: AxiosResponse

	try {
		result = await axios.get(
			`https://api.lucasskt.dk/auth/verify?q=${verifyToken}`
		)
	} catch (error: unknown) {
		return error
	}

	const expireTime = new Date().getTime() + 1000 * 3600 * 60

	setCookie("access_token", result.data.accessToken, {
		path: "/",
		expires: new Date(expireTime),
	})
	setCookie("refresh_token", result.data.refreshToken, {
		path: "/",
		expires: new Date(expireTime),
	})

	return true
}
