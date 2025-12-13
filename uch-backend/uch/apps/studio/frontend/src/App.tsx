import React, { useEffect, useState } from 'react';
import CoreTest from './core/CoreTest';
import MasterClockNode from './core/MasterClockNode';

// Импортируем глобальный экземпляр CoreOrchestrator
import { coreOrchestrator } from './core/CoreOrchestrator';

const App: React.FC = () => {
  const [coreReady, setCoreReady] = useState(false);

  // Проверяем инициализацию ядра
  useEffect(() => {
    if (coreOrchestrator) {
      console.log('[App] CoreOrchestrator доступен, можно монтировать ноды.');
      setCoreReady(true);
    } else {
      console.error('[App] CoreOrchestrator не доступен!');
    }
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      background: '#f8f9fa', 
      borderRadius: '8px',
      maxWidth: '1400px',
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      <h2>🎵 Творческая студия UCH v0.3 - Фаза 2: Ядро-оркестратор</h2>
      <p>Добро пожаловать в творческую студию Universal Creative Hub! Начата реализация ядра-оркестратора.</p>
      
      {/* Состояние ядра */}
      <div style={{ 
        padding: '10px 15px', 
        marginBottom: '20px', 
        background: coreReady ? '#d4edda' : '#fff3cd', 
        borderRadius: '5px',
        border: `1px solid ${coreReady ? '#c3e6cb' : '#ffeaa7'}`
      }}>
        <strong>Состояние системы:</strong> CoreOrchestrator {coreReady ? '✅ Активен' : '⏳ Загрузка...'}
      </div>

      {/* Основная рабочая область: Grid с нодами */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '25px', 
        marginTop: '20px'
      }}>
        {/* Master Clock Node */}
        <div>
          <h4>⏱ Master Clock Node</h4>
          <p style={{ fontSize: '0.9em', marginBottom: '10px' }}>Специализированная нода для управления и визуализации транспорта.</p>
          {coreReady ? (
            <MasterClockNode nodeId="master-clock-1" core={coreOrchestrator} />
          ) : (
            <div style={styles.placeholder}>Загрузка Master Clock...</div>
          )}
        </div>

        {/* Core Test Node (исходный интерфейс) */}
        <div>
          <h4>🧪 Core Test Interface</h4>
          <p style={{ fontSize: '0.9em', marginBottom: '10px' }}>Оригинальный тестовый интерфейс для отладки ядра.</p>
          {coreReady ? (
            <CoreTest />
          ) : (
            <div style={styles.placeholder}>Загрузка Core Test...</div>
          )}
        </div>
      </div>

      {/* Информационная панель */}
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
            <li><strong>✅ MasterClockNode</strong> - <span style={{ color: 'green' }}>реализован (День 2)</span></li>
            <li><strong>⏳ StrudelREPLNode</strong> - следующий шаг</li>
            <li><strong>⏳ TrackerEditorNode</strong> - планируется</li>
          </ol>
        </div>
        
        <div style={{ padding: '15px', background: 'white', borderRadius: '5px' }}>
          <h4>🔧 Режим работы:</h4>
          <ul>
            <li>URL: {window.location.href}</li>
            <li>Режим: <strong>{process.env.NODE_ENV === 'development' ? 'Разработка (Vite)' : 'Продакшн (Django)'}</strong></li>
            <li>Vite порт: {window.location.port === '5173' ? '✅ 5173' : '❌ ' + window.location.port}</li>
            <li>CoreOrchestrator: <span style={{ color: 'green' }}>✅ Активен</span></li>
          </ul>
          
          <div style={{ marginTop: '15px', padding: '10px', background: '#e8f4fd', borderRadius: '4px' }}>
            <strong>Тестирование MasterClockNode:</strong>
            <p>1. Управление: кнопки Play/Stop/Pause</p>
            <p>2. Визуализация: время (bar:beat:16th) и статус</p>
            <p>3. Контроль: слайдер темпа + кнопка Set</p>
            <p>4. Синхронизация: работает совместно с CoreTest</p>
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
          <li>Работы MasterClockNode (подписка/отписка на события)</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        Universal Creative Hub v0.3 | Фаза 2: День 2 - MasterClockNode | {new Date().toLocaleDateString()}
      </div>
    </div>
  )
}

const styles = {
  placeholder: {
    padding: '40px 20px',
    background: '#e9ecef',
    borderRadius: '12px',
    textAlign: 'center' as const,
    color: '#6c757d',
    fontStyle: 'italic',
  }
}

export default App;
