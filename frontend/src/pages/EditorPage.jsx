import { useCallback, useEffect, useState } from 'react'
import { useSignalR } from '../hooks/useSignalR'
import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'
import '@uiw/react-md-editor/markdown-editor.css'
import { useParams, useSearchParams } from 'react-router-dom'
import useUser from '../hooks/useUser'

function EditorPage({ userName }) {
    const [document, setDocument] = useState(undefined)
    const [isTyping, setIsTyping] = useState(false)

    const { user } = useUser()
    const [searchParams, setSearchParams] = useSearchParams()
    const { content, updateContent, sendTyping, isConnected, typingUser } = useSignalR(1)

    useEffect(() => {
        const id = searchParams.get('document')
        if (!id) {
            alert('Введите id')
        }

        const document = user.documents?.find(doc => doc.id == id)

        if (!document) {
            alert('Такого документа нет')
        }
        console.log('user docs:', user.documents)
        setDocument(document)
    }, [])

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
            className='h-screen w-screen flex flex-col items-center bg-white gap-4'
        >
            <div className="w-full">
                {document.title}
            </div>
            <MDEditor
                value={content}
                onChange={handleChange}
                // onKeyDown={handleKeyDown}
                fullscreen={false}
                previewOptions={{
                    rehypePlugins: [[rehypeSanitize]]
                }}
                height={'80%'}
                className='min-w-95/100'
            />
        </div>
    )
}

export { EditorPage, EditorPage as default }
