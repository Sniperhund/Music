const backendUrl = "https://api.lucasskt.dk/"

export default function getFilePath(type: String, path: String) {
	switch (type) {
		case "album":
		case "Album":
			return `${backendUrl}albumCover/${path}`
		case "artist":
		case "Artist":
			return `${backendUrl}artistCover/${path}`
		case "track":
		case "Track":
		default:
			return `${backendUrl}track/${path}`
	}
}
