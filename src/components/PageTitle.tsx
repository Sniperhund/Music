import signout from "@/util/signout"
import useAPI from "@/util/useAPI"
import {
	Avatar,
	Flex,
	Heading,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
} from "@chakra-ui/react"
import { LogOut } from "lucide-react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function PageTitle({ children }: { children: React.ReactNode }) {
	const router = useRouter()

	const [user, setUser] = useState<any>(null)

	useEffect(() => {
		async function fetchData() {
			const result = await useAPI("/user")

			setUser(result)
		}

		fetchData()
	}, [])

	return (
		<div className="flex justify-between items-center w-full mb-6">
			<Heading>{children}</Heading>

			{user &&
			window &&
			window.matchMedia("(max-width: 768px)").matches ? (
				<Menu>
					<MenuButton>
						<Avatar name={user.name} />
					</MenuButton>
					<MenuList>
						<MenuItem
							icon={<LogOut />}
							onClick={(e) => {
								if (signout()) router.push("/auth/signin")
							}}>
							Sign out
						</MenuItem>
					</MenuList>
				</Menu>
			) : (
				""
			)}
		</div>
	)
}
