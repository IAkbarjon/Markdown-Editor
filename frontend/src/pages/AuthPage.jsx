import { useEffect, useState } from 'react'
import { Button, Container, Form } from 'react-bootstrap'
import { Eye, EyeFill } from 'react-bootstrap-icons'
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
            console.log(user)
            navigate('/', { replace: true })
        }
    }, [user])

    const handleValidatePassword = (validate=true) => {
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

    // Обработка входа
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

    // Обработка регистрации
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
                password: registerData.password
            })
        }
    }

    return (
        <Container className='flex flex-1 h-full items-center justify-center'>
            {authMode === 'login' ?
                <Form
                    onSubmit={handleLogin}
                    className='shadow-2xl min-w-120 rounded-2xl flex flex-col items-center justify-center pt-10 pb-10 gap-[16px]'
                >
                    <Form.Group>
                        <h1>Вход</h1>
                    </Form.Group>
                    <Form.Group className='w-4/7'>
                        <Form.Label>Почта</Form.Label>
                        <Form.Control
                            type='email'
                            name='email'
                            value={loginData.email}
                            onChange={(e) => setLoginData(prev => ({
                                ...prev,
                                email: e.target.value
                            }))}
                            required
                            className=''
                        />
                    </Form.Group>
                    <Form.Group className='relative w-4/7'>
                        <Form.Label>Пароль</Form.Label>
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
                            required
                        />
                        <Button
                            variant='none'
                            onClick={() => setLoginData(prev => ({
                                ...prev,
                                password: {
                                    ...prev.password,
                                    show: !prev.password.show
                                }
                            }))}
                            className='absolute bottom-[2px] right-0 w-min h-min'
                            tabIndex={-1}
                        >
                            { loginData.password.show
                                ? <EyeFill size={18} color='#0b5ed7' />
                                : <Eye size={18} color='gray' />
                            }
                        </Button>
                    </Form.Group>
                    <Form.Group className='mt-3'>
                        <Button type='submit'>Войти</Button>
                    </Form.Group>
                    <Form.Group className='mt-4'>
                        <p>
                            Нет аккунта?
                            <Button
                                variant='link'
                                onClick={() => setAuthMode('signout')}
                                className='p-[0 auto]'
                            >Создать</Button>
                        </p>
                    </Form.Group>
                </Form> : 
                <Form
                    onSubmit={handleRegister}
                    className='shadow-2xl min-w-120 rounded-2xl flex flex-col items-center justify-center pt-10 pb-10 gap-[16px]'
                >
                    <Form.Group>
                        <h1>Регистрация</h1>
                    </Form.Group>
                    <Form.Group className='w-4/7'>
                        <Form.Label>Фамилия</Form.Label>
                        <Form.Control
                            type='text'
                            value={registerData.lastName}
                            onChange={(e) => setRegisterData(prev => ({
                                ...prev,
                                lastName: e.target.value
                            }))}
                            required
                        />
                    </Form.Group>
                    <Form.Group className='w-4/7'>
                        <Form.Label>Имя</Form.Label>
                        <Form.Control
                            type='text'
                            value={registerData.firstName}
                            onChange={(e) => setRegisterData(prev => ({
                                ...prev,
                                firstName: e.target.value
                            }))}
                            required
                        />
                    </Form.Group>
                    <Form.Group  className='w-4/7'>
                        <Form.Label>Почта</Form.Label>
                        <Form.Control
                            type='email'
                            value={registerData.email}
                            onChange={(e) => setRegisterData(prev => ({
                                ...prev,
                                email: e.target.value
                            }))}
                            required
                        />
                    </Form.Group>
                    <Form.Group className='relative w-4/7'>
                        <Form.Label>Пароль</Form.Label>
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
                            required
                            isInvalid={registerData.password.isInvalid}
                        />
                        <Button
                            variant='none'
                            onClick={() => setRegisterData(prev => ({
                                ...prev,
                                password: {
                                    ...prev.password,
                                    show: !prev.password.show
                                }
                            }))}
                            className='absolute bottom-[2px] right-0 w-min h-min'
                            tabIndex={-1}
                        >
                            { registerData.password.show
                                ? <EyeFill size={18} color='#0b5ed7' />
                                : <Eye size={18} color='gray' />
                            }
                        </Button>
                    </Form.Group>
                    <Form.Group className='relative w-4/7'>
                        <Form.Label>Повторный пароль</Form.Label>
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
                            required
                            isInvalid={registerData.repeatPassword.isInvalid}
                        />
                        <Button
                            variant='none'
                            onClick={() => setRegisterData(prev => ({
                                ...prev,
                                repeatPassword: {
                                    ...prev.repeatPassword,
                                    show: !prev.repeatPassword.show
                                }
                            }))}
                            className='absolute bottom-[2px] right-0 w-min h-min'
                            tabIndex={-1}
                        >
                            { registerData.repeatPassword.show
                                ? <EyeFill size={18} color='#0b5ed7' />
                                : <Eye size={18} color='gray' />
                            }
                        </Button>
                    </Form.Group>
                    <Form.Group className='mt-3'>
                        <Button type='submit'>Зарегистрироваться</Button>
                    </Form.Group>
                    <Form.Group className='mt-4'>
                        <p>
                            Есть аккаунт?
                            <Button
                                variant='link'
                                onClick={() => setAuthMode('login')}
                                className='p-[0 auto]'
                            >Войти</Button>
                        </p>
                    </Form.Group>
                </Form>
            }
        </Container>
    )
}

export default AuthPage
