import { useEffect, useState } from 'react'
import { Button, Card, Container, Form } from 'react-bootstrap'
import { Eye, EyeFill, BoxArrowInRight, PersonPlus } from 'react-bootstrap-icons'
import useNotification from '../hooks/useNotification'
import useUser from '../hooks/useUser'
import { useNavigate } from 'react-router-dom'

function AuthPage() {
    const [authMode, setAuthMode] = useState('login')
    const { user, login, register } = useUser()
    const notification = useNotification()
    const navigate = useNavigate()

    const [loginData, setLoginData] = useState({
        email: '',
        password: {
            text: '',
            show: false
        }
    })

    const [registerData, setRegisterData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: {
            text: '',
            show: false,
            isInvalid: false,
        },
        repeatPassword: {
            text: '',
            show: false,
            isInvalid: false,
        },
    })

    useEffect(() => {
        if (user) {
            navigate('/', { replace: true })
        }
    }, [user])

    const handleValidatePassword = (validate = true) => {
        setRegisterData(prev => ({
            ...prev,
            password: {
                ...prev.password,
                isInvalid: validate
            },
            repeatPassword: {
                ...prev.repeatPassword,
                isInvalid: validate
            }
        }))
    }

    const handleLogin = (e) => {
        e.preventDefault()

        if (!loginData.email) {
            notification.warning('Введите почту')
        } else if (!loginData.password.text) {
            notification.warning('Введите пароль')
        } else {
            login({ email: loginData.email, password: loginData.password.text })
        }
    }

    const handleRegister = (e) => {
        e.preventDefault()

        if (registerData.password.text.trim() !== registerData.repeatPassword.text.trim()) {
            notification.warning('Пароли не совпадают', 'Ошибка валидации')
            handleValidatePassword(true)

            setTimeout(() => {
                handleValidatePassword(false)
            }, 1000)
        } else {
            register({
                firstName: registerData.firstName,
                lastName: registerData.lastName,
                email: registerData.email,
                password: registerData.password.text
            })
        }
    }

    return (
        <div className='min-vh-100 bg-light d-flex align-items-center justify-content-center p-3'>
            <div style={{ maxWidth: '440px', width: '100%' }}>
                <Card className='border-0 shadow-sm'>
                    <Card.Body className='p-4 p-sm-5'>
                        
                        {authMode === 'login' ? (
                            // Форма входа
                            <>
                                <div className='text-center mb-4'>
                                    <div 
                                        className='bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3'
                                        style={{ width: '48px', height: '48px' }}
                                    >
                                        <BoxArrowInRight size={24} className='text-primary' />
                                    </div>
                                    <h5 className='fw-semibold mb-1'>Вход</h5>
                                    <p className='text-muted small mb-0'>
                                        Войдите в свой аккаунт
                                    </p>
                                </div>

                                <Form onSubmit={handleLogin}>
                                    <Form.Group className='mb-3'>
                                        <Form.Label className='small fw-medium text-secondary'>
                                            Почта
                                        </Form.Label>
                                        <Form.Control
                                            type='email'
                                            value={loginData.email}
                                            onChange={(e) => setLoginData(prev => ({
                                                ...prev,
                                                email: e.target.value
                                            }))}
                                            placeholder='example@mail.com'
                                            className='rounded-pill px-3 py-2'
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className='mb-4 position-relative'>
                                        <Form.Label className='small fw-medium text-secondary'>
                                            Пароль
                                        </Form.Label>
                                        <Form.Control
                                            type={loginData.password.show ? 'text' : 'password'}
                                            value={loginData.password.text}
                                            onChange={(e) => setLoginData(prev => ({
                                                ...prev,
                                                password: {
                                                    ...prev.password,
                                                    text: e.target.value
                                                }
                                            }))}
                                            placeholder='••••••••'
                                            className='rounded-pill px-3 py-2 pe-5'
                                            required
                                        />
                                        <Button
                                            variant='link'
                                            onClick={() => setLoginData(prev => ({
                                                ...prev,
                                                password: {
                                                    ...prev.password,
                                                    show: !prev.password.show
                                                }
                                            }))}
                                            className='position-absolute end-0 top-[31px] mt-1 me-1 p-2 text-secondary lh-1'
                                            tabIndex={-1}
                                        >
                                            {loginData.password.show
                                                ? <EyeFill size={19} />
                                                : <Eye size={19} />
                                            }
                                        </Button>
                                    </Form.Group>

                                    <Button
                                        type='submit'
                                        variant='dark'
                                        className='w-100 rounded-pill py-2 mb-3'
                                    >
                                        Войти
                                    </Button>
                                </Form>

                                <div className='text-center'>
                                    <span className='text-muted small me-1'>
                                        Нет аккаунта?
                                    </span>
                                    <Button
                                        variant='link'
                                        size='sm'
                                        className='text-decoration-none p-0'
                                        onClick={() => setAuthMode('signout')}
                                    >
                                        Создать
                                    </Button>
                                </div>
                            </>
                        ) : (
                            // Форма регистрации
                            <>
                                <div className='text-center mb-4'>
                                    <div 
                                        className='bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3'
                                        style={{ width: '48px', height: '48px' }}
                                    >
                                        <PersonPlus size={24} className='text-primary' />
                                    </div>
                                    <h5 className='fw-semibold mb-1'>Регистрация</h5>
                                    <p className='text-muted small mb-0'>
                                        Создайте новый аккаунт
                                    </p>
                                </div>

                                <Form onSubmit={handleRegister}>
                                    <Form.Group className='mb-3'>
                                        <Form.Label className='small fw-medium text-secondary'>
                                            Фамилия
                                        </Form.Label>
                                        <Form.Control
                                            type='text'
                                            value={registerData.lastName}
                                            onChange={(e) => setRegisterData(prev => ({
                                                ...prev,
                                                lastName: e.target.value
                                            }))}
                                            className='rounded-pill px-3 py-2'
                                            placeholder='Иванов'
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className='mb-3'>
                                        <Form.Label className='small fw-medium text-secondary'>
                                            Имя
                                        </Form.Label>
                                        <Form.Control
                                            type='text'
                                            value={registerData.firstName}
                                            onChange={(e) => setRegisterData(prev => ({
                                                ...prev,
                                                firstName: e.target.value
                                            }))}
                                            className='rounded-pill px-3 py-2'
                                            placeholder='Иван'
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className='mb-3'>
                                        <Form.Label className='small fw-medium text-secondary'>
                                            Почта
                                        </Form.Label>
                                        <Form.Control
                                            type='email'
                                            value={registerData.email}
                                            onChange={(e) => setRegisterData(prev => ({
                                                ...prev,
                                                email: e.target.value
                                            }))}
                                            placeholder='example@mail.com'
                                            className='rounded-pill px-3 py-2'
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className='mb-3 position-relative'>
                                        <Form.Label className='small fw-medium text-secondary'>
                                            Пароль
                                        </Form.Label>
                                        <Form.Control
                                            type={registerData.password.show ? 'text' : 'password'}
                                            value={registerData.password.text}
                                            onChange={(e) => setRegisterData(prev => ({
                                                ...prev,
                                                password: {
                                                    ...prev.password,
                                                    text: e.target.value
                                                }
                                            }))}
                                            placeholder='••••••••'
                                            className='rounded-pill px-3 py-2 pe-5'
                                            required
                                            isInvalid={registerData.password.isInvalid}
                                        />
                                        <Button
                                            variant='link'
                                            onClick={() => setRegisterData(prev => ({
                                                ...prev,
                                                password: {
                                                    ...prev.password,
                                                    show: !prev.password.show
                                                }
                                            }))}
                                            className='position-absolute end-0 top-[31px] mt-1 me-1 p-2 text-secondary lh-1'
                                            tabIndex={-1}
                                        >
                                            {registerData.password.show
                                                ? <EyeFill size={18} />
                                                : <Eye size={18} />
                                            }
                                        </Button>
                                    </Form.Group>

                                    <Form.Group className='mb-4 position-relative'>
                                        <Form.Label className='small fw-medium text-secondary'>
                                            Повторный пароль
                                        </Form.Label>
                                        <Form.Control
                                            type={registerData.repeatPassword.show ? 'text' : 'password'}
                                            value={registerData.repeatPassword.text}
                                            onChange={(e) => setRegisterData(prev => ({
                                                ...prev,
                                                repeatPassword: {
                                                    ...prev.repeatPassword,
                                                    text: e.target.value
                                                }
                                            }))}
                                            placeholder='••••••••'
                                            className='rounded-pill px-3 py-2 pe-5'
                                            required
                                            isInvalid={registerData.repeatPassword.isInvalid}
                                        />
                                        <Button
                                            variant='link'
                                            onClick={() => setRegisterData(prev => ({
                                                ...prev,
                                                repeatPassword: {
                                                    ...prev.repeatPassword,
                                                    show: !prev.repeatPassword.show
                                                }
                                            }))}
                                            className='position-absolute end-0 top-[31px] mt-1 me-1 p-2 text-secondary lh-1'
                                            tabIndex={-1}
                                        >
                                            {registerData.repeatPassword.show
                                                ? <EyeFill size={18} />
                                                : <Eye size={18} />
                                            }
                                        </Button>
                                    </Form.Group>

                                    <Button
                                        type='submit'
                                        variant='dark'
                                        className='w-100 rounded-pill py-2 mb-3'
                                    >
                                        Зарегистрироваться
                                    </Button>
                                </Form>

                                <div className='text-center'>
                                    <span className='text-muted small me-1'>
                                        Есть аккаунт?
                                    </span>
                                    <Button
                                        variant='link'
                                        size='sm'
                                        className='text-decoration-none p-0'
                                        onClick={() => setAuthMode('login')}
                                    >
                                        Войти
                                    </Button>
                                </div>
                            </>
                        )}
                    </Card.Body>
                </Card>

                <p className='text-center text-muted small mt-3 mb-0'>
                    Markdown Editor
                </p>
            </div>
        </div>
    )
}

export default AuthPage
