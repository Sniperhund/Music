import DefaultLayout from "@/components/layouts/Default"
import Slider from "@/components/common/Slider"
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"
import useAPI from "@/util/useAPI"
import { ReactElement, useEffect, useState } from "react"
import Card from "@/components/album/Card"
import AutomaticSlider from "@/components/common/AutomaticSlider"
import { Button } from "@chakra-ui/react"

export default function Home() {
	const { play } = useMusicPlayer()

	return (
		<>
			<AutomaticSlider />
		</>
	)
}
