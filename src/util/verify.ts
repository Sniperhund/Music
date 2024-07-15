import axios, { AxiosError, AxiosResponse } from "axios"
import { setCookie } from "cookies-next"

export default async function verify(verifyToken: string) {
	let result: AxiosResponse

	try {
		result = await axios.get(
			`${process.env.NEXT_PUBLIC_API_URL}auth/verify?q=${verifyToken}`
		)
	} catch (error: any) {
		return error.response.data
	}

	const expireTime = new Date().getTime() + 1000 * 3600 * 60

	setCookie("access_token", result.data.response.accessToken, {
		path: "/",
		expires: new Date(expireTime),
	})
	setCookie("refresh_token", result.data.response.refreshToken, {
		path: "/",
		expires: new Date(expireTime),
	})

	return true
}
