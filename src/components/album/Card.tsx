import { Skeleton, SkeletonText, Stack } from "@chakra-ui/react"
import Image from "next/image"
import Link from "next/link"

interface CardProps {
	imageUrl?: string
	albumName?: string
	artistName?: string
	artistId?: string
	albumId?: string
	loading?: boolean
}

export default function Card(props: CardProps) {
	if (props.loading)
		return (
			<div>
				<Skeleton height="298px" width="256px" />
			</div>
		)

	return (
		<Link
			href={`/album/${props.albumId}`}
			className="text-sm justify-start flex flex-col">
			<img
				src={props.imageUrl}
				className="rounded-lg max-w-64 aspect-square"
				alt="Album cover image"
			/>
			<p className="mt-0.5">{props.albumName}</p>
			{props.artistId ? (
				<Link className="opacity-50" href={`/artist/${props.artistId}`}>
					{props.artistName}
				</Link>
			) : (
				<p className="opacity-50">{props.artistName}</p>
			)}
		</Link>
	)
}
