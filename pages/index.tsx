import type {NextPage} from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {
	ActionIcon,
	Autocomplete,
	Box,
	Group,
	JsonInput,
	Loader,
	Paper,
	Space,
	Stack,
	Text,
	Textarea,
	Timeline
} from '@mantine/core'
import {
	IconBrandTwitter,
	IconChevronDown,
	IconChevronRight,
	IconPencil,
	IconPlus
} from '@tabler/icons'
import {EmojiFavi} from '../src/components/EmojiFavi'
import {usePrompt} from '../src/hooks/everyprompt'
import React, {useCallback, useEffect, useState} from 'react'
import {Tiptap} from '../src/components/tiptap/Tiptap'
import {decode} from 'html-entities'

const promptForFormat = (prompt: string, format: string) => {
	const promptWithoutFinalColon = prompt.endsWith(':')
		? prompt.slice(0, -1)
		: prompt
	switch (format) {
		case 'Article':
			return `${promptWithoutFinalColon}\nas an essay in HTML format with headers, sections, subtopics, and bulleted lists:`
		case 'Answer':
			return `${promptWithoutFinalColon}:`
		case 'Tweet Thread':
			return `${promptWithoutFinalColon}\nas a viral thread of tweets prefixed by their number in the series (for example, "1/" for the first tweet):`
		case 'JSON':
			return `${promptWithoutFinalColon}\nin perfect valid JSON format:`
		case '':
			return prompt
		default:
			return `${promptWithoutFinalColon}\nas ${format}:`
	}
}

const Home: NextPage = () => {
	const {completion, duration, error, isLoading, runWithVariables} =
		usePrompt('magic')
	const [prompt, setPrompt] = useState<string>()
	const [format, setFormat] = useState('Answer')
	const [result, setResult] = useState<string>()

	/** Updates prompt while typing */
	const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setPrompt(e.currentTarget.value)
	}

	/** Asks EP the prompt */
	const onAsk = useCallback(() => {
		if (!prompt) return
		runWithVariables({prompt: promptForFormat(prompt, format)})
	}, [prompt, format, runWithVariables])

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
	}, [completion])

	return (
		<div className={styles.container}>
			<Head>
				<title>Magic</title>
				<meta
					name="description"
					content="Ask Magic anything. Write articles, code, and more in seconds."
				/>
				<EmojiFavi emoji="🧙" />
			</Head>

			<Stack
				sx={{
					width: '100vw',
					height: '100vh',
					gap: 0
				}}
				align="center"
				justify="start"
			>
				<Space sx={{height: '5vh'}} />
				<Stack sx={{gap: 0}} align="center" className="parent" mb={30}>
					<Text
						sx={{
							fontSize: 99,
							textAlign: 'center',
							zIndex: 999,
							isolation: 'isolate',
							['-webkit-transform']: 'translate3d(0,0,0)',
							['-webkit-perspective']: '1000',
							['-webkit-backface-visibility']: 'hidden',
							['-webkit-transform-style']: 'preserve-3d'
						}}
					>
						🧙
					</Text>
					<Paper
						shadow="sm"
						withBorder
						sx={{
							borderColor: 'rgba(0, 0, 0, 0.16)',
							borderRadius: 13,
							padding: '5px 15px',
							isolation: 'isolate',
							zIndex: 999
						}}
						mt={-27}
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
								placeholder="Ask Magic Anything"
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
										visibility: isLoading
											? 'visible'
											: 'hidden'
									}}
								/>
							</Box>
						</Group>
						<Group sx={{width: '100%'}} pb={5} position="right">
							<Autocomplete
								data={[
									'Answer',
									'Article',
									'Tweet Thread',
									'JSON'
								]}
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
							/>
						</Group>
					</Paper>
				</Stack>
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
											bullet={
												<IconBrandTwitter size={12} />
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
						{!['Article', 'Tweet Thread', 'JSON'].includes(
							format
						) && <Text>{result}</Text>}
					</Box>
				)}
				<Space sx={{height: '5vh'}} />
			</Stack>
		</div>
	)
}

const PromptField = () => {}

export default Home
