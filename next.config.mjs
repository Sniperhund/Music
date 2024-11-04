import withSerwistInit from "@serwist/next"

const withSwerwist = withSerwistInit({
	swSrc: "/src/sw.ts",
	swDest: "/public/sw.js",
})

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	env: {
		NEXT_PUBLIC_API_URL: "https://api.lucasskt.dk/",
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "api.lucasskt.dk",
			},
			{
				protocol: "http",
				hostname: "localhost",
			},
		],
	},
}

export default nextConfig
