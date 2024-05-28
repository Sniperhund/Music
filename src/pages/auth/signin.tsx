import signin from "@/util/signin"
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Center,
	Divider,
	FormControl,
	FormHelperText,
	FormLabel,
	Heading,
	Input,
	Link,
	useColorMode,
	useToast,
} from "@chakra-ui/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function Signin() {
	const toast = useToast()
	const router = useRouter()

	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")

	async function signIn() {
		const result = await signin(email, password)

		if (result?.error) {
			console.log(result?.result.response.data.message)
			toast({
				title: result?.result.response.data.message,
				status: "error",
				isClosable: true,
			})
			return
		}

		router.push("/")
	}

	return (
		<Center className="h-screen">
			<Card maxW="lg" className="w-full">
				<CardHeader>
					<Heading size="lg" className="text-center">
						Welcome back!
					</Heading>
				</CardHeader>
				<Divider opacity="0.2" />
				<CardBody className="flex flex-col gap-4">
					<FormControl>
						<FormLabel>Email address</FormLabel>
						<Input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</FormControl>

					<FormControl>
						<FormLabel>Password</FormLabel>
						<Input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</FormControl>

					<Button onClick={signIn}>Sign in</Button>
				</CardBody>
				<Divider opacity="0.2" />
				<CardFooter>
					<Link href="/auth/signup">Sign up instead?</Link>
				</CardFooter>
			</Card>
		</Center>
	)
}
