import AdminLayout from "@/components/layouts/Admin"
import { ReactElement } from "react"

export default function Dashboard() {
	return <>Admin DASHBOARD</>
}

Dashboard.getLayout = function getLayout(page: ReactElement) {
	return <AdminLayout>{page}</AdminLayout>
}
