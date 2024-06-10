// contexts/MusicPlayerContext.js
import React, { createContext } from "react"
import { Howl } from "howler"
import getFilePath from "@/util/getFilePath"

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

	loadInternalState = () => {
		this.internalState = this.state
	}

	saveInternalState = () => {
		if (this.internalState != {}) this.setState(this.internalState)
		this.internalState = {}
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
			onend: () => {
				this.next()
			},
			onstop: () => {
				this.setState({ isPlaying: false })
			},
			onplay: () => {
				this.setState({ isPlaying: true })
			},
			onpause: () => {
				this.setState({ isPlaying: false })
			},
			html5PoolSize: 1,
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
	}

	play = async () => {
		this.loadInternalState()

		await this.internalPlay()

		this.saveInternalState()
	}

	internalPause = () => {
		this.internalState.sound.pause()
		this.internalState.isPlaying = false
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
	}

	next = async () => {
		this.loadInternalState()

		await this.internalNext()

		this.saveInternalState()
	}

	internalPrev = async () => {
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

	shuffle = () => {
		const shuffledQueue = this.state.queue.sort(() => Math.random() - 0.5)
		this.setState({ queue: shuffledQueue })
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

	render() {
		const { children } = this.props
		return (
			<MusicPlayerContext.Provider
				value={{
					isPlaying: this.state.isPlaying,
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
			"useMusicPlayer must be used within a MusicPlayerProvider"
		)
	}
	return context
}

export { MusicPlayerProvider, MusicPlayerContext }
