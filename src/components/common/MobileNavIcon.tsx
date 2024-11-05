import Link from "next/link"

interface MobileNavIconProps {
	href: string
	icon: React.ReactNode
	label: string
}

export default function MobileNavIcon(props: MobileNavIconProps) {
	return (
		<Link className="flex flex-col items-center" href={props.href}>
			{props.icon}
			<p className="text-xs">{props.label}</p>
		</Link>
	)
}
