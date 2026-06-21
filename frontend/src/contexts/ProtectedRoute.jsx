import { createContext, useEffect, useState } from 'react'
import httpService from '../services/httpService'
import { Outlet, useNavigate } from 'react-router-dom'
import useNotification from '../hooks/useNotification'
import LoadingPage from '../pages/LoadingPage'

const UserContext = createContext()

function ProtectedRoute({ requireAuthorization=false }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    const navigate = useNavigate()
    const notification = useNotification()

    // Генерация csrf
    const csrfGenerage = () => {
        httpService.refreshCsrf()
    }

    const loadDocuments = () => {
        httpService.get('/document/all')
            .then(docRes => {
                setUser(prev => ({
                    ...prev,
                    documents: docRes.data ?? []
                }))
            })
            .catch(docErr => {
                console.error('Не удалось загрузить документы:', docErr)
                notification.error('Не удалось загрузить документы')
            })
            .finally(() => setIsLoading(false))
    }

    // Проверка авторизаций
    const checkAuth = () => {
        httpService.get('/authorization/check')
            .then(userRes => {
                setUser({
                    ...userRes.data,
                    documents: userRes.data.documents ?? []
                })
                loadDocuments()
            })
    }

    useEffect(() => {
        checkAuth()
    }, [])

    useEffect(() => {
        if (!isLoading && requireAuthorization && !user) {
            navigate('/auth', { replace: true })
        }
    }, [isLoading, user, requireAuthorization, navigate])

    // Вход
    const login = ({ email, password }) => {
        setIsLoading(true)
        httpService.post('/authorization/login', {
            email: email,
            password: password
        })
            .then(res => {
                notification.success(`Пользователь ${res.data.firstName} совершил вход`)
                setUser(res.data)
                csrfGenerage()
                loadDocuments()
            })
            .catch(err => {
                notification.error(err.message || 'Ошибка запроса')
            })
    }

    // Регистрация
    const register = ({ firstName, lastName, email, password }) => {
        setIsLoading(true)
        httpService.post('/authorization/register', {
            email: email,
            firstName: firstName,
            lastName: lastName,
            password: password
        })
            .then(userRes => {
                notification.success(`Пользователь ${userRes.data.firstName} зарегистрирован`)
                setUser({
                    ...userRes.data,
                    documents: []
                })
                csrfGenerage()
            })
            .catch(err => {
                console.error(err)
                notification.error(err.message || 'Произошла ошибка')
            })
            .finally(() => setIsLoading(false))
    }

    // Выход
    const logout = () => {
        setIsLoading(true)
        httpService.delete('/authorization/logout', )
            .then(() => {
                setUser(null)
            })
            .catch(err => {
                notification.error(err?.message || 'Не удалось обработать выход')
            })
            .finally(() => setIsLoading(false))
    }
    
    const value = { user, isLoading, setUser, checkAuth, login, register, logout, setIsLoading }

    if (isLoading) {
        return (
            <LoadingPage />
        )
    }
    
    return (
        <UserContext.Provider value={value}>
            <Outlet />
        </UserContext.Provider>
    )
}

export { ProtectedRoute, ProtectedRoute as default, UserContext }
