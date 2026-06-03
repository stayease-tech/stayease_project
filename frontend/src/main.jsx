import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import { AuthProvider } from './auth/AuthContext'
import { DropdownProvider } from './shared/DropdownContext'
import { configureGlobalToasts } from './shared/toast'
import { configureGlobalDateInputGuards } from './shared/dateInput'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.jsx'

configureGlobalToasts()
configureGlobalDateInputGuards()

function ToastRouteCleanup() {
  const location = useLocation();
  useEffect(() => {
    toast.dismiss();
  }, [location.pathname]);
  return null;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DropdownProvider>
        <ToastRouteCleanup />
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
      </DropdownProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
