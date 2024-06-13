import AdminLayout from "@/components/layouts/Admin"
import { ReactElement } from "react"

export default function Artists() {
	return <>Admin DASHBOARD</>
}

Artists.getLayout = function getLayout(page: ReactElement) {
	return <AdminLayout>{page}</AdminLayout>
}
