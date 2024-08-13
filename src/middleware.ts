import { NextRequest, NextResponse } from "next/server"

export default function middleware(request: NextRequest) {
	if (
		request.nextUrl.pathname.startsWith("/_next/") ||
		request.nextUrl.pathname.startsWith("/api/")
	)
		return NextResponse.next()

	if (
		!request.nextUrl.pathname.startsWith("/auth/") &&
		!request.cookies.has("access_token")
	)
		return NextResponse.redirect(new URL("/auth/signin", request.url))

	return NextResponse.next()
}
