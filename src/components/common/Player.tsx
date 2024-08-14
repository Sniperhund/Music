import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import styles from "@/styles/player.module.css"
import trackStyles from "@/components/album/track.module.css"
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
import { useEffect, useRef, useState } from "react"
import { getCookie, setCookie } from "cookies-next"
import ArtistName from "../ArtistName"
import { ReactSortable } from "react-sortablejs"
import Track from "../album/Track"

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
		setQueue,
		getVolume,
		setVolume,
		currentSong,
	} = useMusicPlayer()

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
						<div className="truncate">
							<ArtistName
								artists={getSong().artists}
								element="p"
							/>{" "}
							― {getSong().album.name}
						</div>
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
							focusThumbOnChange={false}
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
							<p className="self-center my-auto text-white/50 text-sm">
								No upcoming songs.
							</p>
						) : (
							<>
								<ReactSortable
									list={getQueue()}
									setList={(newState) => setQueue(newState)}>
									{getQueue().map(
										(track: any, index: any) => (
											<article
												className={`${styles.track} rounded-lg flex gap-2 p-2 odd:bg-white/10`}>
												<img
													src={getFilePath(
														"album",
														track.album.cover
													)}
													alt="Cover Image"
													className="w-12 h-12 rounded-lg"
												/>
												<div>
													<p>{track.name}</p>
													<ArtistName
														artists={track.artists}
														element="p"
													/>
												</div>
											</article>
										)
									)}
								</ReactSortable>
							</>
						)}
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</>
	)
}
