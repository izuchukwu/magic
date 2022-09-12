type EmojiFaviProps = {
	emoji: string
}

export const EmojiFavi = ({emoji}: EmojiFaviProps) => (
	<link
		rel="icon"
		href={`data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text x=%22.05em%22 y=%22.84em%22 font-size=%22100%22>${emoji}</text></svg>`}
	/>
)
