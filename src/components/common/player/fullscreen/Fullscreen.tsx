import FullscreenContext from "@/contexts/FullscreenContext"
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import getFilePath from "@/util/getFilePath"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
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
import useAPI from "@/util/useAPI"
import ArtistName from "@/components/ArtistName"
import {
	Slider,
	SliderFilledTrack,
	SliderThumb,
	SliderTrack,
} from "@chakra-ui/react"
import parseLyrics from "@/util/lyricsUtil"
import LyricsDisplay from "./LyricsDisplay"

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

	function getSongAlbumUrl() {
		if (!getCurrentSong()) return ""

		return getFilePath("album", getCurrentSong().album.cover)
	}

	const imageRef = useRef<HTMLImageElement>(null)

	const [duration, setDuration] = useState(0)

	useEffect(() => {
		if (currentSong && duration != currentSong.durationInSeconds)
			setDuration(currentSong.durationInSeconds)

		if (!currentSong) {
			setShown(false)
		}
	}, [currentSong])

	const [secondsPlayed, setSecondsPlayedValue] = useState(0)
	const [movingSlider, setMovingSlider] = useState(false)

	useEffect(() => {
		const intervalId = setInterval(() => {
			if (!movingSlider) {
				setSecondsPlayedValue(getSecondsPlayed())
			}
		}, 500)

		return () => clearInterval(intervalId)
	}, [movingSlider, getSecondsPlayed])

	const [showScrollbar, setShowScrollbar] = useState(false)
	const [showCursor, setShowCursor] = useState(true)
	const [showX, setShowX] = useState(false)
	const [showLyrics, setShowLyrics] = useState(false)

	useEffect(() => {
		let timeoutId: NodeJS.Timeout

		window.addEventListener("mousemove", () => {
			setShowScrollbar(true)
			setShowCursor(true)
			setShowX(true)

			if (timeoutId) clearTimeout(timeoutId)
			timeoutId = setTimeout(() => {
				setShowScrollbar(false)
				setShowCursor(false)
				setShowX(false)
			}, 2000)
		})
	}, [])

	return (
		<section
			className={`fixed w-[200vw] h-[200vh] top-0 left-0 ${
				shown ? "opacity-100 z-[150]" : "opacity-0 -z-50"
			} ${showCursor ? "cursor-auto" : "cursor-none"}`}>
			{getCurrentSong() ? (
				<Image
					ref={imageRef}
					src={getSongAlbumUrl()}
					alt={getCurrentSong().name}
					className="absolute w-full h-full object-cover top-[-25%] left-[-25%] blur-2xl"
					width={500}
					height={500}
				/>
			) : (
				""
			)}

			<section className={styles.fullscreenContainer}>
				<X
					className={`absolute right-2 top-2 cursor-pointer transition-opacity ${showX ? "" : "opacity-0"}`}
					size={28}
					onClick={() => setShown(false)}
				/>

				<article className={showLyrics ? "" : styles.active}>
					<div className={`flex flex-col gap-4`}>
						{getCurrentSong() ? (
							<Image
								src={getSongAlbumUrl()}
								alt={getCurrentSong().name}
								className="rounded-lg"
								width={500}
								height={500}
								quality={100}
							/>
						) : (
							""
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
								onChangeStart={() => {
									setMovingSlider(true)
								}}
								onChange={(e) => {
									setSecondsPlayed(e)
									setSecondsPlayedValue(e)
								}}
								onChangeEnd={() => {
									setMovingSlider(false)
								}}>
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

						<article className="flex align-center justify-center gap-8">
							<Shuffle size={30} onClick={() => shuffle()} />
							<SkipBack size={30} onClick={() => prev()} />
							{isPlaying ? (
								<Pause
									size={30}
									onClick={() => {
										pause()
									}}
								/>
							) : (
								<Play
									size={30}
									onClick={() => {
										play()
									}}
								/>
							)}
							<SkipForward size={30} onClick={() => next()} />
							<Repeat
								size={30}
								onClick={() => toggleRepeat()}
								color={
									isRepeating
										? "rgb(144, 205, 244)"
										: "rgb(255, 255, 255)"
								}
							/>
						</article>
					</div>

					<LyricsDisplay
						showScrollbar={showScrollbar}
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
