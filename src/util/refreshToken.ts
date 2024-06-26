import axios from "axios"
import { getCookie, setCookie } from "cookies-next"

export default async function refreshToken() {
	const refreshToken = getCookie("refresh_token")

	const result = await axios.post(
		`${process.env.NEXT_PUBLIC_API_URL}auth/refresh`,
		{
			refreshToken: refreshToken,
		}
	)

	const expireTime = new Date().getTime() + 1000 * 3600 * 60

	const { accessToken } = result.data
	setCookie("access_token", accessToken, {
		path: "/",
		expires: new Date(expireTime),
	})
}
