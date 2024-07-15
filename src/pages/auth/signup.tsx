import signup from "@/util/signup"
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
	useToast,
} from "@chakra-ui/react"
import { useFormik } from "formik"
import { useRouter } from "next/router"
import { ReactElement } from "react"

export default function Signup() {
	const toast = useToast()
	const router = useRouter()

	const formik = useFormik({
		initialValues: {
			name: "",
			email: "",
			password: "",
		},
		onSubmit: async (values: {
			email: string
			password: string
			name: string
		}) => {
			const result = await signup(
				values.email,
				values.password,
				values.name
			)

			if (result?.error) {
				toast({
					title: result?.result.response.data.message,
					status: "error",
					isClosable: true,
				})
				return
			}

			router.push("/")
		},
	})

	return (
		<Center className="h-screen">
			<Card maxW="lg" className="w-full">
				<CardHeader>
					<Heading size="lg" className="text-center">
						Welcome back!
					</Heading>
				</CardHeader>
				<Divider opacity="0.2" />
				<CardBody>
					<form
						onSubmit={formik.handleSubmit}
						className="flex flex-col gap-4">
						<FormControl isRequired>
							<FormLabel>Full name</FormLabel>
							<Input
								name="name"
								type="text"
								value={formik.values.name}
								onChange={formik.handleChange}
							/>
						</FormControl>

						<FormControl isRequired>
							<FormLabel>Email address</FormLabel>
							<Input
								name="email"
								type="email"
								value={formik.values.email}
								onChange={formik.handleChange}
							/>
						</FormControl>

						<FormControl isRequired>
							<FormLabel>Password</FormLabel>
							<Input
								name="password"
								type="password"
								value={formik.values.password}
								onChange={formik.handleChange}
							/>
						</FormControl>

						<Button type="submit">Sign up</Button>
					</form>
				</CardBody>
				<Divider opacity="0.2" />
				<CardFooter>
					<Link href="/auth/signin">Sign in instead?</Link>
				</CardFooter>
			</Card>
		</Center>
	)
}

Signup.getLayout = function getLayout(page: ReactElement) {
	return page
}
