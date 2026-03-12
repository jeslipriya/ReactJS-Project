import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            color: '#2E2A27',
            border: '1px solid #E6E1DC',
            borderRadius: '14px',
            padding: '16px',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)