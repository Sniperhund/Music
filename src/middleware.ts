import { NextRequest, NextResponse } from "next/server"

function hasTokens(request: NextRequest) {
	return (
		request.cookies.has("access_token") &&
		request.cookies.has("refresh_token")
	)
}

export default function middleware(request: NextRequest) {
	if (
		request.nextUrl.pathname.startsWith("/_next/") ||
		request.nextUrl.pathname.startsWith("/api/")
	)
		return NextResponse.next()

	if (!request.nextUrl.pathname.startsWith("/auth/") && !hasTokens(request))
		return NextResponse.redirect(new URL("/auth/signin", request.url))

	if (request.nextUrl.pathname.startsWith("/auth/") && hasTokens(request))
		return NextResponse.redirect(new URL("/", request.url))

	return NextResponse.next()
}
