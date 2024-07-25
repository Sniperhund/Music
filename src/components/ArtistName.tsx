import Link from "next/link"
import React from "react"

export default function ArtistName(props: {
	artists: { name: string; _id: string }[]
	element: string
}) {
	const prefix = (index: number) => {
		if (index > 0 && props.artists.length - 1 != index) {
			return React.createElement(
				props.element,
				{ className: "whitespace-pre" },
				", "
			)
		}
		if (props.artists.length - 1 == index && props.artists.length != 1) {
			return React.createElement(
				props.element,
				{ className: "whitespace-pre" },
				" and "
			)
		}
		return ""
	}

	return (
		<div className="inline-flex flex-wrap">
			{props.artists.map((artist: any, index: number) => {
				return (
					<div className="flex" key={index}>
						{prefix(index)}
						<Link href={`/artist/${artist._id}`} className="inline">
							{React.createElement(
								props.element,
								null,
								artist.name
							)}
						</Link>
					</div>
				)
			})}
		</div>
	)
}
