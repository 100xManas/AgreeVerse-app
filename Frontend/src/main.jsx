import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import  ProductProvider  from './useContext/ProductContext.jsx'
import { AuthProvider } from './useContext/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ProductProvider>
        <App />
      </ProductProvider>
    </AuthProvider>
  </StrictMode>,
)
