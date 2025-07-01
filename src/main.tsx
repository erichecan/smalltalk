import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
// Initialize i18n
import './i18n'

// React健康检查 - 2025-01-30 16:40:22
if (typeof React === 'undefined') {
  throw new Error('React is not loaded');
}

if (typeof React.useState !== 'function' || typeof React.useEffect !== 'function') {
  throw new Error('React hooks are not available');
}

console.log('React health check passed:', {
  version: React.version,
  hasHooks: typeof React.useState === 'function' && typeof React.useEffect === 'function'
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)