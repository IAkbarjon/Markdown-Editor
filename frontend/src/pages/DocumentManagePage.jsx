// src/pages/DocumentManagePage.jsx
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, Button, Table, Badge, Modal, Form, InputGroup, Spinner, Alert } from 'react-bootstrap'
import { ArrowLeft, People, PersonPlus, Trash, Pencil, Check, X, Search, Eye, PencilSquare, ShieldLock, FileEarmarkText, Person } from 'react-bootstrap-icons'
import useUser from '../hooks/useUser'
import useNotification from '../hooks/useNotification'
import httpService from '../services/httpService'
import useDebounce from '../hooks/useDebounce'

function DocumentManagePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const documentId = searchParams.get('id')
  
  const { user, setUser } = useUser()
  const notification = useNotification()
  
  const [document, setDocument] = useState(null)
  const [accessList, setAccessList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Состояния для модалки добавления
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedAccess, setSelectedAccess] = useState('write')
  const [addingUser, setAddingUser] = useState(null)
    
  // Состояния для редактирования прав
  const [editingAccess, setEditingAccess] = useState(null)
  const [editAccessLevel, setEditAccessLevel] = useState('')
  
  const debouncedSearch = useDebounce(searchQuery, 300)
    
  // Загрузка документа и прав доступа
  useEffect(() => {
    if (!documentId) {
      // navigate('/documents')
      return
    }
    fetchDocumentData()
  }, [documentId])
    
  // Поиск пользователей
  useEffect(() => {
    if (debouncedSearch.length >= 2 && showAddModal) {
      searchUsers()
    } else {
      setSearchResults([])
    }
  }, [debouncedSearch, showAddModal])
    
  const fetchDocumentData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Получаем информацию о документе
      const docResponse = await httpService.get(`/documents/${documentId}`)
      setDocument(docResponse.data)
      
      // Получаем список доступа
      const accessResponse = await httpService.get(`/documents/${documentId}/access`)
      setAccessList(accessResponse.data)
    } catch (error) {
      console.error('Error fetching document:', error)
      if (error.response?.status === 403) {
        setError('У вас нет доступа к этому документу')
      } else if (error.response?.status === 404) {
        setError('Документ не найден')
      } else {
        setError('Ошибка загрузки документа')
      }
    } finally {
      setLoading(false)
    }
  }
    
  const searchUsers = async () => {
    setIsSearching(true)
    try {
      const response = await httpService.get(`/users/search?q=${debouncedSearch}&limit=10`)
      // Исключаем пользователей, у которых уже есть доступ
      const existingUserIds = accessList.map(a => a.userId)
      const filtered = response.data.filter(u => !existingUserIds.includes(u.id))
      setSearchResults(filtered)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }
    
  const addAccess = async (userId, accessLevel) => {
    setAddingUser(userId)
    try {
      await httpService.post(`/documents/${documentId}/access`, {
        userId,
        accessLevel
      })
      
      // Обновляем список доступа
      await fetchDocumentData()
      notification.success('Доступ предоставлен')
      setSearchQuery('')
      setSearchResults([])
    } catch (error) {
      console.error('Error adding access:', error)
      notification.error('Не удалось предоставить доступ')
    } finally {
      setAddingUser(null)
    }
  }
    
  const updateAccess = async (accessId, accessLevel) => {
    try {
      await httpService.put(`/documents/${documentId}/access/${accessId}`, {
        accessLevel
      })
      
      await fetchDocumentData()
      notification.success('Права доступа обновлены')
      setEditingAccess(null)
    } catch (error) {
      console.error('Error updating access:', error)
      notification.error('Не удалось обновить права доступа')
    }
  }
    
  const removeAccess = async (accessId, username) => {
    if (!window.confirm(`Удалить доступ пользователя ${username}?`)) {
      return
    }
    
    try {
      await httpService.delete(`/documents/${documentId}/access/${accessId}`)
      
      await fetchDocumentData()
      notification.info(`Доступ пользователя ${username} отозван`)
    } catch (error) {
      console.error('Error removing access:', error)
      notification.error('Не удалось отозвать доступ')
    }
  }
    
  const getAccessLevelText = (level) => {
    switch(level) {
      case 'read': return 'Чтение'
      case 'write': return 'Редактирование'
      case 'owner': return 'Владелец'
      default: return '—'
    }
  }
    
  const getAccessLevelBadge = (level) => {
    switch(level) {
      case 'owner':
        return <Badge bg='dark' className='rounded-pill'>Владелец</Badge>
      case 'write':
        return <Badge bg='primary' className='rounded-pill'>Редактор</Badge>
      case 'read':
        return <Badge bg='secondary' className='rounded-pill'>Читатель</Badge>
      default:
        return <Badge bg='light' className='rounded-pill'>—</Badge>
    }
  }
    
  const getInitials = (firstName, lastName, username) => {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`
    if (firstName) return firstName[0]
    return username?.[0]?.toUpperCase() || 'U'
  }
    
  if (loading) {
    return (
      <div className='min-vh-100 bg-light d-flex align-items-center justify-content-center'>
        <div className="text-center">
          <Spinner variant="primary" />
          <p className="text-muted small mt-2">Загрузка...</p>
        </div>
      </div>
    )
  }
    
  if (error) {
    return (
      <div className='min-vh-100 bg-light py-4'>
        <div className='container' style={{ maxWidth: '900px' }}>
          <Button
            variant='light'
            size='sm'
            className='rounded-pill d-flex align-items-center gap-1 mb-3'
            onClick={() => navigate('/documents')}
          >
            <ArrowLeft size={16} />
            Назад к документам
          </Button>
          
          <Alert variant='danger' className='border-0 shadow-sm'>
            <Alert.Heading className='fs-6'>Ошибка</Alert.Heading>
            <p className='mb-0 small'>{error}</p>
          </Alert>
        </div>
      </div>
    )
  }
    
  const isOwner = document?.ownerId === user?.id
    
  return (
      <div className='min-vh-100 bg-light py-4'>
        <div className='container' style={{ maxWidth: '900px' }}>
            
            {/* Кнопка назад */}
            <Button
                variant='light'
                size='sm'
                className='rounded-pill d-flex align-items-center gap-1 mb-3'
                onClick={() => navigate(`/editor?document=${documentId}`)}
            >
                <ArrowLeft size={16} />
                Назад к редактору
            </Button>
            
            {/* Информация о документе */}
            <Card className='border-0 shadow-sm mb-4'>
                <Card.Body className='p-4'>
                    <div className='d-flex align-items-center gap-3 mb-3'>
                        <div className='bg-primary bg-opacity-10 rounded-circle p-3'>
                            <FileEarmarkText size={24} className='text-primary' />
                        </div>
                        <div>
                            <h5 className='fw-semibold mb-1'>{document?.title}</h5>
                            <div className='text-muted small'>
                                Создан: {new Date(document?.createdAt).toLocaleDateString('ru-RU')}
                            </div>
                        </div>
                    </div>
                </Card.Body>
            </Card>
            
            {/* Управление доступом */}
            <Card className='border-0 shadow-sm'>
                <Card.Body className='p-0'>
                    <div className='p-4 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2'>
                        <div>
                            <h6 className='fw-semibold mb-1 d-flex align-items-center gap-2'>
                                <People size={18} />
                                Доступ к документу
                            </h6>
                            <p className='text-muted small mb-0'>
                                {accessList.length} {accessList.length === 1 ? 'пользователь имеет' : 'пользователей имеют'} доступ
                            </p>
                        </div>
                        
                        {isOwner && (
                            <Button
                                variant='dark'
                                size='sm'
                                className='rounded-pill d-flex align-items-center gap-1'
                                onClick={() => setShowAddModal(true)}
                            >
                                <PersonPlus size={14} />
                                Добавить пользователя
                            </Button>
                        )}
                    </div>
                    
                    <div className='p-0'>
                        {accessList.length === 0 ? (
                            <div className='text-center py-5'>
                                <People size={48} className='text-muted opacity-25 mb-3' />
                                <p className='text-muted small mb-0'>Нет пользователей с доступом</p>
                            </div>
                        ) : (
                            <Table responsive className='mb-0'>
                                <thead className='bg-light'>
                                    <tr>
                                        <th className='border-0 py-3 ps-4'>Пользователь</th>
                                        <th className='border-0 py-3'>Email</th>
                                        <th className='border-0 py-3'>Права доступа</th>
                                        <th className='border-0 py-3 text-end pe-4'>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accessList.map(access => (
                                        <tr key={access.id} className='border-top'>
                                            <td className='py-3 ps-4'>
                                                <div className='d-flex align-items-center gap-2'>
                                                    <div 
                                                        className='bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0'
                                                        style={{ width: '32px', height: '32px' }}
                                                    >
                                                        <span className='small fw-semibold text-primary'>
                                                            {getInitials(access.user?.firstName, access.user?.lastName, access.user?.username)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className='small fw-medium'>
                                                            {access.user?.firstName && access.user?.lastName 
                                                                ? `${access.user.firstName} ${access.user.lastName}`
                                                                : access.user?.username
                                                            }
                                                        </div>
                                                        {access.user?.id === document?.ownerId && (
                                                            <div className='small text-muted'>Владелец</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='py-3 text-muted small'>
                                                {access.user?.email}
                                            </td>
                                            <td className='py-3'>
                                                {editingAccess === access.id && isOwner && access.user?.id !== document?.ownerId ? (
                                                    <Form.Select
                                                        size='sm'
                                                        value={editAccessLevel}
                                                        onChange={(e) => setEditAccessLevel(e.target.value)}
                                                        className='rounded-pill w-auto d-inline-block'
                                                    >
                                                        <option value='read'>Чтение</option>
                                                        <option value='write'>Редактирование</option>
                                                    </Form.Select>
                                                ) : (
                                                    getAccessLevelBadge(access.accessLevel)
                                                )}
                                            </td>
                                            <td className='py-3 text-end pe-4'>
                                                {isOwner && access.user?.id !== document?.ownerId && (
                                                    <div className='d-flex gap-1 justify-content-end'>
                                                        {editingAccess === access.id ? (
                                                            <>
                                                                <Button
                                                                    variant='success'
                                                                    size='sm'
                                                                    className='rounded-pill'
                                                                    onClick={() => updateAccess(access.id, editAccessLevel)}
                                                                >
                                                                    <Check size={14} />
                                                                </Button>
                                                                <Button
                                                                    variant='light'
                                                                    size='sm'
                                                                    className='rounded-pill'
                                                                    onClick={() => setEditingAccess(null)}
                                                                >
                                                                    <X size={14} />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    variant='light'
                                                                    size='sm'
                                                                    className='rounded-pill'
                                                                    onClick={() => {
                                                                        setEditingAccess(access.id)
                                                                        setEditAccessLevel(access.accessLevel)
                                                                    }}
                                                                >
                                                                    <Pencil size={14} />
                                                                </Button>
                                                                <Button
                                                                    variant='light'
                                                                    size='sm'
                                                                    className='rounded-pill text-danger'
                                                                    onClick={() => removeAccess(access.id, access.user?.username)}
                                                                >
                                                                    <Trash size={14} />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </div>
                </Card.Body>
            </Card>
        </div>
          
        {/* Модалка добавления пользователя */}
        <Modal show={showAddModal} onHide={() => {
            setShowAddModal(false)
            setSearchQuery('')
            setSearchResults([])
        }} centered size='lg'>
          <Modal.Body className='p-4'>
            <h6 className='fw-semibold mb-3 d-flex align-items-center gap-2'>
                <PersonPlus size={18} />
                Добавить пользователя
            </h6>
              
            <InputGroup className='mb-3'>
                <InputGroup.Text className='bg-transparent border-end-0 rounded-start-pill'>
                    <Search size={16} className='text-muted' />
                </InputGroup.Text>
                <Form.Control
                    type='text'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder='Введите имя, username или email...'
                    className='border-start-0 rounded-end-pill py-2'
                    autoFocus
                />
            </InputGroup>
              
            {isSearching ? (
                <div className='text-center py-4'>
                    <Spinner size='sm' />
                </div>
            ) : searchResults.length > 0 ? (
              <div className='d-flex flex-column gap-2'>
                {searchResults.map(userResult => (
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
                          <div className='text-muted small'>@{userResult.username}</div>
                          <div className='text-muted small'>{userResult.email}</div>
                        </div>
                    </div>
                      
                      <div className='d-flex align-items-center gap-2'>
                        <Form.Select
                          size='sm'
                          className='rounded-pill'
                          style={{ width: '130px' }}
                          value={selectedAccess}
                          onChange={(e) => setSelectedAccess(e.target.value)}
                        >
                          <option value='read'>Чтение</option>
                          <option value='write'>Редактирование</option>
                        </Form.Select>
                        <Button
                          size='sm'
                          variant='dark'
                          className='rounded-pill'
                          onClick={() => addAccess(userResult.id, selectedAccess)}
                          disabled={addingUser === userResult.id}
                        >
                          {addingUser === userResult.id ? (
                            <Spinner size='sm' />
                          ) : (
                            <PersonPlus size={14} className='me-1' />
                          )}
                          Добавить
                        </Button>
                      </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className='text-center py-4'>
                <Person size={40} className='text-muted opacity-25 mb-2' />
                <p className='text-muted small mb-0'>Пользователи не найдены</p>
              </div>
            ) : (
              <div className='text-center py-4'>
                <Search size={40} className='text-muted opacity-25 mb-2' />
                <p className='text-muted small mb-0'>Введите минимум 2 символа для поиска</p>
              </div>
            )}
              
            <hr className='my-3' />
              
            <Button
              variant='light'
              size='sm'
              className='w-100 rounded-pill'
              onClick={() => {
                setShowAddModal(false)
                setSearchQuery('')
              }}
            >
              Закрыть
            </Button>
          </Modal.Body>
        </Modal>
      </div>
  )
}

export default DocumentManagePage