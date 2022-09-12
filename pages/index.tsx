import type {NextPage} from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {Space, Stack, Text} from '@mantine/core'
import {EmojiFavi} from '../src/components/EmojiFavi'
import React, {useState} from 'react'
import {MagicPrompt} from '../src/magic/MagicPrompt'
import _ from 'lodash'
import {nanoid} from 'nanoid'
import Script from 'next/script'

const Home: NextPage = () => {
	const [prompts, setPrompts] = useState<
		{promptID: string; completion?: string}[]
	>([{promptID: nanoid()}])

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
			<Script
				async
				src="https://www.googletagmanager.com/gtag/js?id=G-Z0VGQP574V"
			></Script>
			<Script id="google-">
				{`window.dataLayer = window.dataLayer || [];
				function gtag(){dataLayer.push(arguments);}
				gtag('js', new Date());

				gtag('config', 'G-Z0VGQP574V');`}
			</Script>

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
							isolation: 'isolate',
							WebkitTransform: 'translate3d(0,0,0)',
							WebkitPerspective: '1000',
							WebkitBackfaceVisibility: 'hidden',
							WebkitTransformStyle: 'preserve-3d'
						}}
					>
						🧙
					</Text>
					{prompts.map((prompt, i) => (
						<MagicPrompt
							index={i}
							key={prompt.promptID}
							onAddPrompt={() => {
								prompts.splice(i + 1, 0, {promptID: nanoid()})
								setPrompts([...prompts])
							}}
							onCompletionSelect={(completion) => {
								prompts[i].completion = completion
								setPrompts([...prompts])
							}}
							lastCompletion={
								i > 0 ? prompts[i - 1].completion : undefined
							}
						/>
					))}
				</Stack>

				<Space sx={{height: '5vh'}} />
			</Stack>
		</div>
	)
}

export default Home
