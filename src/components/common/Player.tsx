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
	Expand,
	List,
	Pause,
	Play,
	Repeat,
	Shuffle,
	SkipBack,
	SkipForward,
	Volume2,
} from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { getCookie, setCookie } from "cookies-next"
import ArtistName from "../ArtistName"

export default function Player() {
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
		getDuration,
		getSecondsPlayed,
		setSecondsPlayed,
		getQueue,
		getVolume,
		setVolume,
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

	const [volume, setVolumeValue] = useState(getVolume() * 100)
	const [movingVolumeSlider, setMovingVolumeSlider] = useState(false)

	useEffect(() => {
		const intervalId = setInterval(() => {
			if (!movingVolumeSlider) setVolumeValue(getVolume())
		}, 500)

		return () => clearInterval(intervalId)
	}, [movingVolumeSlider, getVolume])

	const { isOpen, onOpen, onClose } = useDisclosure()

	if (!getCurrentSong() && getQueue().length === 0) {
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
					<img
						className={styles.img}
						src={getFilePath("Album", getSong().album.cover)}
						alt="Album cover image"
					/>
					<div className="flex flex-col w-full truncate leading-snug">
						<p className="truncate">{getSong().name}</p>
						<p className="truncate">
							<ArtistName
								artists={getSong().artists}
								element="p"
							/>{" "}
							― {getSong().album.name}
						</p>
					</div>
				</article>

				<section className={styles.controls}>
					<article className={styles.playerSections}>
						<Shuffle onClick={() => shuffle()} />
						<SkipBack onClick={() => prev()} />
						{isPlaying ? (
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
						<Repeat
							onClick={() => toggleRepeat()}
							color={
								isRepeating
									? "rgb(144, 205, 244)"
									: "rgb(255, 255, 255)"
							}
						/>
					</article>
					<article className={styles.playerSections}>
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
								setCookie("secondsPlayed", e.toString())
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
					<div className="mx-auto max-w-36 w-full flex gap-2">
						<Volume2 />
						<Slider
							className="w-full"
							aria-label="slider-ex-1"
							max={1}
							step={0.01}
							value={volume}
							onChangeStart={() => {
								setMovingVolumeSlider(true)
							}}
							onChange={(e) => {
								setVolume(e)
								setVolumeValue(e)
								setCookie("volume", e.toString())
							}}
							onChangeEnd={() => {
								setMovingVolumeSlider(false)
							}}>
							<SliderTrack>
								<SliderFilledTrack />
							</SliderTrack>
							<SliderThumb />
						</Slider>
					</div>
					<List onClick={() => onOpen()} />
					<Expand />
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
							<>
								<h1 className="mb-4 text-2xl font-bold">
									This is still WIP
								</h1>
								{getQueue().map((song: any, index: any) => {
									return <p key={index}>{song.name}</p>
								})}
							</>
						)}
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</>
	)
}
