import { Outlet } from 'react-router-dom'
import useUser from '../../hooks/useUser'

function Header() {
    const { user } = useUser()
    
    return (
        <div className='flex-1 flex-column'>
            <header className='h-[60px] flex items-center justify-between pl-10 pr-10 shadow-sm'>
                <h3>Markdown editor</h3>

                {user ? (
                    <nav className='space-x-6'>
                        <a href="/" className="text-gray-700 hover:text-blue-600 transition">Главная</a>
                        <a href="/editor" className="text-gray-700 hover:text-blue-600 transition">Редактор</a>
                    </nav>
                ) : (
                    <nav className='space-x-6'>
                        <a href='/auth'>Войти</a>
                    </nav>
                )}
            </header>

            <Outlet />
        </div>
    )
}

export { Header, Header as default }
