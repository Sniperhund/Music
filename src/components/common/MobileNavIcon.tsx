interface MobileNavIconProps {
	href: string
	icon: React.ReactNode
	label: string
}

export default function MobileNavIcon(props: MobileNavIconProps) {
	return (
		<a className="flex flex-col items-center" href={props.href}>
			{props.icon}
			<p className="text-xs">{props.label}</p>
		</a>
	)
}
