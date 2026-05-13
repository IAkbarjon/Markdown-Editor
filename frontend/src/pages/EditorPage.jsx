import { useCallback, useState } from 'react'
import { useSignalR } from '../hooks/useSignalR'
import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'
import '@uiw/react-md-editor/markdown-editor.css'
import { useParams, useSearchParams } from 'react-router-dom'

function EditorPage({ userName }) {
    
    const { content, updateContent, sendTyping, isConnected, typingUser } = useSignalR(1)
    const [isTyping, setIsTyping] = useState(false)

    const handleChange = (newContent) => {
        updateContent(newContent)
    }

    const handleKeyDown = useCallback(() => {
        if (!isTyping) {
            setIsTyping(true)
            sendTyping(userName)
            setTimeout(() => setIsTyping(false), 1000)
        }
    }, [isTyping, sendTyping, userName])

    return (
        <div
            data-color-mode={'light'}
            className='h-screen w-screen'
        >
            <MDEditor
                value={content}
                onChange={handleChange}
                // onKeyDown={handleKeyDown}
                fullscreen={false}
                previewOptions={{
                    rehypePlugins: [[rehypeSanitize]]
                }}
                height={'100%'}
            />
        </div>
    )
}

export { EditorPage, EditorPage as default }
