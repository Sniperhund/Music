// contexts/MusicPlayerContext.js
import React, { createContext } from "react"
import { Howl } from "howler"
import getFilePath from "@/util/getFilePath"

const MusicPlayerContext = createContext()

class MusicPlayerProvider extends React.Component {
	constructor(props) {
		super(props)

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

	internalPlay = (soundInstance) => {
		if (soundInstance && !soundInstance.playing()) {
			soundInstance.play()
			this.setState({ isPlaying: true })
		}
	}

	internalPause = (soundInstance) => {
		if (soundInstance) {
			soundInstance.pause()
			this.setState({ isPlaying: false })
		}
	}

	createHowl = async (song) => {
		const { Howl } = await import("howler")

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
		return newSound
	}

	isPlaying = () => {
		/*if (this.state.sound) return this.state.sound.playing()
		return false*/

		return this.state.isPlaying
	}

	play = async () => {
		let newCurrentSong = this.state.currentSong
		if (!this.state.currentSong) {
			newCurrentSong = await this.next()
		}

		if (this.state.sound) {
			this.internalPlay(this.state.sound)
		} else if (newCurrentSong) {
			const newSound = await this.createHowl(newCurrentSong)
			this.internalPlay(newSound)
		}
	}

	pause = () => {
		this.internalPause(this.state.sound)
	}

	next = async () => {
		if (this.state.currentSong) {
			this.setState((prevState) => ({
				prevQueue: [prevState.currentSong, ...prevState.prevQueue],
			}))
		}

		const nextSong = this.state.queue[0]

		this.setState((prevState) => ({
			currentSong: nextSong,
			queue: prevState.queue.slice(1),
		}))

		if (this.state.sound) {
			this.state.sound.stop()
			this.setState({ sound: null })
		}

		if (nextSong) {
			const newSound = await this.createHowl(nextSong)
			this.internalPlay(newSound)
		}

		return nextSong
	}

	prev = async () => {
		const prevSong = this.state.prevQueue[0]
		this.setState((prevState) => ({
			prevQueue: prevState.prevQueue.slice(1),
		}))

		if (prevSong) {
			if (this.state.currentSong) {
				this.setState((prevState) => ({
					queue: [prevState.currentSong, ...prevState.queue],
				}))
			}
			this.setState({ currentSong: prevSong })

			if (this.state.sound) {
				this.state.sound.stop()
				this.setState({ sound: null })
			}

			const newSound = await this.createHowl(prevSong)
			this.internalPlay(newSound)
		}
	}

	clear = () => {
		this.setState({
			queue: [],
			currentSong: null,
		})
		if (this.state.sound) {
			this.state.sound.stop()
			this.setState({ sound: null })
		}
	}

	addQueueItem = (queueItem) => {
		this.setState((prevState) => ({
			queue: [...prevState.queue, queueItem],
			currentQueue: [...prevState.currentQueue, queueItem],
		}))
	}

	addQueueItemNext = (queueItem) => {
		this.setState((prevState) => ({
			queue: [queueItem, ...prevState.queue],
			currentQueue: [...prevState.currentQueue, queueItem],
		}))
	}

	removeQueueItem = (queueItem) => {
		const index = this.state.queue.indexOf(queueItem)
		if (index > -1) {
			this.setState((prevState) => ({
				queue: [
					...prevState.queue.slice(0, index),
					...prevState.queue.slice(index + 1),
				],
				currentQueue: [
					...prevState.currentQueue.slice(0, index),
					...prevState.currentQueue.slice(index + 1),
				],
			}))
		}
	}

	playAlbum = (album) => {
		this.clear()
		album.forEach((queueItem) => this.addQueueItem(queueItem))
		this.next()
	}

	playAlbumAtIndex = (album, index) => {
		this.clear()
		album.forEach((queueItem) => this.addQueueItem(queueItem))

		for (let i = 0; i <= index; i++) {
			this.next()
		}
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
					isPlaying: this.isPlaying,
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
