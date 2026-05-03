import { useContext } from 'react'
import { UserContext } from '../contexts/ProtectedRoute'

const useUser = () => {
    const context = useContext(UserContext)

    if (!context) {
        throw new Error('UserContext must be used within ProtectedRoute')
    }

    return context
}

export { useUser, useUser as default }