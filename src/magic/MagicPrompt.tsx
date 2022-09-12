import {
	ActionIcon,
	Autocomplete,
	Box,
	Group,
	JsonInput,
	Loader,
	Paper,
	Stack,
	Textarea,
	Timeline,
	Text
} from '@mantine/core'
import {
	IconChevronRight,
	IconChevronDown,
	IconPencil,
	IconPlus,
	IconBrandTwitter
} from '@tabler/icons'
import {decode} from 'html-entities'
import {useState, useCallback, useEffect} from 'react'
import {Tiptap} from '../components/tiptap/Tiptap'
import {usePrompt} from '../hooks/everyprompt'

type MagicPromptProps = {
	index?: number
	lastCompletion?: string

	onAddPrompt?: () => void
	onCompletionSelect?: (completion: string) => void
}

export const MagicPrompt = ({
	index = 0,
	lastCompletion,
	onAddPrompt,
	onCompletionSelect
}: MagicPromptProps) => {
	const {completion, duration, error, isLoading, runWithVariables} =
		usePrompt('magic')
	const [prompt, setPrompt] = useState<string>()
	const [format, setFormat] = useState('Answer')
	const [result, setResult] = useState<string>()

	/** Updates prompt while typing */
	const onChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setPrompt(e.currentTarget.value)
		},
		[]
	)

	/** Asks EP the prompt */
	const onAsk = useCallback(() => {
		if (!prompt) return
		runWithVariables({
			prompt: promptForFormat(prompt, format, lastCompletion)
		})
	}, [prompt, runWithVariables, format, lastCompletion])

	/** Calls onAsk on Return */
	const onReturn = useCallback(
		(event: React.KeyboardEvent) => {
			// If Return is not held, return early
			if (event.key !== 'Enter') return

			// If there is no prompt, do not ask EP
			if (!prompt) {
				event.preventDefault()
				return
			}

			// If Shift is held, add a new line
			// If not, ask EP
			if (!event.shiftKey) {
				event.preventDefault()
				onAsk()
			}
		},
		[onAsk, prompt]
	)

	const [lastFormat, setLastFormat] = useState(format)
	/** Calls onAsk and clears the completion when prompt format is changed */
	useEffect(() => {
		if (format === lastFormat) return
		setLastFormat(format)
		setResult('')
		onAsk()
	}, [onAsk, format, lastFormat])

	/** Sets result when completion returns */
	useEffect(() => {
		const decodedCompletion = decode(completion)
		setResult(decodedCompletion)

		// Set selected completion
		onCompletionSelect?.(decodedCompletion)
	}, [completion, onCompletionSelect])

	return (
		<Stack justify="center" align="center">
			<Paper
				shadow="sm"
				withBorder
				sx={{
					borderColor: 'rgba(0, 0, 0, 0.16)',
					borderRadius: 13,
					padding: '5px 15px',
					isolation: 'isolate',
					zIndex: 99
				}}
				pl={15}
				pr={10}
			>
				<Group sx={{gap: 10}} align="top">
					<Box mt={13}>
						<IconChevronRight
							size={20}
							color="rgba(0, 0, 0, 0.5)"
						/>
					</Box>
					<Textarea
						autoFocus
						autosize={true}
						size="lg"
						sx={{width: 600}}
						placeholder={
							index
								? 'Ask for changes to the result, like "summarize this" or "expand on the first section"'
								: 'Ask Magic Anything'
						}
						variant="unstyled"
						onKeyDown={onReturn}
						onChange={onChange}
						value={prompt}
					/>
					<Box mt={13} pr={5}>
						<Loader
							size={20}
							color="green"
							sx={{
								visibility: isLoading ? 'visible' : 'hidden'
							}}
						/>
					</Box>
				</Group>
				<Group sx={{width: '100%'}} pb={5} position="right">
					<Autocomplete
						data={['Answer', 'Article', 'Tweet Thread', 'JSON']}
						filter={() => true}
						value={format}
						variant="filled"
						radius="md"
						size="xs"
						sx={{width: 150, cursor: 'pointer'}}
						onClick={(e) => e.currentTarget.select()}
						rightSection={
							<IconChevronDown size={15} opacity={0.5} />
						}
						styles={{
							rightSection: {pointerEvents: 'none'}
						}}
						icon={<IconPencil size={15} />}
						mt={10}
						onChange={setFormat}
						disabled={isLoading}
					/>
				</Group>
			</Paper>
			{result && (
				<Box sx={{width: 600, position: 'relative'}} mt={15}>
					{format === 'Article' && <Tiptap content={result} />}
					{format === 'Tweet Thread' && (
						<Timeline bulletSize={24} lineWidth={2}>
							{result
								.trim()
								.split('\n')
								.map((tweet, i) => (
									<Timeline.Item
										bullet={<IconBrandTwitter size={12} />}
										key={i}
									>
										<Text>{tweet}</Text>
									</Timeline.Item>
								))}
						</Timeline>
					)}
					{format === 'JSON' && (
						<JsonInput
							value={result}
							minRows={4}
							variant="unstyled"
							autosize
						/>
					)}
					{!['Article', 'Tweet Thread', 'JSON'].includes(format) && (
						<Text>{result}</Text>
					)}
				</Box>
			)}
			<ActionIcon
				mt={0}
				mb={15}
				variant="filled"
				radius="xl"
				size="sm"
				color="gray"
				className="showOnParentHover"
				sx={{
					zIndex: 199,
					marginTop: 20,
					['--parent-hover-opacity']: 0.65
				}}
				onClick={onAddPrompt}
			>
				<IconPlus />
			</ActionIcon>
		</Stack>
	)
}

/* -- Helpers -- */

const promptForFormat = (
	prompt: string,
	format: string,
	lastCompletion?: string
) => {
	// Add last completion
	const promptWithLastCompletion = lastCompletion
		? `Given the following content:\n${lastCompletion}\n\n${prompt}`
		: prompt

	// Remove final semicolon if present
	const promptWithoutFinalColon = promptWithLastCompletion.endsWith(':')
		? promptWithLastCompletion.slice(0, -1)
		: promptWithLastCompletion

	// Format
	switch (format) {
		case 'Article':
			return `${promptWithoutFinalColon}\nas an engaging in-depth article in HTML format with headers, sections on the most major topics, its subtopics, and bulleted lists, starting with an <h1> tag:`
		case 'Answer':
			return `${promptWithoutFinalColon}:`
		case 'Tweet Thread':
			return `${promptWithoutFinalColon}\nas a viral thread of tweets prefixed by their number in the series (for example, "1/" for the first tweet):`
		case 'JSON':
			return `${promptWithoutFinalColon}\nin perfect valid JSON format:`
		case '':
			return promptWithLastCompletion
		default:
			return `${promptWithoutFinalColon}\nas ${format}:`
	}
}
