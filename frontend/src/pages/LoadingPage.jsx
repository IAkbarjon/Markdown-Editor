import { Spinner } from 'react-bootstrap'
import { FileEarmarkText } from 'react-bootstrap-icons'

function LoadingPage() {
  return (
      <div className='min-vh-100 bg-light d-flex align-items-center justify-content-center p-3'>
          <div className='text-center'>
              <div 
                  className='bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4'
                  style={{ width: '64px', height: '64px' }}
              >
                  <FileEarmarkText size={32} className='text-primary' />
              </div>
              
              <Spinner 
                  animation='border' 
                  variant='primary' 
                  className='mb-3 d-block mx-auto'
                  style={{ width: '40px', height: '40px' }}
              />
              
              <p className='text-muted small mb-0'>
                  Загрузка...
              </p>
          </div>
      </div>
  )
}

function LoadingInline() {
    return (
        <div className='d-flex align-items-center justify-content-center gap-2 py-4'>
            <Spinner animation='border' variant='secondary' size='sm' />
            <span className='text-muted small'>Загрузка...</span>
        </div>
    )
}

function LoadingOverlay() {
    return (
        <div className='position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75' style={{ zIndex: 1050 }}>
            <div className='text-center'>
                <Spinner animation='border' variant='primary' className='mb-2' />
                <p className='text-muted small mb-0'>Загрузка...</p>
            </div>
        </div>
    )
}

export { LoadingInline, LoadingOverlay, LoadingPage as default }
