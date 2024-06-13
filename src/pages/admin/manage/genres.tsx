import AdminLayout from "@/components/layouts/Admin"
import { ReactElement } from "react"

export default function Genres() {
	return <>Admin DASHBOARD</>
}

Genres.getLayout = function getLayout(page: ReactElement) {
	return <AdminLayout>{page}</AdminLayout>
}
