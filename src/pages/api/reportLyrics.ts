import useAPI from "@/util/useAPI"
import axios, { AxiosRequestConfig } from "axios"
import type { NextApiRequest, NextApiResponse } from "next"
const { Webhook, MessageBuilder } = require("discord-webhook-node")

const hook = new Webhook(process.env.REPORT_WEBHOOK)

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method != "POST")
		return res.status(405).json({ message: "Invalid method" })

	try {
		const { trackId, issueType, message } = req.body
		const backendAccessToken = req.headers.authorization as string

		if (!backendAccessToken)
			return res.status(401).json({ message: "Unauthorized" })

		let result: any = await axios
			.get(`/tracks/${trackId}`, {
				baseURL: process.env.NEXT_PUBLIC_API_URL,
				headers: {
					Authorization: backendAccessToken,
				},
			})
			.catch((e: any) => {
				return res
					.status(500)
					.json({ message: "Internal server error" })
			})
		result = result.data.response

		const embed = new MessageBuilder()
			.setTitle("Report")
			.addField("Track Name", result.name)
			.addField(
				"Track Author",
				result.artists.map((a: any) => a.name).join(", "),
			)
			.addField("Issue Type", issueType)
			.addField("Message", message)
			.setFooter(`Track Id: ${trackId}`)
			.setTimestamp()

		hook.send(embed)

		res.status(200).json({ message: "Lyrics reported" })
	} catch (e) {
		res.status(500).json({ message: "Internal server error" })
	}
}
