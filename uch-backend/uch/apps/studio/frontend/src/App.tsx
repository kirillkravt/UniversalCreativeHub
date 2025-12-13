import React from 'react'
import CoreTest from './core/CoreTest'

const App: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      background: '#f8f9fa', 
      borderRadius: '8px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h2>🎵 Творческая студия UCH v0.3 - Фаза 2: Ядро-оркестратор</h2>
      <p>Добро пожаловать в творческую студию Universal Creative Hub! Начата реализация ядра-оркестратора.</p>
      
      {/* Тестовый компонент CoreOrchestrator */}
      <CoreTest />
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px', 
        marginTop: '30px' 
      }}>
        <div style={{ padding: '15px', background: 'white', borderRadius: '5px' }}>
          <h4>📋 Задачи Фазы 2 (месяц 3):</h4>
          <ol>
            <li><strong>✅ CoreOrchestrator.ts</strong> - базовое ядро реализовано</li>
            <li><strong>✅ CoreTest.tsx</strong> - тестовый интерфейс создан</li>
            <li><strong>⏳ MasterClockNode</strong> - следующий шаг</li>
            <li><strong>⏳ StrudelREPLNode</strong> - планируется</li>
            <li><strong>⏳ TrackerEditorNode</strong> - планируется</li>
          </ol>
        </div>
        
        <div style={{ padding: '15px', background: 'white', borderRadius: '5px' }}>
          <h4>🔧 Режим работы:</h4>
          <ul>
            <li>URL: {window.location.href}</li>
            <li>Разработка: {process.env.NODE_ENV === 'development' ? '✅' : '❌'}</li>
            <li>Vite доступен: {window.location.port === '5173' ? '✅' : '❌'}</li>
            <li>CoreOrchestrator: <span style={{ color: 'green' }}>✅ Активен</span></li>
          </ul>
          
          <div style={{ marginTop: '15px', padding: '10px', background: '#e8f4fd', borderRadius: '4px' }}>
            <strong>Инструкция по тестированию CoreOrchestrator:</strong>
            <p>1. Нажмите "Start" для запуска транспорта</p>
            <p>2. Изменяйте темп слайдером → "Set"</p>
            <p>3. Добавляйте тестовые ноды кнопкой "Добавить тестовую ноду"</p>
            <p>4. Удаляйте ноды кнопкой "Удалить"</p>
            <p>5. Смотрите консоль браузера для логов ядра</p>
          </div>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        background: '#fff3cd', 
        borderRadius: '5px',
        border: '1px solid #ffeaa7'
      }}>
        <h5>⚠️ Отладочная информация:</h5>
        <p>Для разработчиков: откройте консоль браузера (F12) для просмотра:</p>
        <ul>
          <li>Логов CoreOrchestrator (транспорт, ноды, события)</li>
          <li>Событий EventEmitter (transport:start, node:added и т.д.)</li>
          <li>Обновления времени в реальном времени</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        Universal Creative Hub v0.3 | Фаза 2: Ядро-оркестратор | {new Date().toLocaleDateString()}
      </div>
    </div>
  )
}

export default App
