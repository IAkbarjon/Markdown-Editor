import { Outlet, useNavigate } from 'react-router-dom'
import useUser from '../../hooks/useUser'
import { Navbar, Container, Nav, Button } from 'react-bootstrap'
import { PersonCircle, BoxArrowInRight, FileEarmarkText } from 'react-bootstrap-icons'

function Header() {
    const { user } = useUser()
    const navigate = useNavigate()
    
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
                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='light'
                                    size='sm'
                                    className='rounded-pill px-3 d-flex align-items-center gap-2'
                                    onClick={() => navigate('/documents')}
                                >
                                    <FileEarmarkText size={16} />
                                    Документы
                                </Button>
                                <Button
                                    variant='light'
                                    size='sm'
                                    className='rounded-pill px-3 d-flex align-items-center gap-2'
                                    onClick={() => navigate('/profile')}
                                >
                                    <PersonCircle size={16} />
                                    Профиль
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
        </div>
    )
}

export { Header, Header as default }
