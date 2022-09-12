import {useEffect, useState} from 'react'
import {useDebouncedState} from '@mantine/hooks'

const EverypromptURL =
	process.env.NODE_ENV === 'production'
		? 'https://everyprompt-service.onrender.com'
		: 'http://localhost:9999'

export const runPrompt = async (
	fn: string,
	variables: Record<string, string>
) => {
	try {
		const epRes = await fetch(`${EverypromptURL}/prompt/izu/${fn}`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				user: 'testing',
				variables
			})
		})
		const epJSON = await epRes.json()
		return epJSON
	} catch (e) {
		return {success: false, error: -1}
	}
}

export const usePrompt = (fn: string) => {
	const [vars, setVars] = useState<Record<string, string>>()
	const [debouncedVars] = useDebouncedState(vars, 300)

	const [isLoading, setLoading] = useState(false)
	const [completion, setCompletion] = useState<string>()
	const [duration, setDuration] = useState<number>()
	const [error, setError] = useState<string>()

	useEffect(() => {
		const run = async () => {
			if (!vars) return
			setLoading(true)
			const promptJSON = await runPrompt(fn, vars)
			setLoading(false)
			setCompletion(undefined)
			setDuration(undefined)
			setError(undefined)

			if (!promptJSON.success && !promptJSON.response) {
				// Everyprompt Service Error
				setError(`EP Service Error ${promptJSON.error}`)
			} else if (promptJSON.response.object === 'error') {
				// Everyprompt Error
				setError(`EP Error: ${promptJSON.response.error}`)
			} else {
				// Success
				setCompletion(
					promptJSON.response.choices[0]?.text.trim() ??
						'No results found'
				)
				setDuration(promptJSON.response.duration)
			}
		}
		run()
	}, [debouncedVars, fn, vars])

	return {isLoading, completion, duration, error, runWithVariables: setVars}
}
