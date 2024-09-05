import FullscreenContext from "@/contexts/FullscreenContext"
import Link from "next/link"
import React, { useContext } from "react"

export default function ArtistName(props: {
	artists: { name: string; _id: string }[] | undefined
	element: string
	className?: string
}) {
	if (
		!props.artists ||
		props.artists.length == 0 ||
		props.artists == undefined
	)
		return <></>

	const suffix = (index: number) => {
		if (index > 1) {
			return React.createElement(
				props.element,
				{ className: `!whitespace-pre ${props.className}` },
				", "
			)
		}
		return ""
	}

	const { shown, setShown } = useContext(FullscreenContext)

	if (!props.artists) {
		return <></>
	}

	return (
		<div className="inline-flex flex-wrap">
			{props.artists.map((artist: any, index: number) => (
				<div className="flex" key={index}>
					<Link
						href={`/artist/${artist._id}`}
						className="inline"
						onClick={() => setShown(false)}>
						{React.createElement(
							props.element,
							{ className: props.className },
							artist.name
						)}
					</Link>
					{suffix(props.artists ? props?.artists?.length - index : 0)}
				</div>
			))}
		</div>
	)
}
