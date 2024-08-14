import axios from "axios"
import type { NextApiRequest, NextApiResponse } from "next"
import youtubeDl from "youtube-dl-exec"
import path from "path"
import fs from "fs"

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { url } = req.query

	if (!url) {
		res.status(400).json({ message: "No URL provided" })
		return
	}

	try {
		// Define the output path for the audio file
		const outputPath = path.join(process.cwd(), "audio.mp3")

		// Use youtube-dl-exec to download the audio as an MP3 file
		await youtubeDl(url as string, {
			output: outputPath,
			extractAudio: true,
			audioFormat: "mp3",
		}).catch((error) => {
			console.error("Error downloading audio:", error)
			res.status(500).json({ message: "Error downloading audio" })
		})

		// Read the audio file into a buffer
		const fileBuffer = fs.readFileSync(outputPath)

		// Send the audio file as a response
		res.setHeader("Content-Type", "audio/mpeg")
		res.setHeader("Content-Disposition", "attachment; filename=audio.mp3")
		res.send(fileBuffer)

		// Clean up by deleting the file after sending it
		fs.unlinkSync(outputPath)
	} catch (error) {
		console.error("Error downloading audio:", error)
		res.status(500).json({ message: "Error downloading audio" })
	}
}
