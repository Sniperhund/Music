import { Heading } from "@chakra-ui/react"

export default function PageTitle({ children }: { children: React.ReactNode }) {
	return <Heading mb={8}>{children}</Heading>
}
