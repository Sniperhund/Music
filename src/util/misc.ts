import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import getFilePath from "./getFilePath"

export const getSongAlbumUrl = () => {
    const { getCurrentSong } = useMusicPlayer()
    const song = getCurrentSong()
    return song ? getFilePath("album", song.album.cover) : ""
}
