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
	useDisclosure,
	useToast,
} from "@chakra-ui/react"
import { useFormik } from "formik"
import { useRouter } from "next/router"
import { ReactElement, useEffect, useRef, useState } from "react"
import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
	AlertDialogCloseButton,
} from "@chakra-ui/react"

export default function Signup() {
	const toast = useToast()
	const router = useRouter()

	const { isOpen, onOpen, onClose } = useDisclosure()
	const cancelRef = useRef<HTMLButtonElement>(null)

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
				values.name,
			)

			if (result?.error) {
				toast({
					title: result?.result.response.data.message,
					status: "error",
					isClosable: true,
				})
				return
			}

			onOpen()
		},
	})

	const [forwardAddress, setForwardAddress] = useState<string | null>(null)

	useEffect(() => {
		setForwardAddress(router.query.href as string)
	}, [router.query.href])

	return (
		<>
			<Center className="h-screen">
				<Card maxW="lg" className="w-full">
					<CardHeader>
						<Heading size="lg" className="text-center">
							Create a new account!
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
						<Link href={`/auth/signin?href=${forwardAddress}`}>
							Sign in instead?
						</Link>
					</CardFooter>
				</Card>
			</Center>
			<AlertDialog
				isOpen={isOpen}
				onClose={onClose}
				leastDestructiveRef={cancelRef}>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							Verify
						</AlertDialogHeader>

						<AlertDialogBody>
							<p>
								An email has been sent to your email address.
								Please verify your email address to complete the
								signup process.
							</p>
							<p className="mt-2">
								If you don&apos;t see the email, please check
								your spam folder.
							</p>
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button
								onClick={() => {
									router.push("/auth/signin")
								}}
								ml={3}>
								Okay
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</>
	)
}

Signup.getLayout = function getLayout(page: ReactElement) {
	return page
}
