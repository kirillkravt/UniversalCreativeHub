import React from 'react'

const App: React.FC = () => {
  return (
    <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
      <h2>🎵 Творческая студия UCH v0.3</h2>
      <p>Добро пожаловать в творческую студию Universal Creative Hub!</p>
      
      <div style={{ marginTop: '20px' }}>
        <h4>Режим работы:</h4>
        <ul>
          <li>URL: {window.location.href}</li>
          <li>Разработка: {process.env.NODE_ENV === 'development' ? '✅' : '❌'}</li>
          <li>Vite доступен: {window.location.port === '5173' ? '✅' : '❌'}</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', background: 'white', borderRadius: '5px' }}>
        <h5>Следующие шаги:</h5>
        <ol>
          <li>Реализовать CoreOrchestrator</li>
          <li>Добавить базовые ноды (Strudel, Tracker)</li>
          <li>Настроить синхронизацию транспорта</li>
        </ol>
      </div>
    </div>
  )
}

export default App
