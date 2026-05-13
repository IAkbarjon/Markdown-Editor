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

    // Проверка авторизаций
    const checkAuth = () => {
        httpService.get('/authorization/check')
            .then(res => {
                setUser(res.data)
            })
            .finally(() => setIsLoading(false))
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
        httpService.post('/authorization/login', {
            email: email,
            password: password
        })
            .then(res => {
                notification.success(`Пользователь ${res.data.firstName} совершил вход`)
                setUser(res.data)
            })
            .catch(err => {
                notification.error(err.message || 'Ошибка запроса')
            })
    }

    // Регистрация
    const register = ({ firstName, lastName, email, password }) => {
        httpService.post('/authorization/register', {
            email: email,
            firstName: firstName,
            lastName: lastName,
            password: password
        })
            .then(res => {
                notification.success(`Пользователь ${res.data.firstName} зарегистрирован`)
                setUser(res.data)
            })
            .catch(err => {
                console.error(err)
                notification.error(err.message || 'Произошла ошибка')
            })
    }

    // Выход
    const logout = () => {
        httpService.delete('/authorization/logout')
            .then(() => {
                setUser(null)
            })
            .catch(err => {
                notification.error(err?.message || 'Не удалось обработать выход')
            })
    }
    
    const value = { user, setUser, checkAuth, login, register, logout }

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
