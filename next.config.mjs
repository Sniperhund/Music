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
		],
	},
}

export default nextConfig
