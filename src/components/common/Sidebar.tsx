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
	MenuIcon,
	MicVocal,
	Music,
	Search,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

interface SidebarProps {
	admin: boolean
}

export default function Sidebar(props: SidebarProps) {
	const router = useRouter()

	const [user, setUser] = useState<any>(null)

	useEffect(() => {
		async function fetchData() {
			const result = await useAPI("/user")

			setUser(result)
		}

		fetchData()
	}, [])

	const search = (e: any) => {
		router.push(
			{ pathname: "/search", query: { q: e.target.value } },
			undefined,
			{ shallow: true }
		)
	}

	if (!props.admin)
		return (
			<>
				<Text fontSize="2xl">Music</Text>

				<InputGroup onFocus={search} onChange={search}>
					<InputLeftElement pointerEvents="none">
						<Search />
					</InputLeftElement>
					<Input placeholder="Search..." value={router.query.q} />
				</InputGroup>
				<section className="flex flex-col">
					<Link href="/">
						<Button
							variant="ghost"
							justifyContent="left"
							w="full"
							leftIcon={<Home />}>
							Home
						</Button>
					</Link>
					<Link href="/browse">
						<Button
							variant="ghost"
							justifyContent="left"
							w="full"
							leftIcon={<Grid2X2 />}>
							Browse
						</Button>
					</Link>
				</section>
				<section className="flex flex-col">
					<span className="text-xs font-semibold">Library</span>
					<Link href="/library/artists">
						<Button
							variant="ghost"
							justifyContent="left"
							w="full"
							leftIcon={<MicVocal />}>
							Artists
						</Button>
					</Link>
					<Link href="/library/albums">
						<Button
							variant="ghost"
							justifyContent="left"
							w="full"
							leftIcon={<GalleryVerticalEnd />}>
							Albums
						</Button>
					</Link>
					<Link href="/library/songs">
						<Button
							variant="ghost"
							justifyContent="left"
							w="full"
							leftIcon={<Music />}>
							Songs
						</Button>
					</Link>
				</section>
				<section className="flex flex-col">
					<span className="text-xs font-semibold">Playlists</span>
					<Link href="#">
						<Button
							variant="ghost"
							justifyContent="left"
							w="full"
							leftIcon={<ListMusic />}>
							WIP
						</Button>
					</Link>
				</section>
				{user && user.role == "admin" ? (
					<section className="flex flex-col">
						<span className="text-xs font-semibold">Secrets</span>
						<Link href="/admin/dashboard">
							<Button
								variant="ghost"
								justifyContent="left"
								w="full"
								leftIcon={<FileSliders />}>
								Switch to admin panel
							</Button>
						</Link>
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

	return (
		<>
			<Text fontSize="2xl">Music - Admin Panel</Text>

			<section className="flex flex-col">
				<span className="text-xs font-semibold">Manage content</span>
				<Link href="/admin/manage/artists">
					<Button variant="ghost" justifyContent="left" w="full">
						Manage Artists
					</Button>
				</Link>
				<Link href="/admin/manage/genres">
					<Button variant="ghost" justifyContent="left" w="full">
						Manage Genres
					</Button>
				</Link>
				<Link href="/admin/manage/albums">
					<Button variant="ghost" justifyContent="left" w="full">
						Manage Albums
					</Button>
				</Link>
				<Link href="/admin/manage/tracks">
					<Button variant="ghost" justifyContent="left" w="full">
						Manage Tracks
					</Button>
				</Link>
			</section>
			<section className="flex flex-col">
				<span className="text-xs font-semibold">Library</span>
				<Link href="/admin/add/artist">
					<Button variant="ghost" justifyContent="left" w="full">
						Add new artist
					</Button>
				</Link>
				<Link href="/admin/add/genre">
					<Button variant="ghost" justifyContent="left" w="full">
						Add new genre
					</Button>
				</Link>
				<Link href="/admin/add/album">
					<Button variant="ghost" justifyContent="left" w="full">
						Add new album
					</Button>
				</Link>
				<Link href="/admin/add/track">
					<Button variant="ghost" justifyContent="left" w="full">
						Add new track
					</Button>
				</Link>
				<Link href="/admin/add/lyrics">
					<Button variant="ghost" justifyContent="left" w="full">
						Add new lyrics
					</Button>
				</Link>
			</section>

			<section className="flex flex-col">
				<span className="text-xs font-semibold">Exit</span>
				<Link href="/">
					<Button variant="ghost" justifyContent="left" w="full">
						Exit admin panel
					</Button>
				</Link>
			</section>

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
