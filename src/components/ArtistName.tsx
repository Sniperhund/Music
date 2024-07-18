import Link from "next/link"

export default function ArtistName(props: { artists: [any] }) {
	const prefix = (index: number) => {
		if (index > 0 && props.artists.length - 1 != index) {
			return <h2 className="whitespace-pre">, </h2>
		}
		if (props.artists.length - 1 == index && props.artists.length != 1) {
			return <h2 className="whitespace-pre"> and </h2>
		}
		return ""
	}

	return (
		<div className="flex flex-wrap">
			{props.artists.map((artist: any, index: number) => {
				return (
					<div className="flex" key={index}>
						{prefix(index)}
						<Link href={`/artist/${artist._id}`} className="inline">
							<h2>{artist.name}</h2>
						</Link>
					</div>
				)
			})}
		</div>
	)
}
