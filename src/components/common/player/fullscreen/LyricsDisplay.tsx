import { useCallback, useEffect, useRef, useState } from "react"
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import styles from "./fullscreen.module.css"
import useAPI from "@/util/useAPI"
import parseLyrics from "@/util/lyricsUtil"

interface LyricsDisplayProps {
	showScrollbar: boolean
	showLyrics: boolean
	setShowLyrics: (show: boolean) => void
	animationDuration: number
	offset: number
}

export default function LyricsDisplay(props: LyricsDisplayProps) {
	const { getSecondsPlayed, setSecondsPlayed, currentSong } = useMusicPlayer()

	const [lyrics, setLyrics] = useState("")
	const [parsedLyrics, setParsedLyrics] = useState<any>([])
	const [syncedLyrics, setSyncedLyrics] = useState(false)

	const lyricsRef = useRef<HTMLParagraphElement>(null)
	const lyricsContainerRef = useRef<HTMLDivElement | null>(null)
	const heightRef = useRef<HTMLParagraphElement>(null)
	const scrolling = useRef(false)
	const translateY = useRef(0)
	const previousTranslateY = useRef(-1)
	const scrollingTimeout = useRef<NodeJS.Timeout>()

	useEffect(() => {
		if (!currentSong) {
			props.setShowLyrics(false)
			return
		}

		useAPI(`/tracks/${currentSong._id}/lyrics`)
			.then((result: any) => {
				if (result?.data?.status === "error") {
					props.setShowLyrics(false)
					return
				}

				setLyrics(result.lyrics)
				setSyncedLyrics(result.synced)

				if (result.synced) {
					setParsedLyrics(parseLyrics(result.lyrics))
				}

				props.setShowLyrics(true)
			})
			.catch((e) => {
				console.log(e)
				props.setShowLyrics(false)
			})

		if (lyricsRef.current) {
			lyricsRef.current.scrollTop = 0
		}
	}, [currentSong])

	let lastActiveIndex = -1 // Used to optimize the animation, so it doesn't update the value every 100ms

	const scrollToLyric = (lyric: any) => {
		if (lyricsContainerRef.current && lyric) {
			const activeIndex = parsedLyrics.indexOf(lyric) + 1

			if (activeIndex === lastActiveIndex) return

			lastActiveIndex = activeIndex

			for (const child of lyricsContainerRef.current.children) {
				child.classList.remove(styles.active)
			}

			const activeElement = lyricsContainerRef.current.children[
				activeIndex
			] as HTMLElement

			if (!activeElement) return

			activeElement.classList.add(styles.active)

			if (scrolling.current) return

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

			if (
				previousTranslateY.current ===
				Math.round(translateY.current + props.offset)
			)
				return

			previousTranslateY.current = Math.round(
				translateY.current + props.offset,
			)

			lyricsContainerRef.current.style.transform = `translateY(${Math.round(translateY.current + props.offset)}px)`
		}
	}

	useEffect(() => {
		const intervalId = setInterval(() => {
			const time = getSecondsPlayed() + props.animationDuration

			if (lyricsContainerRef.current && time < parsedLyrics[0].time) {
				for (const child of lyricsContainerRef.current.children) {
					child.classList.remove(styles.active)
				}

				const offsetHeight = heightRef.current?.offsetHeight ?? 0
				const scrollPosition = -0 * offsetHeight

				if (scrolling.current) return

				lyricsContainerRef.current.style.transform = `translateY(${scrollPosition + props.offset}px)`
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

				lyricsContainerRef.current!.style.transition = "none"

				let translateY = parseFloat(
					lyricsContainerRef.current!.style.transform.match(
						/-?\d+/,
					)?.[0] || "0",
				)
				translateY -= event.deltaY

				const maxTranslateY = props.offset
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
					lyricsContainerRef.current!.style.transition = `transform ${props.animationDuration}s ease`
				}, 3000)
			})
		}
	}, [])

	return (
		<>
			{props.showLyrics &&
				(syncedLyrics && parsedLyrics ? (
					<div
						className={`${styles.lyricsHeight} ${styles.syncedLyrics} ${!props.showScrollbar && styles.lyricsHeightWithNoButtons}`}>
						<div
							ref={lyricsContainer}
							style={{
								position: "absolute",
								transition: `transform ${props.animationDuration}s ease`,
								scrollbarWidth: "none",
								willChange: "transform",
							}}>
							<p ref={heightRef} style={{ opacity: 0 }}>
								A
							</p>
							{parsedLyrics.map((lyric: any, i: number) => {
								const words = lyric.text.split(" ")
								const formattedText =
									words.length > 1
										? [
												...words.slice(0, -2),
												words.slice(-2).join("\u00A0"),
											].join(" ")
										: lyric.text // Handle single-word lines

								return (
									<p
										key={i}
										onClick={() => {
											setSecondsPlayed(lyric.time)
											scrollToLyric(lyric)
										}}>
										{formattedText}
									</p>
								)
							})}
						</div>
					</div>
				) : (
					<div>
						<p
							className={`text-white ${styles.lyrics} ${styles.lyricsHeight} ${
								props.showScrollbar ? styles.show : ""
							}`}
							ref={lyricsRef}>
							{lyrics}
						</p>
					</div>
				))}
		</>
	)
}
