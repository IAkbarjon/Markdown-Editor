import { Outlet, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useUser from '../../hooks/useUser'
import { Navbar, Container, Nav, Button, Modal, Form, InputGroup, Spinner } from 'react-bootstrap'
import { PersonCircle, BoxArrowInRight, FileEarmarkText, Search, Person, PersonPlus, X } from 'react-bootstrap-icons'
import httpService from '../../services/httpService'

function Header() {
    const { user } = useUser()
    const navigate = useNavigate()
    
    // Состояния для модалки поиска
    const [showSearchModal, setShowSearchModal] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [recentUsers, setRecentUsers] = useState([])

    // Загружаем недавних пользователей при открытии модалки
    useEffect(() => {
        if (showSearchModal && user) {
            fetchRecentUsers()
        }
    }, [showSearchModal, user])

    useEffect(() => {
        console.log(searchResults)
    }, [searchResults])

    // Поиск с дебаунсом
    useEffect(() => {
        if (!showSearchModal) return
        
        const timer = setTimeout(() => {
            if (searchQuery.length >= 2) {
                searchUsers()
            } else if (searchQuery.length === 0) {
                setSearchResults([])
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery, showSearchModal])

    const searchUsers = async () => {
        setIsSearching(true)
        httpService.get(`/users/search/${searchQuery}`)
            .then(res => {
                const filtered = res.data.filter(u => u.id !== user?.id)
                console.log(res)
                setSearchResults(filtered)
            })
            .catch(err => {
                console.error('Search error:', err)
            })
            .finally(() => setIsSearching(false))
    }

    const fetchRecentUsers = async () => {
        await httpService.get('/users/recent')
            .then(res => {
                setRecentUsers(res.data)
            })
            .catch(err => {
                console.error('Error fetching recent users:', err)
            })
    }

    const handleUserClick = (username) => {
        setShowSearchModal(false)
        setSearchQuery('')
        setSearchResults([])
        navigate(`/user/${username}`)
    }

    const getInitials = (firstName, lastName, username) => {
        if (firstName && lastName) return `${firstName[0]}${lastName[0]}`
        if (firstName) return firstName[0]
        return username?.[0]?.toUpperCase() || 'U'
    }

    return (
        <div className='min-vh-100 bg-light'>
            <Navbar className='bg-white shadow-sm mb-0' expand='sm'>
                <Container>
                    <Navbar.Brand 
                        className='d-flex align-items-center gap-2 fw-semibold'
                        onClick={() => navigate('/')}
                        style={{ cursor: 'pointer' }}
                    >
                        <FileEarmarkText size={20} className='text-primary' />
                        Markdown Editor
                    </Navbar.Brand>

                    <Nav className='ms-auto'>
                        {user ? (
                            <div className='d-flex align-items-center gap-2'>
                                <Button
                                    variant='light'
                                    size='sm'
                                    className='rounded-pill px-3 d-flex align-items-center gap-2'
                                    onClick={() => setShowSearchModal(true)}
                                >
                                    <Search size={16} />
                                    <span className='d-none d-sm-inline'>Поиск</span>
                                </Button>
                                <Button
                                    variant='light'
                                    size='sm'
                                    className='rounded-pill px-3 d-flex align-items-center gap-2'
                                    onClick={() => navigate('/documents')}
                                >
                                    <FileEarmarkText size={16} />
                                    <span className='d-none d-sm-inline'>Документы</span>
                                </Button>
                                <Button
                                    variant='light'
                                    size='sm'
                                    className='rounded-pill px-3 d-flex align-items-center gap-2'
                                    onClick={() => navigate('/profile')}
                                >
                                    <PersonCircle size={16} />
                                    <span className='d-none d-sm-inline'>Профиль</span>
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant='dark'
                                size='sm'
                                className='rounded-pill px-3 d-flex align-items-center gap-2'
                                onClick={() => navigate('/auth')}
                            >
                                <BoxArrowInRight size={16} />
                                Вход
                            </Button>
                        )}
                    </Nav>
                </Container>
            </Navbar>

            <Outlet />

            {/* Модалка поиска пользователей */}
            <Modal
                size='lg'
                show={showSearchModal} 
                onHide={() => {
                    setShowSearchModal(false)
                    setSearchQuery('')
                    setSearchResults([])
                }}
            >
                <Modal.Body className='p-0'>
                    <div className='p-4 border-bottom'>
                        <div className='d-flex align-items-center justify-content-between mb-3'>
                            <h6 className='fw-semibold mb-0 d-flex align-items-center gap-2'>
                                <Search size={18} className='text-primary' />
                                Поиск пользователей
                            </h6>
                            <Button
                                variant='link'
                                size='sm'
                                className='p-0 text-muted'
                                onClick={() => {
                                    setShowSearchModal(false)
                                    setSearchQuery('')
                                    setSearchResults([])
                                }}
                            >
                                <X size={20} />
                            </Button>
                        </div>
                        
                        <InputGroup>
                            <Form.Control
                                type='text'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder='Введите имя, username или email...'
                                className='rounded-pill py-2'
                                autoFocus
                            />
                            <Button
                                size='sm'
                                variant='dark' 
                                className='rounded-pill ms-2 px-4'
                                onClick={searchUsers}
                                disabled={searchQuery.length < 2}
                            >
                                <div className='flex items-center'>
                                    <Search size={16} className='me-1' />
                                    Найти
                                </div>
                            </Button>
                        </InputGroup>
                    </div>

                    <div className='p-4' style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {isSearching ? (
                            <div className='text-center py-5'>
                                <Spinner size='sm' className='mb-2' />
                                <p className='text-muted small mb-0'>Поиск...</p>
                            </div>
                        ) : searchQuery.length >= 2 && searchResults.length > 0 ? (
                            <>
                                <div className='small text-muted mb-2'>
                                    Найдено: {searchResults.length}
                                </div>
                                <div className='d-flex flex-column gap-2'>
                                    {searchResults.map(userResult => (
                                        <div
                                            key={userResult.id}
                                            className='d-flex align-items-center justify-content-between p-3 rounded-3 border hover-shadow transition'
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleUserClick(userResult.username)}
                                        >
                                            <div className='d-flex align-items-center gap-3'>
                                                <div 
                                                    className='bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0'
                                                    style={{ width: '40px', height: '40px' }}
                                                >
                                                    <span className='fw-semibold text-primary small'>
                                                        {getInitials(userResult.firstName, userResult.lastName, userResult.username)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className='fw-medium small'>
                                                        {userResult.firstName && userResult.lastName 
                                                            ? `${userResult.firstName} ${userResult.lastName}`
                                                            : userResult.username
                                                        }
                                                    </div>
                                                    <div className='text-muted small'>{userResult.username}</div>
                                                    {userResult.email && (
                                                        <div className='text-muted small'>{userResult.email}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant='outline-primary'
                                                size='sm'
                                                className='rounded-pill'
                                            >
                                                <div className='flex items-center'>
                                                    <Person size={14} className='me-1' />
                                                    Открыть
                                                </div>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : searchQuery.length >= 2 && searchResults.length === 0 ? (
                            <div className='text-center py-5'>
                                <Person size={48} className='text-muted opacity-25 mb-3' />
                                <p className='text-muted small mb-0'>
                                    Пользователи не найдены
                                </p>
                                <p className='text-muted small'>
                                    Попробуйте изменить поисковый запрос
                                </p>
                            </div>
                        ) : recentUsers.length > 0 ? (
                            <>
                                <div className='small text-muted mb-2 d-flex align-items-center gap-1'>
                                    <PersonPlus size={12} />
                                    Недавние контакты
                                </div>
                                <div className='d-flex flex-column gap-2'>
                                    {recentUsers.map(userResult => (
                                        <div
                                            key={userResult.id}
                                            className='d-flex align-items-center justify-content-between p-3 rounded-3 border hover-shadow transition'
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleUserClick(userResult.username)}
                                        >
                                            <div className='d-flex align-items-center gap-3'>
                                                <div 
                                                    className='bg-light rounded-circle d-flex align-items-center justify-content-center flex-shrink-0'
                                                    style={{ width: '40px', height: '40px' }}
                                                >
                                                    <Person size={20} className='text-muted' />
                                                </div>
                                                <div>
                                                    <div className='fw-medium small'>
                                                        {userResult.firstName && userResult.lastName 
                                                            ? `${userResult.firstName} ${userResult.lastName}`
                                                            : userResult.username
                                                        }
                                                    </div>
                                                    <div className='text-muted small'>{userResult.username}</div>
                                                </div>
                                            </div>
                                            <Button
                                                variant='outline-secondary'
                                                size='sm'
                                                className='rounded-pill'
                                            >
                                                <Person size={14} className='me-1' />
                                                Открыть
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className='text-center py-5'>
                                <Search size={48} className='text-muted opacity-25 mb-3' />
                                <p className='text-muted small mb-0'>
                                    Начните вводить имя или email для поиска
                                </p>
                            </div>
                        )}
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export { Header, Header as default }
