export default function parseLyrics(lrc: any) {
	const regex = /^\[(\d{2}:\d{2}(.\d{2,3})?)\](.*)/
	const lines = lrc.split("\n")
	const output: { time: number; text: any }[] = []

	lines.forEach((line: any) => {
		const match = line.match(regex)
		if (match == null) return

		const time = match[1]
		const text = match[3]

		output.push({
			time: parseTime(time),
			text: text.trim(),
		})
	})

	function parseTime(time: any) {
		const minsec = time.split(":")
		const min = parseInt(minsec[0]) * 60
		const sec = parseFloat(minsec[1])
		return min + sec
	}

	return output
}
