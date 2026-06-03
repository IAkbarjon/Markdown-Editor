import { useCallback, useEffect, useState } from 'react'
import { useSignalR } from '../hooks/useSignalR'
import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'
import '@uiw/react-md-editor/markdown-editor.css'
import { useSearchParams } from 'react-router-dom'
import useUser from '../hooks/useUser'
import { Button, Card, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FileEarmarkText, People, PencilSquare, Clock, Eye, EyeSlash, ArrowLeft, InfoCircle, Person } from 'react-bootstrap-icons'

function EditorPage() {
    const [document, setDocument] = useState(undefined)
    const [isTyping, setIsTyping] = useState(false)
    const [showPreview, setShowPreview] = useState(true)

    const { user } = useUser()
    const [searchParams] = useSearchParams()
    const { content, updateContent, sendTyping, isConnected, typingUser } = useSignalR(
        searchParams.get('document')
    )

    useEffect(() => {
        const id = searchParams.get('document')
        if (!id) {
            alert('Не указан ID документа')
            return
        }

        const foundDoc = user.documents?.find(doc => doc.id == id)

        if (!foundDoc) {
            alert('Такого документа нет')
            return
        }
        
        setDocument(foundDoc)
    }, [searchParams, user.documents])

    const handleChange = (newContent) => {
        updateContent(newContent)
    }

    const handleKeyDown = useCallback(() => {
        if (!isTyping) {
            setIsTyping(true)
            sendTyping(user?.username || 'Пользователь')
            setTimeout(() => setIsTyping(false), 1000)
        }
    }, [isTyping, sendTyping, user?.username])

    // Форматирование даты
    const formatDate = (dateString) => {
        if (!dateString) return '—'
        const date = new Date(dateString)
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (!document) {
        return (
            <div className='min-vh-100 bg-light d-flex align-items-center justify-content-center'>
                <Card className='border-0 shadow-sm text-center p-4'>
                    <div 
                        className='bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3'
                        style={{ width: '64px', height: '64px' }}
                    >
                        <FileEarmarkText size={32} className='text-primary' />
                    </div>
                    <h6 className='fw-semibold mb-2'>Загрузка документа...</h6>
                    <p className='text-muted small mb-0'>Пожалуйста, подождите</p>
                </Card>
            </div>
        )
    }

    return (
        <div className='min-vh-100 bg-light'>
            <div className='container-fluid py-3 px-4'>
                
                {/* Верхняя панель с информацией о документе */}
                <div className='mb-3'>
                    <div className='d-flex align-items-center justify-content-between flex-wrap gap-3'>
                        {/* Левая часть: кнопка назад и название */}
                        <div className='d-flex align-items-center gap-3'>
                            <Button
                                variant='light'
                                size='sm'
                                className='rounded-pill d-flex align-items-center gap-1'
                                onClick={() => window.history.back()}
                            >
                                <ArrowLeft size={16} />
                                <span className='small'>Назад</span>
                            </Button>
                            
                            <div>
                                <div className='d-flex align-items-center gap-2'>
                                    <FileEarmarkText size={20} className='text-primary' />
                                    <h5 className='fw-semibold mb-0'>
                                        {document.title}
                                    </h5>
                                    <Badge 
                                        bg={isConnected ? 'success' : 'secondary'}
                                        className='rounded-pill px-2 py-1'
                                    >
                                        <small>{isConnected ? '● В реальном времени' : '○ Офлайн'}</small>
                                    </Badge>
                                </div>
                                
                                {/* Мета-информация */}
                                <div className='d-flex flex-wrap align-items-center gap-3 mt-1'>
                                    <span className='text-muted small d-flex align-items-center gap-1'>
                                        <Clock size={12} />
                                        Создан: {formatDate(document.createdAt)}
                                    </span>
                                    
                                    {document.lastUpdated && (
                                        <span className='text-muted small d-flex align-items-center gap-1'>
                                            <PencilSquare size={12} />
                                            Обновлён: {formatDate(document.lastUpdated)}
                                        </span>
                                    )}
                                    
                                    {document.documentAccesses?.length > 0 && (
                                        <OverlayTrigger
                                            placement='bottom'
                                            overlay={
                                                <Tooltip>
                                                    {document.documentAccesses.map(a => a.email).join(', ')}
                                                </Tooltip>
                                            }
                                        >
                                            <span className='text-muted small d-flex align-items-center gap-1'>
                                                <People size={12} />
                                                {document.documentAccesses.length} соавтор(ов)
                                            </span>
                                        </OverlayTrigger>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Правая часть: статус и действия */}
                        <div className='d-flex align-items-center gap-2'>
                            {/* Индикатор набора текста */}
                            {typingUser && (
                                <div className='bg-info bg-opacity-10 rounded-pill px-3 py-1'>
                                    <span className='small text-info d-flex align-items-center gap-1'>
                                        <PencilSquare size={12} />
                                        {typingUser} печатает...
                                    </span>
                                </div>
                            )}
                            
                            {/* Переключатель предпросмотра */}
                            <OverlayTrigger
                                placement='bottom'
                                overlay={<Tooltip>{showPreview ? 'Скрыть предпросмотр' : 'Показать предпросмотр'}</Tooltip>}
                            >
                                <Button
                                    variant='light'
                                    size='sm'
                                    className='rounded-pill d-flex align-items-center gap-1'
                                    onClick={() => setShowPreview(!showPreview)}
                                >
                                    {showPreview ? <Eye size={14} /> : <EyeSlash size={14} />}
                                    <span className='small'>Предпросмотр</span>
                                </Button>
                            </OverlayTrigger>
                        </div>
                    </div>
                </div>

                {/* Карточка со статистикой документа (опционально) */}
                <Card className='border-0 shadow-sm mb-3 bg-white'>
                    <Card.Body className='p-3'>
                        <div className='row g-3 align-items-center'>
                            <div className='col-auto'>
                                <div 
                                    className='bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center'
                                    style={{ width: '40px', height: '40px' }}
                                >
                                    <InfoCircle size={20} className='text-primary' />
                                </div>
                            </div>
                            <div className='col'>
                                <div className='d-flex flex-wrap align-items-center gap-4'>
                                    <div>
                                        <div className='small text-muted'>Владелец</div>
                                        <div className='small fw-medium d-flex align-items-center gap-1'>
                                            <Person size={12} />
                                            {document.owner?.username || user?.username || '—'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className='small text-muted'>Статус</div>
                                        <div className='small fw-medium'>
                                            {document.documentAccesses?.length > 0 ? '👥 Совместный' : '📄 Личный'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className='small text-muted'>Доступ</div>
                                        <div className='small fw-medium'>
                                            {document.isPublic ? 'Публичный' : 'По приглашению'}
                                        </div>
                                    </div>
                                    {document.documentAccesses?.length > 0 && (
                                        <div>
                                            <div className='small text-muted'>Соавторы</div>
                                            <div className='d-flex align-items-center gap-1 flex-wrap'>
                                                {document.documentAccesses.slice(0, 3).map(access => (
                                                    <Badge key={access.id} bg='light' text='dark' className='rounded-pill'>
                                                        {access.username || access.email?.split('@')[0]}
                                                    </Badge>
                                                ))}
                                                {document.documentAccesses.length > 3 && (
                                                    <Badge bg='light' text='dark' className='rounded-pill'>
                                                        +{document.documentAccesses.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Редактор */}
                <Card className='border-0 shadow-sm overflow-hidden'>
                    <Card.Body className='p-0'>
                        <div data-color-mode='light'>
                            <MDEditor
                                value={content}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                preview={showPreview ? 'live' : 'edit'}
                                hideToolbar={false}
                                visibleDragbar={true}
                                previewOptions={{
                                    rehypePlugins: [[rehypeSanitize]]
                                }}
                                height={showPreview ? 'calc(100vh - 280px)' : 'calc(100vh - 220px)'}
                                style={{ borderRadius: '0.5rem' }}
                            />
                        </div>
                    </Card.Body>
                </Card>

                {/* Подсказка по навигации */}
                <div className='text-center mt-3'>
                    <p className='text-muted small mb-0'>
                        Совместный редактор документов. Все изменения сохраняются автоматически
                    </p>
                </div>
            </div>
        </div>
    )
}

export { EditorPage, EditorPage as default }