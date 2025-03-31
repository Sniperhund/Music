import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import { useLocalStorage } from "usehooks-ts"
import Image from "next/image"
import ArtistName from "@/components/ArtistName"
import { getSongAlbumUrl } from "@/util/misc"

export const TrackNameDisplay = (props: { mobile?: boolean }) => {
	const [onlyLyricsPreference] = useLocalStorage(
		"onlyLyricsPreference",
		false,
	)

    const { getCurrentSong } = useMusicPlayer()

	return (
		<>
			<div
				className={`flex gap-4 items-center ${props.mobile ? "mobile-flex" : "desktop-flex"}`}>
				{getCurrentSong() && onlyLyricsPreference && (
					<Image
						src={getSongAlbumUrl()}
						alt={getCurrentSong().name}
						className="rounded-lg"
						width={60}
						height={60}
						quality={100}
					/>
				)}
				<div>
					<p className="font-bold text-lg">{getCurrentSong().name}</p>
					<ArtistName
						artists={getCurrentSong().artists}
						element="p"
						className="text-lg"
					/>
				</div>
			</div>
		</>
	)
}
