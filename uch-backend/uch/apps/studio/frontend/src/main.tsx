import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

console.log('🚀 React mounting to #studio-root...')
console.log('📍 Current URL:', window.location.href)
console.log('🔧 NODE_ENV:', process.env.NODE_ENV)
console.log('🎛️ Starting Universal Creative Hub Studio v0.3...')

const container = document.getElementById('studio-root')

if (!container) {
  console.error('❌ Element #studio-root not found in DOM!')
  console.log('Available elements:', Array.from(document.querySelectorAll('*')).map(el => el.id || el.tagName).slice(0, 10))
  
  // Создаем fallback элемент
  const fallback = document.createElement('div')
  fallback.id = 'studio-root-fallback'
  fallback.innerHTML = '<h3>Studio Loading...</h3><p>Creating fallback container...</p>'
  document.body.appendChild(fallback)
  
  const root = ReactDOM.createRoot(fallback)
  root.render(React.createElement(App))
} else {
  console.log('✅ Found #studio-root:', container)
  
  const root = ReactDOM.createRoot(container)
  root.render(React.createElement(App))
  
  console.log('✅ React app mounted successfully!')
  console.log('✅ CoreOrchestrator should be available in App')
  
  // Обновляем статус
  setTimeout(() => {
    const statusEl = document.getElementById('studio-status')
    if (statusEl) {
      statusEl.textContent = '✅ Студия загружена! 🎛️ CoreOrchestrator активен'
      statusEl.className = 'text-success'
    }
    
    // Скрываем спиннер
    const spinner = document.querySelector('.spinner-border')
    if (spinner) spinner.style.display = 'none'
  }, 1000)
}

// Глобальные утилиты для отладки
declare global {
  interface Window {
    __UCH_DEBUG__?: {
      version: string
      coreOrchestrator?: any
    }
  }
}

// Экспортируем для отладки в консоли
if (process.env.NODE_ENV === 'development') {
  import('./core/CoreOrchestrator').then(({ coreOrchestrator }) => {
    window.__UCH_DEBUG__ = {
      version: '0.3',
      coreOrchestrator
    }
    console.log('🔧 Debug mode: coreOrchestrator available at window.__UCH_DEBUG__.coreOrchestrator')
  })
}
