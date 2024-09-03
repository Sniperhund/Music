import axios from "axios"
import { setCookie } from "cookies-next"

export default async function signin(email: string, password: string) {
	try {
		const result = await axios.post(
			`${process.env.NEXT_PUBLIC_API_URL}auth/login`,
			{
				email: email,
				password: password,
			}
		)

		if (result.status !== 200) {
			return {
				error: true,
				result: result,
			}
		}

		const expireTime = new Date().getTime() + 1000 * 3600 * 24 * 30

		setCookie("access_token", result.data.response.accessToken, {
			path: "/",
			expires: new Date(expireTime),
		})
		setCookie("refresh_token", result.data.response.refreshToken, {
			path: "/",
			expires: new Date(expireTime),
		})
	} catch (error: any) {
		console.error(error)
		return {
			error: true,
			result: error.result ? error.result : error,
		}
	}
}
