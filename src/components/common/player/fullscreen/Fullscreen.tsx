import { useCallback, useContext, useEffect, useRef, useState } from "react"
import FullscreenContext from "@/contexts/FullscreenContext"
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import getFilePath from "@/util/getFilePath"
import useAPI from "@/util/useAPI"
import parseLyrics from "@/util/lyricsUtil"
import ArtistName from "@/components/ArtistName"
import LyricsDisplay from "./LyricsDisplay"
import styles from "./fullscreen.module.css"
import Image from "next/image"
import {
	Pause,
	Play,
	Repeat,
	Shuffle,
	SkipBack,
	SkipForward,
	X,
} from "lucide-react"
import {
	Slider,
	SliderFilledTrack,
	SliderThumb,
	SliderTrack,
} from "@chakra-ui/react"
import { useLocalStorage } from "usehooks-ts"

export default function Fullscreen() {
	const { shown, setShown } = useContext(FullscreenContext)
	const {
		isPlaying,
		isRepeating,
		pause,
		play,
		prev,
		next,
		getCurrentSong,
		shuffle,
		toggleRepeat,
		getSecondsPlayed,
		setSecondsPlayed,
		currentSong,
	} = useMusicPlayer()

	const [fullscreenPreference] = useLocalStorage("fullscreenPreference", true)

	const [onlyLyricsPreference] = useLocalStorage(
		"onlyLyricsPreference",
		false,
	)

	const [duration, setDuration] = useState(0)
	const [secondsPlayed, setSecondsPlayedValue] = useState(0)
	const [movingSlider, setMovingSlider] = useState(false)
	const [showCursor, setShowCursor] = useState(true)
	const [mouseMoved, setMouseMoved] = useState(false)
	const [showLyrics, setShowLyrics] = useState(false)

	const imageRef = useRef<HTMLImageElement>(null)

	const getSongAlbumUrl = () => {
		const song = getCurrentSong()
		return song ? getFilePath("album", song.album.cover) : ""
	}

	useEffect(() => {
		if (currentSong) {
			if (duration !== currentSong.durationInSeconds) {
				setDuration(currentSong.durationInSeconds)
			}
		} else {
			setShown(false)
		}
	}, [currentSong, duration])

	useEffect(() => {
		const intervalId = setInterval(() => {
			if (!movingSlider) {
				setSecondsPlayedValue(getSecondsPlayed())
			}
		}, 500)

		return () => clearInterval(intervalId)
	}, [movingSlider, getSecondsPlayed])

	useEffect(() => {
		let timeoutId: NodeJS.Timeout

		window.addEventListener("mousemove", () => {
			setMouseMoved(true)
			setShowCursor(true)

			clearTimeout(timeoutId)
			timeoutId = setTimeout(() => {
				setMouseMoved(false)
				setShowCursor(false)
			}, 2000)
		})
	}, [])

	useEffect(() => {
		if (!fullscreenPreference) return

		if (shown) {
			document.body.requestFullscreen()
		} else if (document.fullscreenElement) {
			document.exitFullscreen()
		}
	}, [shown])

	return (
		<section
			className={`fixed w-[200vw] h-[200vh] top-0 left-0 ${
				shown ? "opacity-100 z-[150]" : "opacity-0 -z-50"
			} ${showCursor ? "cursor-auto" : "cursor-none"}`}>
			{getCurrentSong() && (
				<Image
					ref={imageRef}
					src={getSongAlbumUrl()}
					alt={getCurrentSong().name}
					className="absolute w-full h-full object-cover top-[-25%] left-[-25%] blur-2xl"
					width={500}
					height={500}
				/>
			)}

			<section
				className={` ${!onlyLyricsPreference && styles.onlyLyrics} ${styles.fullscreenContainer}`}>
				<X
					className={`absolute right-2 top-2 cursor-pointer transition-opacity ${!mouseMoved && "opacity-0"}`}
					size={28}
					onClick={() => setShown(false)}
				/>

				<article className={showLyrics ? "" : styles.active}>
					<div className="flex flex-col gap-4">
						{getCurrentSong() && !onlyLyricsPreference && (
							<Image
								src={getSongAlbumUrl()}
								alt={getCurrentSong().name}
								className="rounded-lg"
								width={500}
								height={500}
								quality={100}
							/>
						)}

						<div>
							<p className="font-bold text-lg">
								{getCurrentSong().name}
							</p>
							<ArtistName
								artists={getCurrentSong().artists}
								element="p"
								className="text-lg"
							/>
						</div>

						<article>
							<Slider
								colorScheme="gray"
								aria-label="slider-ex-1"
								max={duration}
								value={secondsPlayed}
								focusThumbOnChange={false}
								onChangeStart={() => setMovingSlider(true)}
								onChange={(value) => {
									setSecondsPlayed(value)
									setSecondsPlayedValue(value)
								}}
								onChangeEnd={() => setMovingSlider(false)}>
								<SliderTrack>
									<SliderFilledTrack />
								</SliderTrack>
								<SliderThumb />
							</Slider>
							<div className="flex justify-between opacity-50 text-xs">
								<p>
									{new Date(secondsPlayed * 1000)
										.toISOString()
										.slice(14, 19)}
								</p>
								<p>
									{new Date((duration - secondsPlayed) * 1000)
										.toISOString()
										.slice(14, 19)}
								</p>
							</div>
						</article>

						<article
							className={`flex align-center justify-center gap-8 max-h-[30px] transition-[max-height] ${!mouseMoved && styles.hideButtons}`}>
							<Shuffle size={30} onClick={shuffle} />
							<SkipBack size={30} onClick={prev} />
							{isPlaying ? (
								<Pause size={30} onClick={pause} />
							) : (
								<Play size={30} onClick={play} />
							)}
							<SkipForward size={30} onClick={next} />
							<Repeat
								size={30}
								onClick={toggleRepeat}
								color={
									isRepeating
										? "rgb(144, 205, 244)"
										: "rgb(255, 255, 255)"
								}
							/>
						</article>
					</div>

					<LyricsDisplay
						showScrollbar={mouseMoved}
						showLyrics={showLyrics}
						setShowLyrics={setShowLyrics}
						animationDuration={0.4}
						offset={200}
					/>
				</article>
			</section>
		</section>
	)
}
