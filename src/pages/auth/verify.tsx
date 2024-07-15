import verify from "@/util/verify"
import { useRouter } from "next/router"
import { ReactElement, useEffect, useState } from "react"

export default function Verify() {
	const router = useRouter()

	const [responseMessage, setResponseMessage] = useState("")

	useEffect(() => {
		async function verifyUser() {
			let response: any
			if (router.query.q)
				response = await verify(router.query.q as string)

			setResponseMessage(response?.message)
		}

		verifyUser()
	}, [router.query.q])

	if (responseMessage)
		return (
			<section className="flex flex-col items-center justify-center h-screen text-xl">
				<h1 className="text-2xl">Error</h1>
				<h2>{responseMessage ? responseMessage.toString() : ""}</h2>
			</section>
		)

	return (
		<section className="flex items-center justify-center h-screen text-xl">
			<h1>Verifying...</h1>
		</section>
	)
}

Verify.getLayout = function getLayout(page: ReactElement) {
	return page
}
