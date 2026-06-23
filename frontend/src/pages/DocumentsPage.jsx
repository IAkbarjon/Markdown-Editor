import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button, Card, Form, Modal, InputGroup, Spinner, Badge } from 'react-bootstrap'
import { FileEarmarkText, PlusCircle, PencilSquare, Trash, People, PersonPlus, XLg, Check, Clock, Person, Search, X, PersonCheck, XCircle } from 'react-bootstrap-icons'
import useNotification from '../hooks/useNotification'
import useUser from '../hooks/useUser'
import httpService from '../services/httpService'
import DocumentView from '../components/ui/DocumentView'

function DocumentsPage() {
    const { user, setUser, setIsLoading } = useUser()
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const notification = useNotification()
    
    // Формы
    const [newTitle, setNewTitle] = useState('')
    const [editTitle, setEditTitle] = useState('')
    const selectedDocId = Number(searchParams.get('selected'))
    const currentDocument = user?.document?.find(d => d.id === selectedDocId)
    
    // Состояния для выдачи прав
    const [shareQuery, setShareQuery] = useState('')
    const [shareResults, setShareResults] = useState([])
    const [isSearchingShare, setIsSearchingShare] = useState(false)
    const [shareAccess, setShareAccess] = useState('write')

    // Создание документа
    const handleCreate = () => {
        if (!newTitle.trim()) {
            notification.warning('Введите название документа')
            return
        }

        const newDoc = {
            title: newTitle.trim(),
            ownerId: user.id
        }

        httpService.post('/document', newDoc)
            .then(res => {
                setNewTitle('')
                setSearchParams(prev => ({ ...prev, mode: 'none' }))
                notification.success('Документ создан')
                setUser(prev => ({
                    ...prev,
                    documents: [...prev.documents ?? [], res.data]
                }))
                navigate(`/editor?document=${res.data.id}`)
            })
            .catch(err => {
                console.error(err)
                notification.error("Не удалось создать документ")
            })
    }

    // Редактирование названия
    const handleEdit = () => {
        if (!editTitle.trim()) {
            notification.warning('Введите название')
            return
        }

        const documentId = selectedDocId

        setIsLoading(true)
        httpService.patch(`/document/rename/${documentId}/${editTitle}`)
            .then(res => {
                setUser(prev => ({
                    ...prev,
                    documents: prev.documents.map(doc => doc.id === res.data.id ? { ...res.data, documentAccesses: [] } : doc)
                }))
                setSearchParams(prev => ({ ...prev, mode: 'none' }))
                notification.success('Название документа успешно обновлено')
            })
            .catch(err => {
                console.error(err)
                notification.error('Не удалось переименовать документ')
            })
            .finally(() => setIsLoading(false))
    }

    // Удаление
    const handleDelete = (id) => {
        setIsLoading(true)
        httpService.delete(`/document/delete/${id}`)
            .then(() => {
                setUser(prev => ({
                    ...prev,
                    documents: prev.documents.filter(doc => doc.id != id)
                }))
                setSearchParams(prev => ({ ...prev, mode: 'none' }))
                notification.success('Документ успешно удален')
            })
            .catch(err => {
                console.error(err)
                notification.error('Не удалось удалить документ')
            })
            .finally(() => setIsLoading(false))
    }

    // Поиск пользователей для выдачи прав
    const searchUsersForShare = useCallback(async (query) => {
        if (query.length < 2) {
            setShareResults([])
            return
        }

        setIsSearchingShare(true)
        try {
            const response = await httpService.get(`/users/search/${query}`)
            setShareResults(response.data || [])
        } catch (error) {
            console.error('Search error:', error)
            notification.error('Ошибка поиска пользователей')
        } finally {
            setIsSearchingShare(false)
        }
    }, [notification])

    // Выдача доступа
    const handleShare = useCallback((documentId, userId) => {
        setIsLoading(true)
        httpService.post(`/document/access`, {
            documentId: selectedDocId,
            userId: userId,
            accessLevel: shareAccess === 'write' ? 1 : 2
        })
            .then(res => {
                notification.success('Доступ выдан успешно')

                // Обновляем документ в списке
                const updatedDoc = user.documents.find(d => d.id === documentId)
                if (updatedDoc) {
                    setUser(prev => ({
                        ...prev,
                        documents: prev.documents.map(doc =>
                            doc.id === documentId
                                ? { ...doc, documentAccesses: [...doc.documentAccesses, res.data] }
                                : doc
                        )
                    }))
                }

                // Очищаем поиск
                setShareQuery('')
                setShareResults([])
                navigate('/documents')
            })
            .catch(err => {
                notification.error(err.response?.data?.message || 'Ошибка выдачи доступа')
            })
            .finally(() => setIsLoading(false))
    }, [shareAccess, shareResults, user, notification, setUser])


    // Удаление доступа
    const handleRemoveAccess = useCallback((documentId, accessId) => {
        setIsLoading(true)
        httpService.delete(`/document/access/${accessId}`)
            .then(() => {
                setUser(prev => ({
                    ...prev,
                    documents: prev.documents.map(doc =>
                        doc.id === documentId
                            ? {
                                ...doc,
                                documentAccesses: doc.documentAccesses.filter(a => a.id != accessId)
                            }
                            : doc
                    )
                }))
                notification.success('Доступ успешно отозван')
            })
            .catch(err => {
                console.error(err)
                notification.error('Ошибка при отзыве доступа')
            })
            .finally(() => setIsLoading(false))
    }, [notification, setUser])

    // Получение инициалов
    const getInitials = (firstName, lastName, username) => {
        if (firstName && lastName) {
            return `${firstName[0]}${lastName[0]}`.toUpperCase()
        }
        if (firstName) {
            return firstName[0].toUpperCase()
        }
        return (username || 'U')[0].toUpperCase()
    }

    // При открытии модалки получаем выбранный документ
    useEffect(() => {
        if (searchParams.get('mode') === 'share') {
            const docId = selectedDocId
            if (docId) {
                const doc = user?.documents?.find(d => d.id === docId)
            }
        } else {
            setShareQuery('')
            setShareResults([])
        }
    }, [searchParams, user])

    return (
        <div className='min-vh-100 bg-light'>
            <div className='container py-4' style={{ maxWidth: '900px' }}>
            
                {/* Заголовок и кнопка создания */}
                <div className='d-flex align-items-center justify-content-between mb-4'>
                    <div>
                        <h5 className='fw-semibold mb-1'>Мои документы</h5>
                        <p className='text-muted small mb-0'>
                            {user?.documents?.length} {user?.documents?.length === 1
                                ? 'документ'
                                : user?.documents?.length < 5 ? 'документа' : 'документов'}
                        </p>
                    </div>
                    
                    <Button
                        variant='dark'
                        size='sm'
                        className='rounded-pill px-3 d-flex align-items-center gap-2'
                        onClick={() => setSearchParams(prev => ({ ...prev, mode: 'create' }))}
                    >
                        <PlusCircle size={16} />
                        Создать
                    </Button>
                </div>

                {/* Список документов */}
                {user?.documents?.length === 0 ? (
                    <Card className='border-0 shadow-sm'>
                        <Card.Body className='text-center py-5'>
                            <FileEarmarkText size={48} className='text-muted opacity-25 mb-3' />
                            <h6 className='text-muted mb-2'>Нет документов</h6>
                            <p className='text-muted small mb-3'>
                                Создайте первый документ и начните работу
                            </p>
                            <Button
                                variant='outline-dark'
                                size='sm'
                                className='rounded-pill'
                                onClick={() => setSearchParams(prev => ({ ...prev, mode: 'create' }))}
                            >
                                <PlusCircle size={14} className='me-1' />
                                Создать документ
                            </Button>
                        </Card.Body>
                    </Card>
                ) : (
                    <div className='d-flex flex-column gap-2'>
                        {/* Собственные документы пользователя */}
                        {user?.documents?.map(doc => (
                            <DocumentView
                                key={doc.id}
                                doc={doc}
                                handleGetAccess={(e) => {
                                    e.stopPropagation()
                                    setSearchParams(prev => ({ ...prev, mode: 'share', selected: doc.id }))
                                }}
                                handleRename={(e) => {
                                    e.stopPropagation()
                                    setEditTitle(doc.title)
                                    setSearchParams(prev => ({ ...prev, mode: 'edit', selected: doc.id }))
                                }}
                                handleDelete={(e) => {
                                    e.stopPropagation()
                                    setSearchParams(prev => ({ ...prev, mode: 'delete', selected: doc.id }))
                                }}
                                handleRemoveAccess={handleRemoveAccess}
                            />
                        ))}
                        
                        {/* Документы, к которым есть доступ */}
                        {user.accessToDocuments?.map(access => (
                            <DocumentView
                                key={`access-${access.id}`}
                                doc={access.document}
                                owner={access.owner} // Передаем владельца
                                handleGetAccess={(e) => {
                                    e.stopPropagation()
                                    setSearchParams(prev => ({ ...prev, mode: 'share', selected: access.document.id }))
                                }}
                                handleRename={(e) => {
                                    e.stopPropagation()
                                    setEditTitle(access.document.title)
                                    setSearchParams(prev => ({ ...prev, mode: 'edit', selected: access.document.id }))
                                }}
                                handleDelete={(e) => {
                                    e.stopPropagation()
                                    // Для чужих документов - отказ от доступа
                                    handleRemoveAccess(access.document.id, access.id)
                                }}
                                handleRemoveAccess={handleRemoveAccess}
                                stranger={true}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Модалка создания */}
            <Modal show={searchParams.get('mode') === 'create'} onHide={() => navigate(-1)} centered>
                <Modal.Body className='p-4'>
                    <h6 className='fw-semibold mb-3'>Новый документ</h6>
                    <Form.Group className='mb-3'>
                        <Form.Label className='small fw-medium text-secondary'>
                            Название
                        </Form.Label>
                        <Form.Control
                            type='text'
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder='Введите название документа'
                            className='rounded-pill px-3 py-2'
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            autoFocus
                        />
                    </Form.Group>
                    <div className='d-flex gap-2 justify-content-end'>
                        <Button
                            variant='light'
                            size='sm'
                            className='rounded-pill px-3'
                            onClick={() => {
                                setNewTitle('')
                                navigate(-1)
                            }}
                        > Отмена</Button>
                        <Button
                            variant='dark'
                            size='sm'
                            className='rounded-pill px-3'
                            onClick={handleCreate}
                        > Создать</Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Модалка редактирования названия */}
            <Modal show={searchParams.get('mode') === 'edit'} onHide={() => setSearchParams(prev => ({ ...prev, mode: 'none' }))} centered>
                <Modal.Body className='p-4'>
                    <h6 className='fw-semibold mb-3'>Переименовать документ</h6>
                    <Form.Group className='mb-3'>
                        <Form.Control
                            type='text'
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder='Новое название'
                            className='rounded-pill px-3 py-2'
                            onKeyDown={(e) => e.key === 'Enter' && handleEdit(selectedDocId)}
                            autoFocus
                        />
                    </Form.Group>
                    <div className='d-flex gap-2 justify-content-end'>
                        <Button
                            variant='light'
                            size='sm'
                            className='rounded-pill px-3'
                            onClick={() => {
                                setSearchParams(prev => ({ ...prev, mode: 'none' }))
                            }}
                        > Отмена</Button>
                        <Button
                            variant='dark'
                            size='sm'
                            className='rounded-pill px-3'
                            onClick={() => handleEdit(selectedDocId)}
                            disabled={!editTitle.trim()}
                        > Сохранить</Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Модалка удаления */}
            <Modal show={searchParams.get('mode') === 'delete'} onHide={() => setSearchParams(prev => ({ ...prev, mode: 'none' }))} size='sm' centered>
                <Modal.Body className='p-4 text-center'>
                    <div
                        className='bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3'
                        style={{ width: '48px', height: '48px' }}
                    >
                        <Trash size={24} className='text-danger' />
                    </div>
                    <h6 className='fw-semibold mb-2'>Удалить документ?</h6>
                    <p className='text-muted small mb-3'>
                        Это действие нельзя отменить.
                    </p>
                    <div className='d-flex gap-2 justify-content-center'>
                        <Button
                            variant='light'
                            size='sm'
                            className='rounded-pill px-3'
                            onClick={() => setSearchParams(prev => ({ ...prev, mode: 'none' }))}
                        > Отмена</Button>
                        <Button
                            variant='danger'
                            size='sm'
                            className='rounded-pill px-3'
                            onClick={() => handleDelete(selectedDocId)}
                        > Удалить</Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Новая модалка выдачи прав */}
            <Modal
                size='lg'
                show={searchParams.get('mode') === 'share'}
                onHide={() => {
                    setSearchParams(prev => ({ ...prev, mode: 'none' }))
                    setShareQuery('')
                    setShareResults([])
                }}
                centered
            >
                <Modal.Body className='p-0'>
                    <div className='p-4 border-bottom'>
                        <div className='d-flex align-items-center justify-content-between mb-3'>
                            <h6 className='fw-semibold mb-0 d-flex align-items-center gap-2'>
                                <PersonPlus size={18} className='text-primary' />
                                Выдать доступ к документу
                            </h6>
                            <Button
                                variant='link'
                                size='sm'
                                className='p-0 text-muted'
                                onClick={() => {
                                    setSearchParams(prev => ({ ...prev, mode: 'none' }))
                                    setShareQuery('')
                                    setShareResults([])
                                }}
                            > <X size={20} /></Button>
                        </div>
                        
                        <InputGroup>
                            <Form.Control
                                type='text'
                                value={shareQuery}
                                onChange={(e) => {
                                    setShareQuery(e.target.value)
                                }}
                                placeholder='Введите username или email для поиска...'
                                className='rounded-pill py-2'
                                autoFocus
                            />
                            <Button
                                size='sm'
                                variant='dark' 
                                className='rounded-pill ms-2 px-4'
                                onClick={() => searchUsersForShare(shareQuery)}
                                disabled={shareQuery.length < 2}
                            >
                                <div className='flex items-center'>
                                    <Search size={16} className='me-1' />
                                    Найти
                                </div>
                            </Button>
                        </InputGroup>
                    </div>

                    <div className='p-4' style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {isSearchingShare ? (
                            <div className='text-center py-5'>
                                <Spinner size='sm' className='mb-2' />
                                <p className='text-muted small mb-0'>Поиск...</p>
                            </div>
                        ) : shareQuery.length >= 2 && shareResults.length > 0 ? (
                            <>
                                <div className='small text-muted mb-2'>
                                    Найдено: {shareResults.length}
                                </div>
                                <div className='d-flex flex-column gap-2'>
                                    {shareResults.map(userResult => {
                                        const hasAccess = user.documents?.find(doc => doc.id == selectedDocId)?.documentAccesses?.find(
                                            access => access.userId === userResult.id
                                        )
                                        
                                        return (
                                            <div
                                                key={userResult.id}
                                                className='d-flex align-items-center justify-content-between p-3 rounded-3 border hover-shadow transition'
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
                                                
                                                <div className='d-flex align-items-center gap-2'>
                                                    <Form.Select
                                                        size='sm'
                                                        value={shareAccess}
                                                        onChange={(e) => setShareAccess(e.target.value)}
                                                        className='rounded-pill'
                                                        style={{ width: '140px' }}
                                                    >
                                                        <option value='write'>Редактор</option>
                                                        <option value='read'>Читатель</option>
                                                    </Form.Select>
                                                    <Button
                                                        variant={hasAccess ? 'secondary' : 'dark'}
                                                        size='sm'
                                                        className='rounded-pill px-3'
                                                        onClick={() => {
                                                            if (hasAccess)
                                                                handleRemoveAccess(selectedDocId, hasAccess.id)
                                                            else
                                                                handleShare(user.documents?.find(doc => doc.id == selectedDocId)?.id, userResult.id)
                                                        }}
                                                    >
                                                        <div className="flex items-center">
                                                            {hasAccess ? <XCircle size={14} className='me-1' /> : <PersonPlus />}
                                                            {hasAccess ? 'Отозвать' : 'Выдать'}
                                                        </div>
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </>
                        ) : shareQuery.length >= 2 && shareResults.length === 0 ? (
                            <div className='text-center py-5'>
                                <Person size={48} className='text-muted opacity-25 mb-3' />
                                <p className='text-muted small mb-0'>
                                    Пользователи не найдены
                                </p>
                                <p className='text-muted small'>
                                    Попробуйте изменить поисковый запрос
                                </p>
                            </div>
                        ) : (
                            <div className='text-center py-5'>
                                <PersonPlus size={48} className='text-muted opacity-25 mb-3' />
                                <p className='text-muted small mb-0'>
                                    Начните вводить username или email для поиска
                                </p>
                                <p className='text-muted small'>
                                    Найдите пользователя и выдайте ему доступ к документу
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Текущие пользователи с доступом */}
                    {user.documents?.find(doc => doc.id === selectedDocId)?.documentAccesses?.length > 0 && (
                        <div className='p-4 border-top bg-light'>
                            <div className='d-flex align-items-center justify-content-between mb-2'>
                                <span className='small fw-medium text-secondary'>
                                    Уже имеют доступ ({user.documents?.find(doc => doc.id === selectedDocId).documentAccesses.length})
                                </span>
                            </div>
                            <div className='d-flex flex-wrap gap-2'>
                                {user.documents?.find(doc => doc.id === selectedDocId).documentAccesses.map(access => (
                                    <div
                                        key={access.id}
                                        className='d-flex align-items-center gap-2 bg-white rounded-pill px-3 py-1 border cursor-pointer'
                                        onClick={() => navigate(`/user/${access.user.username}`)}
                                    >
                                        <Person size={12} className='text-muted' />
                                        <span className='small'>
                                            {access.username || access.email}
                                        </span>
                                        <Badge 
                                            bg={access.access === 'write' ? 'primary' : 'secondary'}
                                            className='rounded-pill'
                                        >
                                            {access.user.username}
                                        </Badge>
                                        <Button
                                            variant='link'
                                            size='sm'
                                            className='p-0 text-danger'
                                            onClick={() => handleRemoveAccess(user.documents?.find(doc => doc.id === selectedDocId).id, access.id)}
                                        >
                                            <X size={12} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default DocumentsPage
