import type { NextApiRequest, NextApiResponse } from "next"
import youtubeDl from "youtube-dl-exec"
import path from "path"
import fs from "fs"
import { exec } from "child_process"
import util from "util"

const execPromise = util.promisify(exec)

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
		// Define paths
		const tempAudioPath = path.join(process.cwd(), "temp_audio.m4a")
		const outputPath = path.join(process.cwd(), "audio.mp3")

		// Download the best audio quality in M4A format
		await youtubeDl(url as string, {
			output: tempAudioPath,
			extractAudio: true,
			audioFormat: "m4a",
			format: "bestaudio/best",
		})

		// Convert M4A to MP3 with high quality using FFmpeg
		await execPromise(`ffmpeg -i ${tempAudioPath} -b:a 320k ${outputPath}`)

		// Read the final audio file into a buffer
		const fileBuffer = fs.readFileSync(outputPath)

		// Send the audio file as a response
		res.setHeader("Content-Type", "audio/mpeg")
		res.setHeader("Content-Disposition", "attachment; filename=audio.mp3")
		res.send(fileBuffer)

		// Clean up temporary files
		fs.unlinkSync(tempAudioPath)
		fs.unlinkSync(outputPath)
	} catch (error) {
		console.error("Error processing audio:", error)
		res.status(500).json({ message: "Error processing audio" })
	}
}
