import axios from "axios"
import { setCookie } from "cookies-next"
import { ExpandIcon } from "lucide-react"

export default async function signin(
	email: string,
	password: string,
	rememberMe: boolean = false,
) {
	try {
		const result = await axios.post(
			`${process.env.NEXT_PUBLIC_API_URL}auth/login`,
			{
				email: email,
				password: password,
			},
		)

		if (result.status !== 200) {
			return {
				error: true,
				result: result,
			}
		}

		let expireTime = new Date().getTime() + 1000 * 3600 * 24 * 30 // 30 days

		setCookie("access_token", result.data.response.accessToken, {
			path: "/",
			expires: rememberMe ? new Date(expireTime) : undefined,
		})
		setCookie("refresh_token", result.data.response.refreshToken, {
			path: "/",
			expires: rememberMe ? new Date(expireTime) : undefined,
		})
	} catch (error: any) {
		console.error(error)
		return {
			error: true,
			result: error.result ? error.result : error,
		}
	}
}
