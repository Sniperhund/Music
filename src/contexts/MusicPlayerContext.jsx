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
		}
	}

	internalPlay = (soundInstance) => {
		if (soundInstance && !soundInstance.playing()) soundInstance.play()
	}

	internalPause = (soundInstance) => {
		if (soundInstance) soundInstance.pause()
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
			html5PoolSize: 1,
		})

		this.setState({ sound: newSound })
		return newSound
	}

	isPlaying = () => {
		if (this.state.sound) return this.state.sound.playing()
		return false
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

		if (!nextSong && !this.state.repeat) return

		if (this.state.repeat && !nextSong) {
			this.setState((prevState) => ({
				currentQueue: [...prevState.currentQueue],
				currentSong: prevState.queue[0],
				queue: prevState.queue.slice(1),
			}))
		}

		if (this.state.sound) {
			this.state.sound.stop()
			this.setState({ sound: null })
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

	getCurrentSong = () => {
		if (this.isPlaying()) return this.state.currentSong
		return false
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
					getCurrentSong: this.getCurrentSong,
					addQueueItem: this.addQueueItem,
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
