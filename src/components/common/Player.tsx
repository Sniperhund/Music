import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import styles from "@/styles/player.module.css"
import getFilePath from "@/util/getFilePath"
import {
	Button,
	Drawer,
	DrawerBody,
	DrawerCloseButton,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	Input,
	Slider,
	SliderFilledTrack,
	SliderThumb,
	SliderTrack,
	useDisclosure,
} from "@chakra-ui/react"
import {
	List,
	Pause,
	Play,
	Repeat,
	Shuffle,
	SkipBack,
	SkipForward,
} from "lucide-react"
import { useEffect, useState } from "react"

export default function Player() {
	const {
		isPlaying,
		pause,
		play,
		prev,
		next,
		getCurrentSong,
		shuffle,
		toggleRepeat,
		getDuration,
		getSecondsPlayed,
		setSecondsPlayed,
		getQueue,
	} = useMusicPlayer()

	const [duration, setDuration] = useState(0)

	useEffect(() => {
		async function fetchDuration() {
			setDuration(await getDuration())
		}

		fetchDuration()
	}, [getCurrentSong(), getDuration()])

	const [secondsPlayed, setSecondsPlayedValue] = useState(0)
	const [movingSlider, setMovingSlider] = useState(false)

	useEffect(() => {
		const intervalId = setInterval(() => {
			if (!movingSlider) setSecondsPlayedValue(getSecondsPlayed())
		}, 500)

		return () => clearInterval(intervalId)
	}, [movingSlider, getSecondsPlayed])

	const { isOpen, onOpen, onClose } = useDisclosure()

	if (getQueue().length === 0) {
		if (isOpen) onClose()

		return <></>
	}

	function getSong() {
		if (getCurrentSong()) return getCurrentSong()
		return getQueue()[0]
	}

	return (
		<>
			<section className={styles.player}>
				<article className={styles.trackInfo}>
					<img src={getFilePath("Album", getSong().album.cover)} />
					<div>
						<p>{getSong().name}</p>
						<p>
							{getSong().album.name} - {getSong().album.name}
						</p>
					</div>
				</article>

				<section className={styles.controls}>
					<article>
						<Shuffle onClick={() => shuffle()} />
						<SkipBack onClick={() => prev()} />
						{isPlaying() ? (
							<Pause
								onClick={() => {
									pause()
								}}
							/>
						) : (
							<Play
								onClick={() => {
									play()
								}}
							/>
						)}
						<SkipForward onClick={() => next()} />
						<Repeat onClick={() => toggleRepeat()} />
					</article>
					<article>
						<p>
							{new Date(secondsPlayed * 1000)
								.toISOString()
								.slice(14, 19)}
						</p>
						<Slider
							aria-label="slider-ex-1"
							max={duration}
							value={secondsPlayed}
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
						<p>
							{new Date((duration - secondsPlayed) * 1000)
								.toISOString()
								.slice(14, 19)}
						</p>
					</article>
				</section>

				<article className={styles.miscBtns}>
					<List onClick={() => onOpen()} />
				</article>
			</section>

			<Drawer isOpen={isOpen} placement="right" onClose={onClose}>
				<DrawerOverlay />
				<DrawerContent>
					<DrawerCloseButton />
					<DrawerHeader>Up Next</DrawerHeader>

					<DrawerBody className="flex flex-col">
						{getQueue().length === 0 ? (
							<p>No upcoming songs.</p>
						) : (
							<p>Yes</p>
						)}
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</>
	)
}
