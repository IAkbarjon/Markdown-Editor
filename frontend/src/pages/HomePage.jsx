import { useNavigate } from 'react-router-dom'
import { Button, Card } from 'react-bootstrap'
import { 
    FileEarmarkText, 
    People, 
    ClockHistory, 
    PlusCircle,
    ShieldLock,
    Lightning,
    PersonPlus,
    BoxArrowInRight
} from 'react-bootstrap-icons'
import useUser from '../hooks/useUser'

function HomePage() {
    const { user } = useUser()
    const navigate = useNavigate()

    // Моковые данные — заменить на API
    const stats = {
        totalDocs: 12,
        sharedDocs: 5,
        recentDocs: [
        { id: 1, title: 'API Documentation', updatedAt: '2026-12-20', shared: true },
        { id: 2, title: 'Project Roadmap', updatedAt: '2026-12-19', shared: false },
        { id: 3, title: 'Meeting Notes', updatedAt: '2026-12-18', shared: true },
        ]
    }

    if (!user) {
        // ============ СТРАНИЦА ДЛЯ ГОСТЕЙ ============
        return (
            <div className='min-vh-100 bg-light'>
                {/* Hero секция */}
                <div className='text-center py-5 px-3'>
                    <div 
                        className='bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4'
                        style={{ width: '80px', height: '80px' }}
                    >
                        <FileEarmarkText size={40} className='text-primary' />
                    </div>
                    
                    <h1 className='display-5 fw-bold mb-3'>
                        Markdown Editor
                    </h1>
                    
                    <p className='text-muted lead mb-2 mx-auto' style={{ maxWidth: '500px' }}>
                        Совместное редактирование Markdown-документов в реальном времени
                    </p>
                    
                    <p className='text-muted small mb-4 mx-auto' style={{ maxWidth: '400px' }}>
                        Лёгкий аналог Google Docs для технических специалистов.
                        Пишите документацию вместе с командой.
                    </p>

                    <div className='d-flex gap-2 justify-content-center'>
                        <Button
                            variant='dark'
                            size='lg'
                            className='rounded-pill px-4 d-flex align-items-center gap-2'
                            onClick={() => navigate('/auth')}
                        >
                        <BoxArrowInRight size={20} />
                            Начать работу
                        </Button>
                    </div>
                </div>

                {/* Фичи */}
                <div className='container py-5'>
                    <div className='row g-4 justify-content-center'>
                        <div className='col-md-4'>
                        <Card className='border-0 shadow-sm h-100'>
                            <Card.Body className='p-4 text-center'>
                                <Lightning size={28} className='text-primary mb-3' />
                                <h6 className='fw-semibold mb-2'>Реальное время</h6>
                                <p className='text-muted small mb-0'>
                                    Видьте изменения других участников мгновенно
                                </p>
                            </Card.Body>
                        </Card>
                        </div>

                        <div className='col-md-4'>
                        <Card className='border-0 shadow-sm h-100'>
                            <Card.Body className='p-4 text-center'>
                                <People size={28} className='text-primary mb-3' />
                                <h6 className='fw-semibold mb-2'>Совместная работа</h6>
                                <p className='text-muted small mb-0'>
                                    Приглашайте коллег и редактируйте вместе
                                </p>
                            </Card.Body>
                        </Card>
                        </div>

                        <div className='col-md-4'>
                        <Card className='border-0 shadow-sm h-100'>
                            <Card.Body className='p-4 text-center'>
                                <ShieldLock size={28} className='text-primary mb-3' />
                                <h6 className='fw-semibold mb-2'>Контроль версий</h6>
                                <p className='text-muted small mb-0'>
                                    Сохраняйте историю изменений и восстанавливайте версии
                                </p>
                            </Card.Body>
                        </Card>
                        </div>
                    </div>
                </div>

                {/* Подвал */}
                <div className='text-center py-4'>
                    <p className='text-muted small mb-0'>
                        © 2026 Markdown Editor
                    </p>
                </div>
            </div>
        )
    }

  // ============ СТРАНИЦА ДЛЯ АВТОРИЗОВАННЫХ ============
    return (
        <div className='min-vh-100 bg-light'>
            <div className='container py-4' style={{ maxWidth: '900px' }}>
            
                {/* Приветствие и статистика */}
                <div className='mb-4'>
                    <h5 className='fw-semibold mb-3'>
                    Добро пожаловать, {user.firstName || user.username}
                    </h5>
                    
                    <div className='row g-3 mb-4'>
                    <div className='col-sm-4'>
                        <Card className='border-0 shadow-sm'>
                        <Card.Body className='d-flex align-items-center gap-3 p-3'>
                            <div className='bg-primary bg-opacity-10 rounded-circle p-2'>
                            <FileEarmarkText size={20} className='text-primary' />
                            </div>
                            <div>
                            <div className='small text-muted'>Документов</div>
                            <div className='fw-bold fs-5'>{stats.totalDocs}</div>
                            </div>
                        </Card.Body>
                        </Card>
                    </div>

                    <div className='col-sm-4'>
                        <Card className='border-0 shadow-sm'>
                        <Card.Body className='d-flex align-items-center gap-3 p-3'>
                            <div className='bg-success bg-opacity-10 rounded-circle p-2'>
                            <People size={20} className='text-success' />
                            </div>
                            <div>
                            <div className='small text-muted'>Общих</div>
                            <div className='fw-bold fs-5'>{stats.sharedDocs}</div>
                            </div>
                        </Card.Body>
                        </Card>
                    </div>

                    <div className='col-sm-4'>
                        <Card className='border-0 shadow-sm'>
                        <Card.Body className='d-flex align-items-center gap-3 p-3'>
                            <div className='bg-warning bg-opacity-10 rounded-circle p-2'>
                            <ClockHistory size={20} className='text-warning' />
                            </div>
                            <div>
                            <div className='small text-muted'>Недавних</div>
                            <div className='fw-bold fs-5'>{stats.totalDocs}</div>
                            </div>
                        </Card.Body>
                        </Card>
                    </div>
                    </div>
                </div>

                {/* Кнопка создания и недавние документы */}
                <Card className='border-0 shadow-sm mb-3'>
                    <Card.Body className='p-4'>
                    <div className='d-flex align-items-center justify-content-between mb-3'>
                        <h6 className='fw-semibold mb-0'>Недавние документы</h6>
                        <Button
                        variant='dark'
                        size='sm'
                        className='rounded-pill px-3 d-flex align-items-center gap-2'
                        onClick={() => navigate('/editor')}
                        >
                        <PlusCircle size={16} />
                        Новый документ
                        </Button>
                    </div>

                    {stats.recentDocs.length === 0 ? (
                        <div className='text-center py-4 text-muted small'>
                        <FileEarmarkText size={32} className='mb-2 opacity-50' />
                        <p>Нет документов. Создайте первый!</p>
                        </div>
                    ) : (
                        <div className='d-flex flex-column gap-2'>
                        {stats.recentDocs.map(doc => (
                            <div
                            key={doc.id}
                            className='d-flex align-items-center gap-3 p-2 rounded-3 hover:bg-light'
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/editor?id=${doc.id}`)}
                            >
                            <FileEarmarkText size={18} className='text-primary flex-shrink-0' />
                            <div className='flex-grow-1 min-w-0'>
                                <div className='fw-medium small text-truncate'>{doc.title}</div>
                                <div className='text-muted small'>
                                {new Date(doc.updatedAt).toLocaleDateString('ru-RU')}
                                </div>
                            </div>
                            {doc.shared && (
                                <People size={14} className='text-success flex-shrink-0' />
                            )}
                            </div>
                        ))}
                        </div>
                    )}
                    </Card.Body>
                </Card>

                {/* Быстрые действия */}
                <div className='row g-3'>
                    <div className='col-sm-6'>
                    <Card 
                        className='border-0 shadow-sm h-100'
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/editor')}
                    >
                        <Card.Body className='p-3 d-flex align-items-center gap-3'>
                        <PlusCircle size={20} className='text-primary' />
                        <div className='fw-medium small'>Создать документ</div>
                        </Card.Body>
                    </Card>
                    </div>

                    <div className='col-sm-6'>
                    <Card 
                        className='border-0 shadow-sm h-100'
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/profile')}
                    >
                        <Card.Body className='p-3 d-flex align-items-center gap-3'>
                        <PersonPlus size={20} className='text-primary' />
                        <div className='fw-medium small'>Редактировать профиль</div>
                        </Card.Body>
                    </Card>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default HomePage
