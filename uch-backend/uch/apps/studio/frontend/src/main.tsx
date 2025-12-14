import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Простой спиннер загрузки
const loadingHTML = `
<div style="
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #e2e8f0;
  font-family: system-ui, sans-serif;
  z-index: 9999;
">
  <div style="font-size: 4rem; margin-bottom: 1rem;">🎵</div>
  <div style="
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
  ">Universal Creative Hub</div>
  <div style="font-size: 1rem; color: #94a3b8;">
    Загрузка творческой студии...
  </div>
</div>
`

// Добавляем спиннер
document.body.insertAdjacentHTML('afterbegin', loadingHTML)

// Функция удаления спиннера
function removeLoadingScreen() {
  const loadingScreen = document.querySelector('div[style*="position: fixed"]')
  if (loadingScreen && loadingScreen.parentNode) {
    loadingScreen.parentNode.removeChild(loadingScreen)
  }
}

// Запускаем приложение
try {
  const rootElement = document.getElementById('studio-root')
  if (!rootElement) {
    throw new Error('Root element (#root) not found')
  }

  const root = ReactDOM.createRoot(rootElement)
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  
  // Удаляем спиннер через секунду
  setTimeout(removeLoadingScreen, 1000)
  
  console.log('🚀 Universal Creative Hub запущен')
  
} catch (error) {
  console.error('❌ Ошибка запуска приложения:', error)
  removeLoadingScreen()
  
  // Показываем ошибку
  const errorHTML = `
  <div style="
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #7f1d1d;
    color: #fecaca;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-family: monospace;
  ">
    <div style="font-size: 3rem; margin-bottom: 1rem;">🚨</div>
    <h1 style="margin: 0 0 1rem 0;">Ошибка запуска приложения</h1>
    <pre style="
      background: rgba(0, 0, 0, 0.3);
      padding: 20px;
      border-radius: 8px;
      max-width: 800px;
      overflow: auto;
    ">${error instanceof Error ? error.toString() : String(error)}</pre>
  </div>
  `
  
  document.body.insertAdjacentHTML('afterbegin', errorHTML)
}
