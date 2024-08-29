import { Skeleton, SkeletonText, Stack } from "@chakra-ui/react"
import Image from "next/image"
import Link from "next/link"
import ArtistName from "../ArtistName"

interface CardProps {
	imageUrl?: string
	albumName?: string
	albumId?: string
	loading?: boolean
	artists?: { name: string; _id: string }[]
}

export default function Card(props: CardProps) {
	if (props.loading)
		return (
			<div>
				<Skeleton height="298px" width="256px" />
			</div>
		)

	return (
		<div className="text-sm justify-start flex flex-col max-w-64">
			<Link href={`/album/${props.albumId}`}>
				<img
					src={props.imageUrl}
					className="rounded-lg max-w-64 aspect-square"
					alt="Album cover image"
				/>
				<p className="mt-0.5">{props.albumName}</p>
			</Link>
			<ArtistName
				artists={props.artists}
				element="p"
				className="opacity-50"
			/>
		</div>
	)
}
