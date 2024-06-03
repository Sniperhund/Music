import axios from "axios"
import { setCookie } from "cookies-next"

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

		const expireTime = new Date().getTime() + 1000 * 3600 * 60

		setCookie("access_token", result.data.accessToken, {
			path: "/",
			expires: new Date(expireTime),
		})
		setCookie("refresh_token", result.data.refreshToken, {
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
