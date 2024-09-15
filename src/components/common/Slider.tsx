import { ChevronLeft, ChevronRight } from "lucide-react"
import styles from "@/styles/slider.module.css"
import { ReactNode, useEffect, useRef, useState } from "react"
import Link from "next/link"
import useResizeObserver from "use-resize-observer"

interface SliderProps {
	title: string
	href?: string | undefined
	children?: ReactNode
}

export default function Slider(props: SliderProps) {
	const slider = useRef<HTMLDivElement>(null)

	const [doesScroll, setDoesScroll] = useState(false)

	function scrollLeft(num: number) {
		if (slider.current) slider.current.scrollLeft += num
	}

	function left() {
		if (slider.current) scrollLeft(-slider.current.offsetWidth)
	}

	function right() {
		if (slider.current) scrollLeft(slider.current.offsetWidth)
	}

	useEffect(() => {
		computeIfScroll()

		const timeoutId = setTimeout(computeIfScroll, 1000)

		window.addEventListener("resize", computeIfScroll)

		return () => {
			clearTimeout(timeoutId)
			window.removeEventListener("resize", computeIfScroll)
		}
	}, [])

	useResizeObserver<HTMLDivElement>({
		ref: slider,
		onResize: ({ width, height }) => {
			computeIfScroll()
		},
	})

	function computeIfScroll() {
		if (!slider.current) return setDoesScroll(false)

		setDoesScroll(slider.current.scrollWidth > slider.current.offsetWidth)
	}

	return (
		<section className={styles.slider}>
			<Link
				href={props.href ? props.href : "#"}
				className={styles.categoryLink}>
				{props.title} {props.href ? <ChevronRight size="24" /> : ""}
			</Link>

			<section>
				{doesScroll ? (
					<ChevronLeft
						size="48"
						className={`${styles.left} desktop-block`}
						onClick={() => left()}
					/>
				) : (
					""
				)}
				<div ref={slider} className={styles.sliderContainer}>
					{props.children}
				</div>
				{doesScroll ? (
					<ChevronRight
						size="48"
						className={`${styles.right} desktop-block`}
						onClick={() => right()}
					/>
				) : (
					""
				)}
			</section>
		</section>
	)
}
