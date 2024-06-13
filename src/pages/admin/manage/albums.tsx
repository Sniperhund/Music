import AdminLayout from "@/components/layouts/Admin"
import { ReactElement } from "react"

export default function Albums() {
	return <>Admin DASHBOARD</>
}

Albums.getLayout = function getLayout(page: ReactElement) {
	return <AdminLayout>{page}</AdminLayout>
}
