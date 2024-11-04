import PageTitle from "@/components/PageTitle"
import SearchResultCard from "@/components/SearchResultCard"
import useAPI from "@/util/useAPI"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useDebounce } from "use-debounce"

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

	return (
		<>
			<PageTitle>Search</PageTitle>

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
