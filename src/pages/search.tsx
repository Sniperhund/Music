import PageTitle from "@/components/PageTitle"
import SearchResultCard, {
	SearchResultCardProps,
} from "@/components/SearchResultCard"
import useAPI from "@/util/useAPI"
import { Heading, Input, InputGroup, InputLeftElement } from "@chakra-ui/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useDebounce } from "use-debounce"
import { Search as SearchIcon } from "lucide-react"
import { useLocalStorage } from "usehooks-ts"

export default function Search() {
	const router = useRouter()

	const [debouncedSearch] = useDebounce(router.query.q, 300)

	const [searchResults, setSearchResults] = useState<any[]>([])
	const [recentlyPlayed, setRecentlyPlayed] = useLocalStorage<
		SearchResultCardProps | any
	>("recentlyPlayed", [])

	useEffect(() => {
		if (!debouncedSearch) {
			setSearchResults([])
			return
		}

		useAPI(`/search`, { params: { q: debouncedSearch, limit: 9 } })
			.then((result: any) => setSearchResults(result))
			.catch((err) => console.log(err))
	}, [debouncedSearch])

	const search = (e: any) => {
		if (e.target.value == router.query.q) return

		router.push(
			{ pathname: "/search", query: { q: e.target.value } },
			undefined,
			{ shallow: true },
		)
	}

	return (
		<>
			<PageTitle>Search</PageTitle>

			<InputGroup
				onChange={search}
				onFocus={search}
				className="md:!hidden w-full mb-4">
				<InputLeftElement pointerEvents="none">
					<SearchIcon />
				</InputLeftElement>
				<Input placeholder="Search..." value={router.query.q} />
			</InputGroup>

			{searchResults.length == 0 && (
				<Heading size="md" className="mb-2">
					Recently Searched
				</Heading>
			)}

			<section className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4">
				{searchResults.length > 0
					? searchResults.map((result, i) => {
							return (
								<SearchResultCard
									key={i}
									type={result.type}
									id={result._id}
									name={result.name}
									imageUrl={
										result.type == "track"
											? result.album.cover
											: result.cover
									}
									tracks={result.tracks}
									artists={result.artists}
								/>
							)
						})
					: recentlyPlayed.map(
							(result: SearchResultCardProps, i: number) => {
								return (
									<SearchResultCard
										key={i}
										type={result.type}
										id={result.id}
										name={result.name}
										imageUrl={result.imageUrl}
										tracks={result.tracks}
										artists={result.artists}
									/>
								)
							},
						)}
			</section>
		</>
	)
}
