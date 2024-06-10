import { ChevronLeft, ChevronRight } from "lucide-react"
import styles from "@/styles/slider.module.css"
import { ReactNode, useRef } from "react"
import Link from "next/link"

interface SliderProps {
	title: string
	href?: string | undefined
	children?: ReactNode
}

export default function Slider(props: SliderProps) {
	const slider = useRef<HTMLDivElement>(null)

	function scrollLeft(num: number) {
		if (slider.current) slider.current.scrollLeft += num
	}

	function left() {
		if (slider.current) scrollLeft(-slider.current.offsetWidth)
	}

	function right() {
		if (slider.current) scrollLeft(slider.current.offsetWidth)
	}

	return (
		<section className={styles.slider}>
			<Link
				href={props.href ? props.href : "#"}
				className={styles.categoryLink}>
				{props.title} {props.href ? <ChevronRight size="30" /> : ""}
			</Link>

			<section>
				<ChevronLeft
					size="48"
					className={styles.left}
					onClick={() => left()}
				/>
				<div ref={slider}>{props.children}</div>
				<ChevronRight
					size="48"
					className={styles.right}
					onClick={() => right()}
				/>
			</section>
		</section>
	)
}
