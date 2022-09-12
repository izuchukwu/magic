import {useEditor, EditorContent, BubbleMenu} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import React, {useEffect} from 'react'

type TipTapProps = {
	content: string
	onUpdate?: (html: string) => void
	style?: React.CSSProperties

	// To undo or redo, increment these
	undoFlag?: number
	redoFlag?: number

	onUndoableChange?: (undoable: boolean) => void
	onRedoableChange?: (undoable: boolean) => void
}

export const Tiptap = ({
	content,
	onUpdate,
	style,
	undoFlag,
	redoFlag
}: TipTapProps) => {
	const editor = useEditor({
		extensions: [StarterKit, Highlight, Link, Underline],
		content: content,
		autofocus: true,
		onUpdate: ({editor}) => {
			onUpdate?.(editor.getHTML())
		}
	})

	// Update content
	useEffect(() => {
		editor?.commands.setContent(content)
	}, [content, editor])

	// Undo
	useEffect(() => {
		editor?.commands.undo()
	}, [undoFlag, editor])

	// Redo
	useEffect(() => {
		editor?.commands.redo()
	}, [redoFlag, editor])

	return (
		<div className="TipTap" style={style}>
			{editor && (
				<BubbleMenu editor={editor} tippyOptions={{duration: 100}}>
					<button
						onClick={() =>
							editor.chain().focus().toggleBold().run()
						}
						className={editor.isActive('bold') ? 'is-active' : ''}
					>
						bold
					</button>
					<button
						onClick={() =>
							editor.chain().focus().toggleItalic().run()
						}
						className={editor.isActive('italic') ? 'is-active' : ''}
					>
						italic
					</button>
					<button
						onClick={() =>
							editor.chain().focus().toggleStrike().run()
						}
						className={editor.isActive('strike') ? 'is-active' : ''}
					>
						strike
					</button>
					<button
						onClick={() =>
							editor.chain().focus().toggleHighlight().run()
						}
						className={editor.isActive('strike') ? 'is-active' : ''}
					>
						highlight
					</button>
					<button
						onClick={() =>
							editor.chain().focus().toggleUnderline().run()
						}
						className={editor.isActive('strike') ? 'is-active' : ''}
					>
						underline
					</button>
				</BubbleMenu>
			)}
			<EditorContent editor={editor} />
		</div>
	)
}
