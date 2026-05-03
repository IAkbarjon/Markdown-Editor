import { createContext, useCallback, useContext, useState } from 'react'
import { Alert } from 'react-bootstrap'

const NotificationContext = createContext()

// Хук для доступа к контексту
const useNotificationContext = () => {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider')
    }
    return context
}

function NotificationProvider({ children, maxNotifications=3 }) {
    const [notifications, setNotifications] = useState([])

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id))
    }, [])

    const showNotification = useCallback((type, message, title, duration=5000) => {        
        const id = Date.now().toString()

        const newNotification = {
            id,
            type,
            message,
            title,
            duration
        }

        setNotifications(prev => {
            const updatedNotifications = [newNotification, ...prev]
            if (updatedNotifications.length > maxNotifications) {
                return updatedNotifications.slice(0, maxNotifications)
            }
            return updatedNotifications
        })

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id)
            }, duration)
        }
    }, [maxNotifications])

    // Функция для получения заголовка по умолчанию
    const getDefaultTitle = (type) => {
        switch (type) {
        case 'success': return 'Успешно'
        case 'info': return 'Информация'
        case 'warning': return 'Внимание'
        case 'danger': return 'Ошибка'
        default: return 'Уведомление'
        }
    }

    // Функция для получения варианта Alert
    const getAlertVariant = (type) => {
        switch (type) {
        case 'success': return 'success'
        case 'info': return 'info'
        case 'warning': return 'warning'
        case 'danger': return 'danger'
        default: return 'info'
        }
    }
    
    const value = {
        showNotification,
        removeNotification,
        notifications
    }
    
    return (    
        <NotificationContext.Provider value={value}>
            {children}

            <div className='fixed top-[20px] right-[20px] z-10 max-w-[350px] min-w-[250px] flex flex-col gap-[10px]'>
                {notifications.map(notification => (
                    <Alert
                        key={notification.id}
                        variant={getAlertVariant(notification.type)}
                        onClose={() => removeNotification(notification.id)}
                        dismissible
                        className='shadow-md shadow-[rgba(0,0,0,0.1)] animate-[slideIn 0.3s ease-out]'
                    >
                        <Alert.Heading className='text-[1.1rem mb-[8px]]'>
                            {notification.title || getDefaultTitle(notification.type)}
                        </Alert.Heading>
                        <p className='m-0 text-[0.95rem]'>
                            {notification.message}
                        </p>
                        {notification.duration && (
                            <div className='mt-[8px] h-[3px] bg-[rgba(255,255,255,0.3)] rounded-[2px] overflow-hidden'>
                                <div
                                    className='w-full h-full bg-white'
                                    style={{
                                        width: '100%',
                                        animation: `shrink ${notification.duration}ms linear forwards`
                                    }}
                                ></div>
                            </div>
                        )}
                    </Alert>
                ))}
            </div>

            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes shrink {
                    from {
                        width: 100%;
                    }
                    to {
                        width: 0%;
                    }
                }
                
                .alert {
                    transition: transform 0.3s ease, opacity 0.3s ease;
                }
            `}</style>
        </NotificationContext.Provider>
    )
}

export { NotificationContext, useNotificationContext, NotificationProvider, NotificationProvider as default }
