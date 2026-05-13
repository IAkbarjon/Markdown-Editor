import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Form, Modal } from 'react-bootstrap'
import { FileEarmarkText, PlusCircle, PencilSquare, Trash, People, PersonPlus, XLg, Check, Clock, Person } from 'react-bootstrap-icons'
import useNotification from '../hooks/useNotification'
import useUser from '../hooks/useUser'
import httpService from '../services/httpService'

function DocumentsPage() {
    const { user, setUser } = useUser()
    const navigate = useNavigate()
    const notification = useNotification()

    // Моковые данные — заменить на API
    // const [documents, setDocuments] = useState([
    //     { 
    //         id: 1, 
    //         title: 'API Documentation', 
    //         content: '# API Docs\n...', 
    //         updatedAt: '2026-12-20T10:30:00',
    //         sharedWith: [
    //             { id: 1, username: 'alex_dev', email: 'alex@example.com', access: 'write' },
    //             { id: 2, username: 'maria_qa', email: 'maria@example.com', access: 'read' }
    //         ]
    //     }, { 
    //         id: 2, 
    //         title: 'Project Roadmap', 
    //         content: '# Roadmap\n...', 
    //         updatedAt: '2026-12-19T16:00:00',
    //         sharedWith: [
    //             { id: 3, username: 'ivan_lead', email: 'ivan@example.com', access: 'write' }
    //         ]
    //     }, { 
    //         id: 3, 
    //         title: 'Meeting Notes', 
    //         content: '# Notes\n...', 
    //         updatedAt: '2026-12-18T09:15:00',
    //         sharedWith: []
    //     },
    // ])

    // Состояния модалок
    const [showCreate, setShowCreate] = useState(false)
    const [showEdit, setShowEdit] = useState(null)
    const [showDelete, setShowDelete] = useState(null)
    const [showShare, setShowShare] = useState(null)
    
    // Формы
    const [newTitle, setNewTitle] = useState('')
    const [editTitle, setEditTitle] = useState('')
    const [shareEmail, setShareEmail] = useState('')
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
                setShowCreate(false)
                notification.success('Документ создан')
                // Редирект в редактор
                navigate(`/editor?id=${res.data.id}`)
            })
            .catch(err => {
                console.error(err)
                notification.error("Не удалось создать документ")
            })
        
    }

    // Редактирование названия
    const handleEdit = (id) => {
        if (!editTitle.trim()) {
            notification.warning('Введите название')
            return
        }
        
        // PUT /api/documents/{id}
        // setDocuments(prev => prev.map(doc => 
        //     doc.id === id ? { ...doc, title: editTitle.trim() } : doc
        // ))
        
        setShowEdit(null)
        setEditTitle('')
        notification.success('Название обновлено')
    }

    // Удаление
    const handleDelete = (id) => {
        // DELETE /api/documents/{id}
        // setDocuments(prev => prev.filter(doc => doc.id !== id))
        setShowDelete(null)
        notification.success('Документ удалён')
    }

    // Раздача прав
    const handleShare = (docId) => {
        if (!shareEmail.trim()) {
            notification.warning('Введите email пользователя')
            return
        }

        // POST /api/documents/{docId}/share
        const newAccess = {
        id: Date.now(),
        username: shareEmail.split('@')[0],
        email: shareEmail.trim(),
        access: shareAccess
        }

        // setDocuments(prev => prev.map(doc => 
        // doc.id === docId 
        //     ? { ...doc, sharedWith: [...doc.sharedWith, newAccess] }
        //     : doc
        // ))

        setShareEmail('')
        setShareAccess('write')
        notification.success('Доступ предоставлен')
    }

    // Удаление доступа
    const handleRemoveAccess = (docId, accessId) => {
        // DELETE /api/documents/{docId}/access/{accessId}
        // setDocuments(prev => prev.map(doc => 
        // doc.id === docId
        //     ? { ...doc, sharedWith: doc.sharedWith.filter(a => a.id !== accessId) }
        //     : doc
        // ))
        notification.info('Доступ отозван')
    }

    return (
        <div className='min-vh-100 bg-light'>
            <div className='container py-4' style={{ maxWidth: '900px' }}>
            
                {/* Заголовок и кнопка создания */}
                <div className='d-flex align-items-center justify-content-between mb-4'>
                    <div>
                        <h5 className='fw-semibold mb-1'>Мои документы</h5>
                        <p className='text-muted small mb-0'>
                            {user?.documents?.length} {user?.documents?.length === 1 ? 'документ' : 
                            user?.documents?.length < 5 ? 'документа' : 'документов'}
                        </p>
                    </div>
                    
                    <Button
                        variant='dark'
                        size='sm'
                        className='rounded-pill px-3 d-flex align-items-center gap-2'
                        onClick={() => setShowCreate(true)}
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
                            onClick={() => setShowCreate(true)}
                        >
                            <PlusCircle size={14} className='me-1' />
                            Создать документ
                        </Button>
                    </Card.Body>
                    </Card>
                ) : (
                    <div className='d-flex flex-column gap-2'>
                        {user?.documents?.map(doc => (
                            <Card key={doc.id} className='border-0 shadow-sm'>
                                <Card.Body className='p-3'>
                                    <div className='d-flex align-items-center gap-3'>
                                        {/* Иконка и основная информация */}
                                        <div 
                                            className='flex-grow-1 d-flex align-items-center gap-3'
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/editor?id=${doc.id}`)}
                                        >
                                            <div className='bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0'>
                                            <FileEarmarkText size={18} className='text-primary' />
                                            </div>
                                            
                                            <div className='min-w-0 flex-grow-1'>
                                            <div className='fw-medium small text-truncate'>
                                                {doc.title}
                                            </div>
                                            <div className='d-flex align-items-center gap-3 mt-1'>
                                                <span className='text-muted small d-flex align-items-center gap-1'>
                                                <Clock size={12} />
                                                {new Date(doc.lastUpdated).toLocaleDateString('ru-RU', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                                </span>
                                                {doc.documentAccesses.length > 0 && (
                                                <span className='text-muted small d-flex align-items-center gap-1'>
                                                    <People size={12} />
                                                    {doc.sharedWith.length}
                                                </span>
                                                )}
                                            </div>
                                            </div>
                                        </div>

                                        {/* Кнопки действий */}
                                        <div className='d-flex align-items-center gap-1 flex-shrink-0'>
                                            <Button
                                            variant='light'
                                            size='sm'
                                            className='rounded-pill d-flex align-items-center gap-1'
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setShowShare(doc.id)
                                            }}
                                            >
                                            <PersonPlus size={14} />
                                            </Button>
                                            
                                            <Button
                                            variant='light'
                                            size='sm'
                                            className='rounded-pill d-flex align-items-center gap-1'
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setEditTitle(doc.title)
                                                setShowEdit(doc.id)
                                            }}
                                            >
                                            <PencilSquare size={14} />
                                            </Button>
                                            
                                            <Button
                                            variant='light'
                                            size='sm'
                                            className='rounded-pill d-flex align-items-center gap-1 text-danger'
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setShowDelete(doc.id)
                                            }}
                                            >
                                            <Trash size={14} />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Список пользователей с доступом */}
                                    {doc.documentAccesses.length > 0 && (
                                        <div className='mt-2 pt-2 border-top'>
                                            <div className='d-flex flex-wrap gap-1'>
                                            {doc.sharedWith.map(access => (
                                                <div
                                                    key={access.id}
                                                    className='d-flex align-items-center gap-1 bg-light rounded-pill px-2 py-1'
                                                >
                                                    <Person size={10} className='text-muted' />
                                                    <span className='small text-muted'>
                                                        {access.username}
                                                    </span>
                                                    <span className='text-muted small'>
                                                        ({access.access === 'write' ? 'редактор' : 'читатель'})
                                                    </span>
                                                    <Button
                                                        variant='link'
                                                        size='sm'
                                                        className='p-0 lh-1 text-muted'
                                                        onClick={() => handleRemoveAccess(doc.id, access.id)}
                                                    >
                                                        <XLg size={10} />
                                                    </Button>
                                                </div>
                                            ))}
                                            </div>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Модалка создания */}
            <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
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
                            setShowCreate(false)
                            setNewTitle('')
                            }}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant='dark'
                            size='sm'
                            className='rounded-pill px-3'
                            onClick={handleCreate}
                        >
                            Создать
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Модалка редактирования названия */}
            <Modal show={showEdit !== null} onHide={() => setShowEdit(null)} centered>
                <Modal.Body className='p-4'>
                    <h6 className='fw-semibold mb-3'>Переименовать документ</h6>
                    <Form.Group className='mb-3'>
                    <Form.Control
                        type='text'
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder='Новое название'
                        className='rounded-pill px-3 py-2'
                        onKeyDown={(e) => e.key === 'Enter' && handleEdit(showEdit)}
                        autoFocus
                    />
                    </Form.Group>
                    <div className='d-flex gap-2 justify-content-end'>
                        <Button
                            variant='light'
                            size='sm'
                            className='rounded-pill px-3'
                            onClick={() => {
                            setShowEdit(null)
                            setEditTitle('')
                            }}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant='dark'
                            size='sm'
                            className='rounded-pill px-3'
                            onClick={() => handleEdit(showEdit)}
                        >
                            Сохранить
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Модалка удаления */}
            <Modal show={showDelete !== null} onHide={() => setShowDelete(null)} centered>
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
                        {user?.documents?.find(d => d.id === showDelete)?.sharedWith.length > 0 && 
                            ' Доступ у соавторов также будет отозван.'}
                        </p>
                        <div className='d-flex gap-2 justify-content-center'>
                        <Button
                            variant='light'
                            size='sm'
                            className='rounded-pill px-3'
                            onClick={() => setShowDelete(null)}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant='danger'
                            size='sm'
                            className='rounded-pill px-3'
                            onClick={() => handleDelete(showDelete)}
                        >
                            Удалить
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Модалка раздачи прав */}
            <Modal show={showShare !== null} onHide={() => setShowShare(null)} centered>
                <Modal.Body className='p-4'>
                    <h6 className='fw-semibold mb-3'>
                    Доступ к документу
                    </h6>

                    {/* Текущие пользователи */}
                    {user?.documents?.find(d => d.id === showShare)?.sharedWith.length > 0 && (
                    <div className='mb-3'>
                        <p className='small fw-medium text-secondary mb-2'>Текущий доступ:</p>
                        {user?.documents
                            ?.find(d => d.id === showShare)
                            ?.sharedWith.map(access => (
                                <div
                                    key={access.id}
                                    className='d-flex align-items-center justify-content-between bg-light rounded-3 p-2 mb-1'
                                >
                                    <div className='d-flex align-items-center gap-2'>
                                        <Person size={14} className='text-muted' />
                                        <div>
                                            <div className='small fw-medium'>{access.username}</div>
                                            <div className='small text-muted'>{access.email}</div>
                                        </div>
                                    </div>
                                    <div className='d-flex align-items-center gap-2'>
                                        <span className='small text-muted'>
                                            {access.access === 'write' ? 'Редактор' : 'Читатель'}
                                        </span>
                                        <Button
                                            variant='link'
                                            size='sm'
                                            className='p-0 text-muted'
                                            onClick={() => showShare && handleRemoveAccess(showShare, access.id)}
                                        >
                                            <XLg size={12} />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    )}

                    {/* Форма добавления */}
                    <Form.Group className='mb-2'>
                        <Form.Label className='small fw-medium text-secondary'>
                            Email пользователя
                        </Form.Label>
                        <Form.Control
                            type='email'
                            value={shareEmail}
                            onChange={(e) => setShareEmail(e.target.value)}
                            placeholder='user@example.com'
                            className='rounded-pill px-3 py-2'
                        />
                    </Form.Group>

                    <Form.Group className='mb-3'>
                        <Form.Label className='small fw-medium text-secondary'>
                            Уровень доступа
                        </Form.Label>
                        <Form.Select
                            value={shareAccess}
                            onChange={(e) => setShareAccess(e.target.value)}
                            className='rounded-pill px-3 py-2'
                        >
                            <option value='write'>Редактор (чтение и запись)</option>
                            <option value='read'>Читатель (только чтение)</option>
                        </Form.Select>
                    </Form.Group>

                    <Button
                        variant='dark'
                        size='sm'
                        className='w-100 rounded-pill py-2 mb-2'
                        onClick={() => showShare && handleShare(showShare)}
                    >
                        <PersonPlus size={14} className='me-1' />
                        Предоставить доступ
                    </Button>

                    <Button
                    variant='light'
                    size='sm'
                    className='w-100 rounded-pill'
                    onClick={() => {
                        setShowShare(null)
                        setShareEmail('')
                        setShareAccess('write')
                    }}
                    > Закрыть</Button>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default DocumentsPage
