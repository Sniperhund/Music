import FullscreenContext from "@/contexts/FullscreenContext"
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import getFilePath from "@/util/getFilePath"
import {
	use,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react"
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
import { setIn } from "formik"
import Songs from "@/pages/library/songs"

function parseLyrics(lrc: any) {
	const regex = /^\[(\d{2}:\d{2}(.\d{2})?)\](.*)/
	const lines = lrc.split("\n")
	const output: { time: number; text: any }[] = []

	lines.forEach((line: any) => {
		const match = line.match(regex)
		if (match == null) return

		const time = match[1]
		const text = match[3]

		output.push({
			time: parseTime(time),
			text: text.trim(),
		})
	})

	function parseTime(time: any) {
		const minsec = time.split(":")
		const min = parseInt(minsec[0]) * 60
		const sec = parseFloat(minsec[1])
		return min + sec
	}

	return output
}

const animationDuration = 0.4
const offset = 200

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

	const [lyrics, setLyrics] = useState("")
	const [parsedLyrics, setParsedLyrics] = useState<any>([])
	const [syncedLyrics, setSyncedLyrics] = useState(false)
	const [showLyrics, setShowLyrics] = useState(false)

	const lyricsRef = useRef<HTMLParagraphElement>(null)

	useEffect(() => {
		if (!currentSong) {
			setShown(false)
			return
		}

		useAPI(`/tracks/${currentSong._id}/lyrics`)
			.then((result: any) => {
				if (result?.data?.status == "error") {
					setShowLyrics(false)

					return
				}

				setLyrics(result.lyrics)
				setSyncedLyrics(result.synced)

				if (result.synced) {
					setParsedLyrics(parseLyrics(result.lyrics))
				}

				setShowLyrics(true)
			})
			.catch((e) => {
				console.log(e)
				setShowLyrics(false)
			})

		if (lyricsRef.current) {
			lyricsRef.current.scrollTop = 0
		}
	}, [currentSong])

	const scrolling = useRef(false)
	const translateY = useRef(0)

	const scrollToLyric = (lyric: any) => {
		if (lyricsContainerRef.current && lyric) {
			for (const child of lyricsContainerRef.current.children) {
				child.classList.remove(styles.active)
			}

			const activeIndex = parsedLyrics.indexOf(lyric) + 1
			const activeElement = lyricsContainerRef.current.children[
				activeIndex
			] as HTMLElement

			if (!activeElement) return

			activeElement.classList.add(styles.active)

			let accumulatedHeight = 0
			for (let i = 0; i < activeIndex; i++) {
				const lineElement = lyricsContainerRef.current.children[
					i
				] as HTMLElement
				if (lineElement) {
					accumulatedHeight +=
						lineElement.getBoundingClientRect().height
				}
			}

			translateY.current = -accumulatedHeight

			lyricsContainerRef.current.style.transform = `translateY(${translateY.current + offset}px)`
		}
	}

	const heightRef = useRef<HTMLParagraphElement>(null)

	useEffect(() => {
		const intervalId = setInterval(() => {
			if (scrolling.current) return

			const time = getSecondsPlayed() + animationDuration

			if (lyricsContainerRef.current && time < parsedLyrics[0].time) {
				for (const child of lyricsContainerRef.current.children) {
					child.classList.remove(styles.active)
				}

				// @ts-ignore
				const offsetHeight = heightRef.current.offsetHeight
				const scrollPosition = -0 * offsetHeight

				lyricsContainerRef.current.style.transform = `translateY(${scrollPosition + offset}px)`
				return
			}

			const lyric = parsedLyrics.find((lyric: any, i: number) => {
				return (
					lyric.time <= time &&
					(!parsedLyrics[i + 1] || parsedLyrics[i + 1].time > time)
				)
			})

			if (!lyric) return

			scrollToLyric(lyric)
		}, 100)

		return () => clearInterval(intervalId)
	}, [parsedLyrics])

	const lyricsContainerRef = useRef<HTMLDivElement | null>(null)
	const scrollingTimeout = useRef<NodeJS.Timeout>()

	const lyricsContainer = useCallback((node: any) => {
		if (node) {
			lyricsContainerRef.current = node
		}

		const lyricsContainerHeightRef: HTMLDivElement | null =
			document.querySelector(`.${styles.lyricsHeight}`)

		if (lyricsContainerRef.current && lyricsContainerHeightRef) {
			lyricsContainerRef.current.addEventListener("wheel", (event) => {
				scrolling.current = true

				clearTimeout(scrollingTimeout.current)

				// prettier-ignore
				// @ts-ignore
				let translateY = parseFloat(lyricsContainerRef.current!.style.transform.match(/-?\d+/,),) || 0
				translateY -= event.deltaY

				const maxTranslateY = offset
				const minTranslateY =
					-lyricsContainerRef.current!.scrollHeight +
					lyricsContainerHeightRef!.offsetHeight

				translateY = Math.min(
					maxTranslateY,
					Math.max(minTranslateY, translateY),
				)

				lyricsContainerRef.current!.style.transform = `translateY(${translateY}px)`

				scrollingTimeout.current = setTimeout(() => {
					scrolling.current = false
				}, 3000)
			})
		}
	}, [])

	const [duration, setDuration] = useState(0)

	useEffect(() => {
		if (currentSong && duration != currentSong.durationInSeconds)
			setDuration(currentSong.durationInSeconds)
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

	useEffect(() => {
		let timeoutId: NodeJS.Timeout

		window.addEventListener("mousemove", () => {
			setShowScrollbar(true)
			setShowCursor(true)

			if (timeoutId) clearTimeout(timeoutId)
			timeoutId = setTimeout(() => {
				setShowScrollbar(false)
				setShowCursor(false)
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
					className="absolute right-2 top-2 cursor-pointer"
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

					{showLyrics &&
						(syncedLyrics && parsedLyrics ? (
							<div
								className={`${styles.lyricsHeight} ${styles.syncedLyrics}`}>
								<div
									ref={lyricsContainer}
									style={{
										position: "absolute",
										transition: `transform ${animationDuration}s ease`,
										scrollbarWidth: "none",
									}}>
									<p ref={heightRef} style={{ opacity: 0 }}>
										A
									</p>
									{parsedLyrics.map(
										(lyric: any, i: number) => {
											return (
												<p
													key={i}
													onClick={() => {
														setSecondsPlayed(
															lyric.time,
														)
														scrollToLyric(lyric)
													}}>
													{lyric.text}
												</p>
											)
										},
									)}
								</div>
							</div>
						) : (
							<div>
								<p
									className={`text-white ${styles.lyrics} ${styles.lyricsHeight} ${
										showScrollbar ? styles.show : ""
									}`}
									ref={lyricsRef}>
									{lyrics}
								</p>
							</div>
						))}
				</article>
			</section>
		</section>
	)
}
