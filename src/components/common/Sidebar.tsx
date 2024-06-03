import signout from "@/util/signout"
import useAPI from "@/util/useAPI"
import {
	Avatar,
	Button,
	Flex,
	Input,
	InputGroup,
	InputLeftElement,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Text,
} from "@chakra-ui/react"
import {
	Clock,
	FileSliders,
	GalleryVerticalEnd,
	Grid2X2,
	Home,
	ListMusic,
	LogOut,
	MicVocal,
	Music,
	Search,
} from "lucide-react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function Sidebar() {
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
		<>
			<Text fontSize="2xl">Music</Text>

			<InputGroup>
				<InputLeftElement pointerEvents="none">
					<Search />
				</InputLeftElement>
				<Input placeholder="Search..." />
			</InputGroup>
			<section className="flex flex-col">
				<Button
					variant="ghost"
					justifyContent="left"
					as="a"
					href="/"
					leftIcon={<Home />}>
					Home
				</Button>
				<Button
					variant="ghost"
					justifyContent="left"
					as="a"
					href="/browse"
					leftIcon={<Grid2X2 />}>
					Browse
				</Button>
			</section>
			<section className="flex flex-col">
				<span className="text-xs font-semibold">Library</span>
				<Button
					variant="ghost"
					justifyContent="left"
					as="a"
					href="/library/recently-added"
					leftIcon={<Clock />}>
					Recently Added
				</Button>
				<Button
					variant="ghost"
					justifyContent="left"
					as="a"
					href="/library/artists"
					leftIcon={<MicVocal />}>
					Artists
				</Button>
				<Button
					variant="ghost"
					justifyContent="left"
					as="a"
					href="/library/albums"
					leftIcon={<GalleryVerticalEnd />}>
					Albums
				</Button>
				<Button
					variant="ghost"
					justifyContent="left"
					as="a"
					href="/library/songs"
					leftIcon={<Music />}>
					Songs
				</Button>
			</section>
			<section className="flex flex-col">
				<span className="text-xs font-semibold">Playlists</span>
				<Button
					variant="ghost"
					justifyContent="left"
					as="a"
					href="#"
					leftIcon={<ListMusic />}>
					WIP
				</Button>
			</section>
			{user && user.role == "admin" ? (
				<section className="flex flex-col">
					<span className="text-xs font-semibold">Secrets</span>
					<Button
						variant="ghost"
						justifyContent="left"
						as="a"
						href="/admin/dashboard"
						leftIcon={<FileSliders />}>
						Switch to admin panel
					</Button>
				</section>
			) : (
				""
			)}

			{user ? (
				<Menu>
					<MenuButton mt="auto">
						<Flex alignItems="center" gap="4">
							<Avatar name={user.name} />
							<Text fontSize="lg">{user.name}</Text>
						</Flex>
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
		</>
	)
}
