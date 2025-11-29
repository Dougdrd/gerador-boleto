import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Importação local simples
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)