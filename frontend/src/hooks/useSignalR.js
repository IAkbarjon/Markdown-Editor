import { useState, useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'
import { useNotification } from './useNotification'
import config from '../config/config'

/**
 * 
 * @param {number} documentId 
 * @returns 
 */
export const useSignalR = (documentId) => {
    const [content, setContent] = useState('')
    const [isConnected, setIsConnected] = useState(false)
    const [typingUser, setTypingUser] = useState(null)
    const connectionRef = useRef(null)

    const notification = useNotification()

    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${config.serverOrigin}/${config.mainHub}`)
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build()

        connection.on('ReceiveContent', (newContent) => {
            setContent(newContent)
        })

        connection.start()
            .then(res => {
                console.log(res)
                connectionRef.current = connection
                setIsConnected(true)
                connection.invoke('JoinDocument')
            })
            .catch(err => {
                console.error(err)
                notification.error(err)
            })

        return () => {
            connection.stop()
        }
    }, [])

    // Метод для обновления контента
    const updateContent = async (newContent) => {
        if (!connectionRef.current) return

        setContent(newContent)

        try {
            await connectionRef.current.invoke('UpdateContent', newContent)
        } catch (err) {
            console.error('Ошибка отправки:', err)
        }
    }

    // Метод для уведомления о печати
    const sendTyping = async (userName) => {
        if (!connectionRef.current) return

        try {
            await connectionRef.current.invoke('Typing', documentId, userName)
        } catch (err) {
            console.error('Ошибка отправки typing:', err)
        }
    }

    return { content, updateContent, sendTyping, isConnected, typingUser }
}