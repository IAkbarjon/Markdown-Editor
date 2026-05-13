import { Card, Button } from 'react-bootstrap'
import { FileEarmarkX, ArrowLeft } from 'react-bootstrap-icons'
import { useNavigate } from 'react-router-dom'

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <div className='min-vh-100 d-flex align-items-center justify-content-center bg-light p-3'>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        
        <Card className='border-0 shadow-sm text-center'>
          <Card.Body className='p-5'>
            
            {/* Иконка */}
            <div className='mb-4'>
              <FileEarmarkX 
                size={48} 
                className='text-muted opacity-50' 
              />
            </div>

            {/* Код ошибки */}
            <h1 className='display-1 fw-bold text-secondary mb-2'>
              404
            </h1>

            {/* Заголовок */}
            <h5 className='fw-normal text-dark mb-3'>
              Страница не найдена
            </h5>

            {/* Описание */}
            <p className='text-muted small mb-4'>
              Возможно, документ был удалён или вы перешли по неверной ссылке
            </p>

            {/* Кнопка возврата */}
            <div className='d-flex flex-column gap-2'>
              <Button
                variant='outline-secondary'
                className='rounded-pill d-flex align-items-center justify-content-center gap-2'
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={16} />
                Назад
              </Button>

              <Button
                variant='link'
                size='sm'
                className='text-decoration-none text-muted'
                onClick={() => navigate('/')}
              >
                На главную
              </Button>
            </div>

          </Card.Body>
        </Card>

        {/* Подпись внизу */}
        <p className='text-center text-muted small mt-3 mb-0'>
          Markdown Editor
        </p>
      </div>
    </div>
  )
}

export default NotFoundPage