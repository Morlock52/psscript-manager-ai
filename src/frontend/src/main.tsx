import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './contexts/AuthContext' // Re-enabled
import { ThemeProvider } from './contexts/ThemeContext'
import { ErrorBoundary } from './ErrorBoundary';
import { MemoryBankProvider } from './contexts/MemoryBankContext';
import './index.css'

const Root = () => (
  <React.StrictMode>
    <AuthProvider> 
      <ThemeProvider>
        <MemoryBankProvider>
          <App />
        </MemoryBankProvider>
      </ThemeProvider>
    </AuthProvider> 
  </React.StrictMode>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <Root />
  </ErrorBoundary>
)
