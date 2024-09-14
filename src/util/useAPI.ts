import axios, { AxiosRequestConfig } from "axios"
import refreshToken from "./refreshToken"
import defu from "defu"
import { getCookie } from "cookies-next"
import signout from "./signout"

async function useAPI<T>(
	url: string,
	options: AxiosRequestConfig = {}
): Promise<T> {
	let accessToken = getCookie("access_token")

	const defaults: AxiosRequestConfig = {
		baseURL: process.env.NEXT_PUBLIC_API_URL,
		headers: {
			Authorization: `${accessToken}`,
		},
	}

	const config: AxiosRequestConfig = defu(options, defaults)

	try {
		const result = await axios(url, config)

		if (result.data.status === "error") {
			throw new Error(result.data.message)
		}

		return result.data.response
	} catch (error: any) {
		if (
			error.response &&
			(error.response.status === 406 || error.response.status === 401)
		) {
			try {
				accessToken = await refreshToken()

				const newDefaults: AxiosRequestConfig = {
					baseURL: process.env.NEXT_PUBLIC_API_URL,
					headers: {
						Authorization: `${accessToken}`,
					},
				}

				const retryConfig: AxiosRequestConfig = defu(
					options,
					newDefaults
				)

				const retryResponse = await axios(url, retryConfig)
				return retryResponse.data.response
			} catch (retryError: any) {
				console.log("Token refresh failed:", retryError)
				signout()

				return retryError.response
			}
		} else {
			return error.response
		}
	}
}

export default useAPI
