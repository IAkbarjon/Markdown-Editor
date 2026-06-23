import { Button, Card, Badge } from 'react-bootstrap'
import { Clock, FileEarmarkText, PencilSquare, People, Person, PersonPlus, Trash, XLg, PersonBadge } from 'react-bootstrap-icons'
import { useNavigate } from 'react-router-dom'

function DocumentView({ doc, owner, handleGetAccess, handleRename, handleDelete, handleRemoveAccess, stranger = false }) {
    const navigate = useNavigate()
    
    // Форматирование даты
    const formatDate = (dateString) => {
        if (!dateString) return '—'
        const date = new Date(dateString)
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Получаем имя владельца
    const getOwnerName = () => {
        if (!owner) return 'Неизвестный владелец'
        
        if (owner.firstName && owner.lastName) {
            return `${owner.firstName} ${owner.lastName}`
        }
        return owner.username || owner.email || 'Неизвестный владелец'
    }

    // Получаем инициалы владельца для аватарки
    const getOwnerInitials = () => {
        if (!owner) return '?'
        
        if (owner.firstName && owner.lastName) {
            return `${owner.firstName[0]}${owner.lastName[0]}`
        }
        if (owner.username) {
            return owner.username.substring(0, 2).toUpperCase()
        }
        if (owner.email) {
            return owner.email.substring(0, 2).toUpperCase()
        }
        return '?'
    }

    return (
        <Card className='border-0 shadow-sm'>
            <Card.Body className='p-3'>
                <div className='d-flex align-items-center gap-3'>
                    <div 
                        className='flex-grow-1 d-flex align-items-center gap-3'
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/editor?document=${doc.id}`)}
                    >
                        <div className='bg-primary bg-opacity-10 rounded-circle p-2 flex-shrink-0'>
                            <FileEarmarkText size={18} className='text-primary' />
                        </div>
                        
                        <div className='min-w-0 flex-grow-1'>
                            <div className='d-flex align-items-center gap-2'>
                                <div className='fw-medium small text-truncate'>
                                    {doc.title}
                                </div>
                                
                                {/* Отображение владельца для чужих документов */}
                                {stranger && owner && (
                                    <Badge 
                                        bg="secondary" 
                                        className='rounded-pill d-flex align-items-center gap-1 flex-shrink-0'
                                        style={{ fontSize: '10px', padding: '3px 8px' }}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            navigate(`/user/${owner.username}`)
                                        }}
                                    >
                                        <PersonBadge size={10} />
                                        <span>{getOwnerName()}</span>
                                    </Badge>
                                )}
                            </div>
                            
                            <div className='d-flex align-items-center gap-3 mt-1'>
                                <span className='text-muted small d-flex align-items-center gap-1'>
                                    <Clock size={12} />
                                    {formatDate(doc.lastUpdated)}
                                </span>
                                
                                {doc?.documentAccesses?.length > 0 && (
                                    <span className='text-muted small d-flex align-items-center gap-1'>
                                        <People size={12} />
                                        {doc?.documentAccesses?.length || 0}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className='d-flex align-items-center gap-1 flex-shrink-0'>
                        {/* Для чужих документов показываем только кнопку удаления доступа */}
                        {stranger ? (
                            <Button
                                variant='light'
                                size='sm'
                                className='rounded-pill d-flex align-items-center gap-1 text-danger'
                                title='отказаться от доступа'
                                onClick={handleDelete}
                            >
                                <XLg size={14} />
                                <span className='small'>Отказаться</span>
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant='light'
                                    size='sm'
                                    className='rounded-pill d-flex align-items-center gap-1'
                                    title='дать доступ'
                                    onClick={handleGetAccess}
                                >
                                    <PersonPlus size={14} />
                                </Button>
                                
                                <Button
                                    variant='light'
                                    size='sm'
                                    className='rounded-pill d-flex align-items-center gap-1'
                                    title='переименовать'
                                    onClick={handleRename}
                                >
                                    <PencilSquare size={14} />
                                </Button>
                                
                                <Button
                                    variant='light'
                                    size='sm'
                                    className='rounded-pill d-flex align-items-center gap-1 text-danger'
                                    title='удалить'
                                    onClick={handleDelete}
                                >
                                    <Trash size={14} />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Отображение списка доступов */}
                {doc.documentAccesses?.length > 0 && (
                    <div className='mt-2 pt-2 border-top'>
                        <div className='d-flex flex-wrap gap-1'>
                            {doc.documentAccesses.map(access => (
                                <div
                                    key={access.id}
                                    className='d-flex align-items-center gap-1 bg-light rounded-pill px-2 py-1'
                                >
                                    <Person size={10} className='text-muted' />
                                    <span className='small text-muted'>
                                        {access.user?.username || access.username || 'Неизвестный'}
                                    </span>
                                    
                                    {/* Отображаем уровень доступа */}
                                    {access.accessLevel && (
                                        <Badge
                                            bg={access.accessLevel === 1 ? 'success' : 'info'}
                                            className='rounded-pill'
                                            style={{ fontSize: '8px', padding: '1px 6px' }}
                                        >
                                            {access.accessLevel === 1 ? '✏️' : '👁️'}
                                        </Badge>
                                    )}
                                    
                                    {/* Кнопка удаления доступа только для владельцев */}
                                    {!stranger && (
                                        <Button
                                            variant='link'
                                            size='sm'
                                            className='p-0 lh-1 text-muted'
                                            onClick={() => handleRemoveAccess(doc.id, access.id)}
                                        >
                                            <XLg size={10} />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    )
}

export default DocumentView
