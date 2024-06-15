import { Button } from "@chakra-ui/react"
import Link from "next/link"
import { ReactElement } from "react"

export default function Custom404() {
	return (
		<section className="flex flex-col gap-8 justify-center items-center h-screen">
			<h1>404 - Page Not Found</h1>
			<Link href="/">
				<Button>Return to home</Button>
			</Link>
		</section>
	)
}

Custom404.getLayout = function getLayout(page: ReactElement) {
	return <>{page}</>
}
