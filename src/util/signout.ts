import { deleteCookie } from "cookies-next"

export default function signout() {
	deleteCookie("access_token", { path: "/" })
	deleteCookie("refresh_token", { path: "/" })

	return true
}
