import {
	ActionIcon,
	Box,
	Group,
	JsonInput,
	Loader,
	Paper,
	Stack,
	Textarea,
	Timeline,
	Text,
	MediaQuery,
	Tooltip,
	NativeSelect,
	Divider,
	Center,
	Collapse,
	LoadingOverlay
} from '@mantine/core'
import {
	IconChevronRight,
	IconChevronDown,
	IconPencil,
	IconPlus,
	IconBrandTwitter,
	IconTrash
} from '@tabler/icons'
import {decode} from 'html-entities'
import _ from 'lodash'
import React, {
	useState,
	useCallback,
	useEffect,
	MutableRefObject,
	useRef
} from 'react'
import {Tiptap} from '../components/tiptap/Tiptap'
import {usePrompt} from '../hooks/everyprompt'

type MagicPromptProps = {
	index?: number
	lastCompletion?: string

	onAddPrompt?: () => void
	onCompletionSelect?: (completion: string) => void
	onDeletePrompt?: () => void
}

export const MagicPrompt = ({
	index = 0,
	lastCompletion,
	onAddPrompt,
	onCompletionSelect,
	onDeletePrompt
}: MagicPromptProps) => {
	const {completion, duration, error, isLoading, runWithVariables} =
		usePrompt('magic')
	const [prompt, setPrompt] = useState<string>()
	const [format, setFormat] = useState('Answer')
	const [result, setResult] = useState<string>()
	const fieldRef = useRef() as MutableRefObject<HTMLTextAreaElement>
	const paperRef = useRef() as MutableRefObject<HTMLDivElement>
	const [isFocused, setFocused] = useState(false)

	/** Asks EP the prompt */
	const onAsk = useCallback(
		(newFormat: string, deleteCurrentResult?: boolean) => {
			if (!prompt) return
			runWithVariables({
				prompt: promptForFormat(prompt, newFormat, lastCompletion)
			})
			if (deleteCurrentResult) setResult('')
		},
		[prompt, runWithVariables, lastCompletion]
	)

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
				onAsk(format)
			}
		},
		[format, onAsk, prompt]
	)

	/** Sets result when completion returns */
	useEffect(() => {
		const decodedCompletion = decode(completion)
		setResult(decodedCompletion)

		// Set selected completion
		onCompletionSelect?.(decodedCompletion)
	}, [completion, onCompletionSelect])

	return (
		<Stack
			justify="center"
			align="center"
			className="parent"
			sx={{gap: 0}}
			mt={index > 0 ? -10 : 0}
		>
			{index > 0 && (
				<Center>
					<Divider
						orientation="vertical"
						sx={{height: 25, opacity: 0.5}}
						size="md"
					/>
				</Center>
			)}
			<Paper
				shadow="sm"
				withBorder
				sx={{
					borderColor: 'rgba(0, 0, 0, 0.16)',
					borderRadius: 13,
					isolation: 'isolate'
				}}
			>
				<Stack sx={{padding: '5px 15px'}} pl={15} pr={10}>
					<Group sx={{gap: 10}} align="top">
						<Box mt={13}>
							<IconChevronRight
								size={20}
								color="rgba(0, 0, 0, 0.5)"
							/>
						</Box>
						<MediaQuery
							smallerThan={'sm'}
							styles={{width: 500, maxWidth: '70vw'}}
						>
							<Textarea
								autoFocus
								autosize={true}
								size="lg"
								sx={{width: 600}}
								placeholder={
									index
										? 'Ask for changes to the result, like "summarize this"'
										: 'Ask Magic Anything'
								}
								variant="unstyled"
								onKeyDown={onReturn}
								onChange={(e) =>
									setPrompt(e.currentTarget.value)
								}
								value={prompt}
								ref={fieldRef}
								onFocus={() => setFocused(true)}
								onBlur={() => setFocused(true)}
							/>
						</MediaQuery>
					</Group>
					<Group
						sx={{width: '100%'}}
						pb={5}
						position="right"
						align="center"
					>
						{index > 0 && (
							<MediaQuery
								query="(hover: none)"
								styles={{
									opacity:
										'var(--parent-hover-opacity) !important'
								}}
							>
								<ActionIcon
									mt={0}
									variant="subtle"
									radius="sm"
									size="sm"
									color="gray"
									sx={{
										zIndex: 199,
										marginTop: 20
									}}
									onClick={onDeletePrompt}
								>
									<IconTrash size={19} />
								</ActionIcon>
							</MediaQuery>
						)}
						<NativeSelect
							data={['Answer', 'Article', 'Tweet Thread', 'JSON']}
							value={format}
							variant="filled"
							radius="md"
							size="xs"
							sx={{width: 150, cursor: 'pointer'}}
							rightSection={
								<IconChevronDown size={15} opacity={0.5} />
							}
							styles={{
								rightSection: {pointerEvents: 'none'}
							}}
							icon={<IconPencil size={15} />}
							onChange={(e) => {
								const newFormat = e.currentTarget.value
								if (newFormat === format) return
								setFormat(newFormat)
								onAsk(newFormat, true)
							}}
							disabled={isLoading}
						/>
					</Group>
				</Stack>
				<Collapse
					in={!_.isEmpty(result) || isLoading}
					transitionDuration={250}
				>
					<ResultsSection
						result={result}
						format={format}
						isLoading={isLoading}
					/>
				</Collapse>
			</Paper>

			<Tooltip
				label={
					<Text align="center" sx={{lineHeight: 1.2}}>
						<b>Add another request</b>
						<br />
						{" that uses this one's results"}
					</Text>
				}
				position="bottom"
				radius="md"
				color="dark"
				sx={{fontSize: 12}}
				openDelay={250}
				transition="pop"
				offset={-10}
				withArrow
			>
				<Box>
					{/* This Box makes the tooltip work, because of the media query */}
					<MediaQuery
						query="(hover: none)"
						styles={{
							opacity: 'var(--parent-hover-opacity) !important'
						}}
					>
						<ActionIcon
							mt={-12}
							ml={'0.5px'}
							variant="filled"
							radius="xl"
							size="sm"
							color="gray"
							sx={{
								zIndex: 999
							}}
							onClick={onAddPrompt}
							className="showOnParentHover"
						>
							<IconPlus />
						</ActionIcon>
					</MediaQuery>
				</Box>
			</Tooltip>
		</Stack>
	)
}

/* -- Components -- */

type ResultsSectionProps = {
	result?: string
	format: string
	isLoading: boolean
}

const ResultsSection = ({result, format, isLoading}: ResultsSectionProps) => {
	return (
		<>
			<Divider orientation="horizontal" sx={{width: '100%'}} />
			<Box p={15} sx={{position: 'relative'}}>
				{isLoading && !result && (
					<Center>
						<Loader size={20} color="green" />
					</Center>
				)}
				{result && (
					<MediaQuery
						smallerThan={'sm'}
						styles={{width: 500, maxWidth: '70vw'}}
					>
						<Box sx={{position: 'relative', width: 600}} p={15}>
							{format === 'Answer' &&
								result
									.split('\n')
									.map((paragraph, i, paragraphs) => (
										<Text key={i} sx={{opacity: 0.8}}>
											{paragraph}
											{i < paragraphs.length - 1 && (
												<br />
											)}
										</Text>
									))}
							{format === 'Article' && (
								<Tiptap content={result} />
							)}
							{format === 'Tweet Thread' && (
								<Timeline bulletSize={24} lineWidth={2}>
									{result
										.trim()
										.split('\n')
										.map((tweet, i) => (
											<Timeline.Item
												bullet={
													<IconBrandTwitter
														size={12}
													/>
												}
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
							{![
								'Article',
								'Tweet Thread',
								'JSON',
								'Answer'
							].includes(format) && <Text>{result}</Text>}
							<LoadingOverlay
								visible={isLoading}
								transitionDuration={250}
								loaderProps={{size: 20, color: 'green'}}
							/>
						</Box>
					</MediaQuery>
				)}
			</Box>
		</>
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
