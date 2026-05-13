import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import HomePage from './pages/HomePage'
import EditorPage from './pages/EditorPage'
import AuthPage from './pages/AuthPage'
import NotificationProvider from './contexts/NotificationContext'
import ProtectedRoute from './contexts/ProtectedRoute'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import DocumentsPage from './pages/DocumentsPage'

function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path='/auth' element={<AuthPage />} />
            <Route element={<Header />}>
              <Route path='/' element={<HomePage />} />
            </Route>
            <Route path='*' element={<NotFoundPage />} />
          </Route>
          <Route element={<ProtectedRoute requireAuthorization />}>
            <Route element={<Header />}>
              <Route path='/profile' element={<ProfilePage />} />
              <Route path='/editor' element={<EditorPage />} />
              <Route path='/documents' element={<DocumentsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  )
}

export default App
