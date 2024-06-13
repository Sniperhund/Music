import { ReactNode, useRef, useState } from "react"
import {
	Button,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Icon,
	InputGroup,
} from "@chakra-ui/react"

type FileUploadProps = {
	accept?: string
	multiple?: boolean
	children?: ReactNode
	onFileSelected?: (file: File | null) => void
}

export default function FileUpload(props: FileUploadProps) {
	const { accept, multiple, children, onFileSelected } = props
	const inputRef = useRef<HTMLInputElement | null>(null)

	const handleClick = () => inputRef.current?.click()

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (onFileSelected) {
			onFileSelected(event.target.files ? event.target.files[0] : null)
		}
	}

	return (
		<InputGroup onClick={handleClick}>
			<input
				type={"file"}
				multiple={multiple || false}
				hidden
				accept={accept}
				onChange={handleFileChange}
				ref={(e) => {
					inputRef.current = e
				}}
			/>
			<>{children}</>
		</InputGroup>
	)
}
