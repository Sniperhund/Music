import axios from "axios"

export default async function signup(
	email: string,
	password: string,
	name: string
) {
	const origin =
		typeof window !== "undefined" && window.location.origin
			? window.location.origin
			: ""

	try {
		const result = await axios.post(
			"https://api.lucasskt.dk/auth/register",
			{
				email: email,
				password: password,
				name: name,
				frontendUrl: "http://" + origin + "/auth/verify",
			}
		)
	} catch (error: any) {
		console.error(error)
		return {
			error: true,
			result: error.result ? error.result : error,
		}
	}
}
