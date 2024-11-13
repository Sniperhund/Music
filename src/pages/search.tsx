import PageTitle from "@/components/PageTitle"
import SearchResultCard from "@/components/SearchResultCard"
import useAPI from "@/util/useAPI"
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useDebounce } from "use-debounce"
import { Search as SearchIcon } from "lucide-react"

export default function Search() {
	const router = useRouter()

	const [debouncedSearch] = useDebounce(router.query.q, 300)

	const [searchResults, setSearchResults] = useState<any[]>([])

	useEffect(() => {
		if (!debouncedSearch) return

		useAPI(`/search`, { params: { q: debouncedSearch, limit: 9 } })
			.then((result: any) => setSearchResults(result))
			.catch((err) => console.log(err))
	}, [debouncedSearch])

	const search = (e: any) => {
		console.log(e.target.value, router.query.q)

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

			<section className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4">
				{searchResults
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
					: ""}
			</section>
		</>
	)
}
