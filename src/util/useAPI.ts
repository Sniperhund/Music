import axios, { AxiosRequestConfig } from "axios"
import refreshToken from "./refreshToken"
import cookie from "@boiseitguru/cookie-cutter"
import defu from "defu"
import { getCookie } from "cookies-next"

async function useAPI<T>(
	url: string,
	options: AxiosRequestConfig = {}
): Promise<T> {
	let accessToken = getCookie("access_token")

	const defaults: AxiosRequestConfig = {
		baseURL: "https://api.lucasskt.dk/",
		headers: {
			Authorization: `${accessToken}`,
		},
	}

	const config: AxiosRequestConfig = defu(options, defaults)

	try {
		const response = await axios(url, config)
		return response.data
	} catch (error: any) {
		if (
			error.response &&
			(error.response.status === 406 || error.response.status === 401)
		) {
			try {
				await refreshToken()
				accessToken = getCookie("access_token")

				const newDefaults: AxiosRequestConfig = {
					baseURL: "https://api.lucasskt.dk/",
					headers: {
						Authorization: `${accessToken}`,
					},
				}

				const retryConfig: AxiosRequestConfig = defu(
					options,
					newDefaults
				)

				const retryResponse = await axios(url, retryConfig)
				return retryResponse.data
			} catch (retryError) {
				console.log("Token refresh failed:", retryError)
				throw retryError
			}
		} else {
			throw error
		}
	}
}

export default useAPI
