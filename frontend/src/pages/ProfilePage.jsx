import { useState } from 'react'
import { Card, Form, Button, Row, Col, Image } from 'react-bootstrap'
import { PencilSquare, Envelope, Calendar, FileText } from 'react-bootstrap-icons'
import useUser from '../hooks/useUser'
import httpService from '../services/httpService'
import useNotification from '../hooks/useNotification'

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false)
  const { user, setUser, logout } = useUser()
  const notification = useNotification()

  const [userData, setUserData] = useState({
    username: user?.username ?? '',
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    joinDate: user?.joinDate ?? '',
    docsCount: user?.documents?.length ?? 0
  })

  const handleClose = () => {
    if (window.confirm('Вы действительно хотите выйти')) {
      logout()
    }
  }

  const handleSaveEdit = () => {
    httpService.patch('/authorization/change-data', userData)
      .then(res => {
        setUser(res.data)
        notification.success('Изменения успешно сохранены')
        setIsEditing(false)
      })
      .catch(err => {
        console.error(err)
        notification.error('Не удалось сохранить изменения')
      })
  }

  return (
    <div className='min-vh-100 bg-light py-4'>
      <div className='container max-w-[600px]!'>
        
        {/* Заголовок */}
        <div className='flex items-center justify-between'>
          <h4 className='mb-4 fw-normal text-secondary d-flex align-items-center gap-2'>
            <PencilSquare size={20} />
            Профиль
          </h4>

          <Button variant='outline-danger' size='sm' className='rounded-pill' onClick={() => handleClose()}>Выйти</Button>
        </div>

        <Card className='border-0 shadow-sm'>
          <Card.Body className='p-4'>
            
            {/* Аватар и основная информация */}
            <div className='d-flex align-items-center gap-3 mb-4'>
              <div 
                className='bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center fw-bold text-primary'
                style={{ width: '48px', height: '48px', fontSize: '20px' }}
              >
                {userData.firstName[0]}
              </div>
              
              <div className='flex-grow-1'>
                <h5 className='mb-1 fw-semibold'>{`${userData.firstName} ${userData.lastName}`}</h5>
                <p className='text-muted mb-0 small'>{userData.username}</p>
              </div>

              <Button
                variant='light'
                size='sm'
                className='rounded-pill px-3 d-flex align-items-center gap-1'
                onClick={() => setIsEditing(!isEditing)}
              >
                <PencilSquare size={14} />
                {isEditing ? 'Отмена' : 'Изменить'}
              </Button>
            </div>

            {/* Детали профиля */}
            <div className='border-top pt-3'>
              <div className='d-flex flex-column gap-3'>
                
                {/* Email */}
                <div className='d-flex align-items-center gap-2 text-muted small'>
                  <Envelope size={16} />
                  <span className='fw-medium'>Почта:</span>
                  {isEditing ? (
                    <Form.Control 
                      size='sm' 
                      type='email' 
                      value={userData.email}
                      className='ms-auto w-50'
                      onChange={(e) => setUserData({...userData, email: e.target.value})}
                    />
                  ) : (
                    <span className='ms-auto'>{userData.email}</span>
                  )}
                </div>

                {/* Дата регистрации */}
                <div className='d-flex align-items-center gap-2 text-muted small'>
                  <Calendar size={16} />
                  <span className='fw-medium'>На сайте с:</span>
                  <span className='ms-auto'>
                    {new Date(userData.joinDate).toLocaleDateString('ru-RU')}
                  </span>
                </div>

                {/* Количество документов */}
                <div className='d-flex align-items-center gap-2 text-muted small'>
                  <FileText size={16} />
                  <span className='fw-medium'>Документов:</span>
                  <span className='ms-auto'>{userData.docsCount}</span>
                </div>
              </div>
            </div>

            {/* Кнопка сохранения при редактировании */}
            {isEditing && (
              <div className='mt-4 pt-3 border-top'>
                <Button 
                  variant='primary' 
                  size='sm' 
                  className='w-100 rounded-pill'
                  onClick={() => {
                    // Сохранение
                    handleSaveEdit()
                  }}
                >
                  Сохранить изменения
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default ProfilePage