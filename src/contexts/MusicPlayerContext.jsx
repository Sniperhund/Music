// contexts/MusicPlayerContext.js
import React, { createContext } from "react"
import { Howl } from "howler"
import getFilePath from "@/util/getFilePath"
import { getCookie, hasCookie } from "cookies-next"

const MusicPlayerContext = createContext()

class MusicPlayerProvider extends React.Component {
	constructor(props) {
		super(props)

		this.internalState = {}

		this.state = {
			sound: null,
			queue: [],
			prevQueue: [],
			currentQueue: [],
			currentSong: null,
			repeat: false,
			isPlaying: false,
		}
	}

	componentDidMount() {
		navigator.mediaSession.setActionHandler("play", this.play)
		navigator.mediaSession.setActionHandler("pause", this.pause)
		navigator.mediaSession.setActionHandler("previoustrack", this.prev)
		navigator.mediaSession.setActionHandler("nexttrack", this.next)
		navigator.mediaSession.setActionHandler("seekto", (details) => {
			this.setSecondsPlayed(details.seekTime)
		})
		if (
			!/Android|webOS|iPhone|iPad|iPod|Opera Mini/i.test(
				navigator.userAgent,
			)
		) {
			navigator.mediaSession.setActionHandler("seekforward", () =>
				this.setSecondsPlayed(this.getSecondsPlayed() + 10),
			)
			navigator.mediaSession.setActionHandler("seekbackward", () =>
				this.setSecondsPlayed(this.getSecondsPlayed() - 10),
			)
		}
	}

	loadInternalState = () => {
		this.internalState = this.state
	}

	saveInternalState = () => {
		if (this.internalState != {}) this.setState(this.internalState)
		this.internalState = {}
	}

	updateMediaSession = async () => {
		if ("mediaSession" in navigator) {
			const { currentSong } = this.internalState

			if (!currentSong) return

			navigator.mediaSession.metadata = new MediaMetadata({
				title: currentSong.name,
				artist: currentSong.artists[0].name,
				album: currentSong.album.name,
				artwork: [
					{
						src: getFilePath("Album", currentSong.album.cover),
						sizes: "512x512",
					},
				],
			})

			navigator.mediaSession.setPositionState({
				duration: await this.getDuration(),
				position: this.getSecondsPlayed(),
			})
		} else {
			console.warn("Media Session API is not supported")
		}
	}

	internalNextCurrentSong = () => {
		if (this.internalState.currentSong) {
			this.internalState.prevQueue = [
				this.internalState.currentSong,
				...this.internalState.prevQueue,
			]
		}

		const nextSong = this.internalState.queue[0]

		this.internalState.currentSong = nextSong
		this.internalState.queue = this.internalState.queue.slice(1)
	}

	createHowl = async (song) => {
		const newSound = new Howl({
			src: [getFilePath("Track", song.audioFile)],
			html5: true,
			autoplay: false,
			volume: hasCookie("volume") ? getCookie("volume") : 0.5,
			onend: () => {
				this.next()
			},
			onstop: () => {
				this.setState({ isPlaying: false })
				navigator.mediaSession.playbackState = "none"
			},
			onplay: () => {
				this.setState({ isPlaying: true })
				navigator.mediaSession.playbackState = "playing"
			},
			onpause: () => {
				this.setState({ isPlaying: false })
				navigator.mediaSession.playbackState = "paused"
			},
		})

		this.setState({ sound: newSound })
		this.internalState.sound = newSound
		return newSound
	}

	internalPlay = async () => {
		let newCurrentSong = this.internalState.currentSong
		if (!newCurrentSong) {
			newCurrentSong = await this.next()
		}

		if (newCurrentSong && !this.internalState.sound) {
			let sound = await this.createHowl(newCurrentSong)
			this.internalState.sound = sound
		}

		if (this.internalState.sound && !this.internalState.sound.playing()) {
			this.internalState.sound.play()
			this.internalState.isPlaying = true
		}

		this.updateMediaSession()
	}

	play = async () => {
		this.loadInternalState()

		await this.internalPlay()

		this.saveInternalState()
	}

	internalPause = () => {
		this.internalState.sound.pause()
		this.internalState.isPlaying = false

		this.updateMediaSession()
	}

	pause = () => {
		this.loadInternalState()

		this.internalPause()

		this.saveInternalState()
	}

	internalNext = async () => {
		this.internalNextCurrentSong()

		if (this.internalState.sound) {
			this.internalState.sound.stop()
			this.internalState.sound = null
		}

		if (
			this.internalState.queue.length === 0 &&
			this.internalState.repeat &&
			!this.internalState.currentSong
		) {
			this.internalState.queue = [...this.internalState.currentQueue]
			this.internalNextCurrentSong()
		}

		if (this.internalState.currentSong) {
			this.internalPlay()
		}

		this.updateMediaSession()
	}

	next = async () => {
		this.loadInternalState()

		await this.internalNext()

		this.saveInternalState()
	}

	internalPrev = async () => {
		if (this.internalState.sound.seek() > 5) {
			this.internalState.sound.seek(0)
			return
		}

		const prevSong = this.internalState.prevQueue[0]
		this.internalState.prevQueue = this.internalState.prevQueue.slice(1)

		if (prevSong) {
			if (this.internalState.currentSong) {
				this.internalState.queue = [
					this.internalState.currentSong,
					...this.internalState.queue,
				]
			}
			this.internalState.currentSong = prevSong

			if (this.internalState.sound) {
				this.internalState.sound.stop()
				this.internalState.sound = null
			}

			const newSound = await this.createHowl(prevSong)
			this.internalPlay(newSound)
		}

		this.updateMediaSession()
	}

	prev = async () => {
		this.loadInternalState()

		await this.internalPrev()

		this.saveInternalState()
	}

	internalClear = () => {
		this.internalState.queue = []
		this.internalState.currentQueue = []
		this.internalState.currentSong = null
		if (this.internalState.sound) {
			this.internalState.sound.stop()
			this.internalState.sound = null
		}
	}

	clear = () => {
		this.loadInternalState()
		this.internalClear()
		this.saveInternalState()
	}

	internalAddQueueItem = (queueItem) => {
		this.internalState.queue = [...this.internalState.queue, queueItem]
		this.internalState.currentQueue = [
			...this.internalState.currentQueue,
			queueItem,
		]
	}

	addQueueItem = (queueItem) => {
		this.loadInternalState()
		this.internalAddQueueItem(queueItem)
		this.saveInternalState()
	}

	internalAddQueueItemNext = (queueItem) => {
		this.internalState.queue = [queueItem, ...this.internalState.queue]
		this.internalState.currentQueue = [
			queueItem,
			...this.internalState.currentQueue,
		]
	}

	addQueueItemNext = (queueItem) => {
		this.loadInternalState()
		this.internalAddQueueItemNext(queueItem)
		this.saveInternalState()
	}

	internalRemoveQueueItem = (queueItem) => {
		const index = this.internalState.queue.indexOf(queueItem)
		if (index > -1) {
			this.internalState.queue = [
				...this.internalState.queue.slice(0, index),
				...this.internalState.queue.slice(index + 1),
			]
			this.internalState.currentQueue = [
				...this.internalState.currentQueue.slice(0, index),
				...this.internalState.currentQueue.slice(index + 1),
			]
		}
	}

	removeQueueItem = (queueItem) => {
		this.loadInternalState()
		this.internalRemoveQueueItem(queueItem)
		this.saveInternalState()
	}

	internalPlayAlbum = async (album) => {
		this.internalClear()
		album.forEach((queueItem) => this.internalAddQueueItem(queueItem))

		this.internalNextCurrentSong()

		this.internalPlay()
	}

	playAlbum = async (album) => {
		this.loadInternalState()
		await this.internalPlayAlbum(album)
		this.saveInternalState()
	}

	internalPlayAlbumAtIndex = async (album, index) => {
		this.internalClear()
		album.forEach((queueItem) => this.internalAddQueueItem(queueItem))

		for (let i = 0; i < index + 1; i++) {
			this.internalNextCurrentSong()
		}

		this.internalPlay()
	}

	playAlbumAtIndex = async (album, index) => {
		this.loadInternalState()
		await this.internalPlayAlbumAtIndex(album, index)
		this.saveInternalState()
	}

	internalShuffle = () => {
		this.internalState.queue = this.internalState.queue.sort(
			() => Math.random() - 0.5,
		)
	}

	shuffle = () => {
		this.loadInternalState()

		this.internalShuffle()

		this.saveInternalState()
	}

	toggleRepeat = () => {
		this.setState((prevState) => ({
			repeat: !prevState.repeat,
		}))
	}

	getCurrentSong = () => {
		if (this.state.currentSong) return this.state.currentSong
		return false
	}

	getDuration = () => {
		return new Promise((resolve) => {
			if (this.state.sound) {
				if (this.state.sound.state() === "loaded") {
					resolve(this.state.sound.duration())
				} else {
					this.state.sound.once("load", () => {
						resolve(this.state.sound.duration())
					})
				}
			} else {
				resolve(0)
			}
		})
	}

	getSecondsPlayed = () => {
		if (this.state.sound) return this.state.sound.seek()
		return 0
	}

	setSecondsPlayed = (seconds) => {
		if (this.state.sound) this.state.sound.seek(seconds)
	}

	getQueue = () => {
		return this.state.queue
	}

	setQueue = (queue) => {
		this.setState({ queue })
	}

	getVolume = () => {
		if (this.state.sound) return this.state.sound.volume()
		return 0
	}

	setVolume = (volume) => {
		if (this.state.sound) this.state.sound.volume(volume)
	}

	render() {
		const { children } = this.props
		return (
			<MusicPlayerContext.Provider
				value={{
					isPlaying: this.state.isPlaying,
					isRepeating: this.state.repeat,
					currentSong: this.state.currentSong,
					play: this.play,
					pause: this.pause,
					next: this.next,
					prev: this.prev,
					clear: this.clear,
					addQueueItem: this.addQueueItem,
					addQueueItemNext: this.addQueueItemNext,
					removeQueueItem: this.removeQueueItem,
					playAlbum: this.playAlbum,
					playAlbumAtIndex: this.playAlbumAtIndex,
					shuffle: this.shuffle,
					toggleRepeat: this.toggleRepeat,
					getCurrentSong: this.getCurrentSong,
					getDuration: this.getDuration,
					getSecondsPlayed: this.getSecondsPlayed,
					setSecondsPlayed: this.setSecondsPlayed,
					getQueue: this.getQueue,
					setQueue: this.setQueue,
					getVolume: this.getVolume,
					setVolume: this.setVolume,
				}}>
				{children}
			</MusicPlayerContext.Provider>
		)
	}
}

export const useMusicPlayer = () => {
	const context = React.useContext(MusicPlayerContext)
	if (context === undefined) {
		throw new Error(
			"useMusicPlayer must be used within a MusicPlayerProvider",
		)
	}
	return context
}

export { MusicPlayerProvider, MusicPlayerContext }
