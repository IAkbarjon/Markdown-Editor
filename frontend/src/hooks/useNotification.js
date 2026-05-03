import { useCallback } from 'react'
import { useNotificationContext } from '../contexts/NotificationContext'

const useNotification = () => {
    const { showNotification } = useNotificationContext()

    const success = useCallback(/**
        * @param {string} message 
        * @param {string?} title 
        * @param {number?} duration 
        */
    (message, title, duration) => {
        showNotification('success', message, title, duration)
    }, [showNotification])

    const info = useCallback(/**
        * @param {string} message 
        * @param {string?} title 
        * @param {number?} duration 
        */
    (message, title, duration) => {
        showNotification('info', message, title, duration)
    }, [showNotification])

    const warning = useCallback(/**
        * @param {string} message 
        * @param {string?} title 
        * @param {number?} duration 
        */
    (message, title, duration) => {
        showNotification('warning', message, title, duration)
    }, [showNotification])

    const error = useCallback(/**
        * @param {string} message 
        * @param {string?} title 
        * @param {number?} duration 
        */
    (message, title, duration) => {
        showNotification('danger', message, title, duration)
    }, [showNotification])

    return {
        success,
        info,
        warning,
        error,
        show: showNotification
    }
}

export { useNotification, useNotification as default }
