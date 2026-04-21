import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './auth/AuthContext'
import { configureGlobalToasts } from './shared/toast'
import { configureGlobalDateInputGuards } from './shared/dateInput'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.jsx'

configureGlobalToasts()
configureGlobalDateInputGuards()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
