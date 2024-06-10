import Image from "next/image"
import Link from "next/link"

interface CardProps {
	imageUrl: string
	albumName: string
	artistName: string
	albumId: string
}

export default function Card(props: CardProps) {
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
			<p className="opacity-50">{props.artistName}</p>
		</Link>
	)
}
