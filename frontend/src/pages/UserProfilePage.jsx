import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Badge, Spinner } from 'react-bootstrap'
import { Person, Envelope, Calendar, FileEarmarkText, People, ArrowLeft, PencilSquare, Clock, ShieldLock, Link45deg } from 'react-bootstrap-icons'
import useUser from '../hooks/useUser'
import httpService from '../services/httpService'

function UserProfilePage() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useUser()
  const [profileUser, setProfileUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commonDocuments, setCommonDocuments] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [username])

  const fetchUserProfile = async () => {
    setLoading(true)
    httpService.get(`/users/${username}`)
      .then(res => {
        setProfileUser(res.data)

        if (currentUser) {
          setLoadingDocs(true)
          // const docsResponse = httpService.get(`/users/${username}/common-documents`)
          // setCommonDocuments(docsResponse.data)
          // setLoadingDocs(false)
        }
      })
      .catch(err => {
        console.error('Error fetching user profile:', err)
        if (err.response?.status === 404) {
          navigate('/not-found', { replace: true })
        }
      })
      .finally(() => setLoading(false))
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getInitials = (firstName, lastName, username) => {
    if (firstName && lastName)
      return `${firstName[0]}${lastName[0]}`
    if (firstName) return firstName[0]
      return username?.[0]?.toUpperCase() || 'U'
  }

  if (loading) {
    return (
      <div className='min-vh-100 bg-light d-flex align-items-center justify-content-center'>
        <div className="text-center">
          <Spinner variant="primary" />
          <p className="text-muted small mt-2">Загрузка профиля...</p>
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return null
  }

  const isOwnProfile = currentUser?.id === profileUser.id

  return (
    <div className='min-vh-100 bg-light py-4'>
        <div className='container' style={{ maxWidth: '900px' }}>
            {/* Кнопка назад */}
            <Button
              variant='light'
              size='sm'
              className='rounded-pill d-flex align-items-center gap-1 mb-3'
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} />
              <span className='small'>Назад</span>
            </Button>

            {/* Основная карточка профиля */}
            <Card className='border-0 shadow-sm mb-4 overflow-hidden'>
              {/* Верхняя цветная полоса */}
              <div 
                className='bg-primary' 
                style={{ height: '80px', background: 'linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)' }}
              />
              
              <Card.Body className='p-4 pt-0'>
                  {/* Аватар и основная информация */}
                  <div className='text-center text-sm-start'>
                    <div 
                        className='bg-white rounded-circle d-inline-flex align-items-center justify-content-center border border-3 border-white shadow-sm'
                        style={{ 
                            width: '100px', 
                            height: '100px', 
                            marginTop: '-50px',
                            background: '#f8f9fa'
                        }}
                    >
                        <span className='display-4 fw-semibold text-primary'>
                            {getInitials(profileUser.firstName, profileUser.lastName, profileUser.username)}
                        </span>
                    </div>

                    <div className='mt-3'>
                        <div className='d-flex align-items-center justify-content-between flex-wrap gap-2'>
                          <div>
                            <h4 className='fw-semibold mb-1'>
                              {profileUser.firstName && profileUser.lastName 
                                ? `${profileUser.firstName} ${profileUser.lastName}`
                                : profileUser.username
                              }
                            </h4>
                            <div className='text-muted small'>@{profileUser.username}</div>
                          </div>
                            
                            {!isOwnProfile && currentUser && (
                              <Button
                                variant='outline-primary'
                                size='sm'
                                className='rounded-pill d-flex align-items-center gap-1'
                                onClick={() => navigate(`/documents?shared=${profileUser.id}`)}
                              >
                                <People size={14} />
                                Общие документы
                              </Button>
                            )}
                        </div>
                    </div>
                  </div>

                  {/* Статистика */}
                  <div className='row g-3 mt-4'>
                      <div className='col-sm-4'>
                          <div className='bg-light rounded-3 p-3 text-center'>
                            <FileEarmarkText size={20} className='text-primary mb-1' />
                            <div className='fs-5 fw-semibold'>{profileUser.documentsCount || 0}</div>
                            <div className='small text-muted'>документов</div>
                          </div>
                      </div>
                      
                      <div className='col-sm-4'>
                          <div className='bg-light rounded-3 p-3 text-center'>
                            <People size={20} className='text-success mb-1' />
                            <div className='fs-5 fw-semibold'>{profileUser.sharedWithMeCount || 0}</div>
                            <div className='small text-muted'>доступов к документам</div>
                          </div>
                      </div>
                      
                      <div className='col-sm-4'>
                          <div className='bg-light rounded-3 p-3 text-center'>
                            <Clock size={20} className='text-warning mb-1' />
                            <div className='fs-5 fw-semibold'>{profileUser.sharedByMeCount || 0}</div>
                            <div className='small text-muted'>поделился документами</div>
                          </div>
                      </div>
                  </div>

                  {/* Дополнительная информация */}
                  <div className='mt-4 pt-2 border-top'>
                      <div className='row g-3'>
                          {profileUser.email && (
                              <div className='col-md-6'>
                                <div className='d-flex align-items-center gap-3'>
                                  <div className='bg-primary bg-opacity-10 rounded-circle p-2'>
                                  <Envelope size={16} className='text-primary' />
                                </div>
                                <div>
                                  <div className='small text-muted'>Email</div>
                                  <div className='small fw-medium'>{profileUser.email}</div>
                                  </div>
                                </div>
                              </div>
                          )}
                          
                          <div className='col-md-6'>
                            <div className='d-flex align-items-center gap-3'>
                              <div className='bg-success bg-opacity-10 rounded-circle p-2'>
                                <Calendar size={16} className='text-success' />
                              </div>
                              <div>
                                <div className='small text-muted'>На сайте с</div>
                                <div className='small fw-medium'>{formatDate(profileUser.joinDate)}</div>
                              </div>
                            </div>
                          </div>

                          {profileUser.bio && (
                            <div className='col-12'>
                              <div className='d-flex gap-3'>
                                <div className='bg-info bg-opacity-10 rounded-circle p-2'>
                                  <PencilSquare size={16} className='text-info' />
                                </div>
                                <div>
                                  <div className='small text-muted'>О себе</div>
                                  <div className='small'>{profileUser.bio}</div>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                  </div>
                </Card.Body>
            </Card>

            {/* Общие документы (если есть доступ) */}
            {currentUser && commonDocuments.length > 0 && (
              <Card className='border-0 shadow-sm'>
                <Card.Body className='p-4'>
                  <h6 className='fw-semibold mb-3 d-flex align-items-center gap-2'>
                    <Link45deg size={18} />
                    Общие документы
                  </h6>
                    
                  <div className='d-flex flex-column gap-2'>
                    {commonDocuments.map(doc => (
                      <div
                        key={doc.id}
                        className='d-flex align-items-center justify-content-between p-3 bg-light rounded-3'
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/editor?document=${doc.id}`)}
                      >
                        <div className='d-flex align-items-center gap-3'>
                          <FileEarmarkText size={18} className='text-primary' />
                          <div>
                            <div className='fw-medium small'>{doc.title}</div>
                            <div className='text-muted small'>
                              Последнее изменение: {formatDate(doc.updatedAt)}
                            </div>
                          </div>
                        </div>
                        <Badge bg={doc.ownerId === profileUser.id ? 'primary' : 'secondary'} className='rounded-pill'>
                          {doc.ownerId === profileUser.id ? 'Владелец' : 'Соавтор'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Если нет общих документов */}
            {currentUser && commonDocuments.length === 0 && !loadingDocs && (
              <Card className='border-0 shadow-sm'>
                <Card.Body className='text-center py-5'>
                  <People size={40} className='text-muted opacity-25 mb-3' />
                  <h6 className='text-muted mb-2'>Нет общих документов</h6>
                  <p className='text-muted small mb-0'>
                    У вас пока нет общих документов с {profileUser.firstName || profileUser.username}
                  </p>
                </Card.Body>
              </Card>
            )}

            {/* Бейдж с уровнем доступа к профилю */}
            <div className='text-center mt-3'>
              <p className='text-muted small'>
                {isOwnProfile 
                  ? 'Это ваш публичный профиль'
                  : profileUser.isPublic 
                    ? 'Публичный профиль'
                    : 'Приватный профиль'
                }
              </p>
            </div>
        </div>
    </div>
  )
}

export default UserProfilePage
