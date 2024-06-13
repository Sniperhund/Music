import AdminLayout from "@/components/layouts/Admin"
import { ReactElement } from "react"

export default function Tracks() {
	return <>Admin DASHBOARD</>
}

Tracks.getLayout = function getLayout(page: ReactElement) {
	return <AdminLayout>{page}</AdminLayout>
}
