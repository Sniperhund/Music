import { ReactElement } from "react"

export default function Confirm() {
	return (
		<section className="flex items-center justify-center h-screen text-xl">
			<h1>Please verify your email</h1>
		</section>
	)
}

Confirm.getLayout = function getLayout(page: ReactElement) {
	return page
}
