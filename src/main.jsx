import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './i18n/i18n' // <-- Ei line-ti ekhane add kore din

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)