import React, { useEffect, useState } from 'react';
import NodeToolbar from './core/NodeToolbar';

// Импортируем глобальный экземпляр CoreOrchestrator и типы
import { coreOrchestrator, CoreEventType } from './core/CoreOrchestrator';
import { NodeInstance } from './core/NodeRegistry';
import { nodeRegistry } from './core/NodeRegistry';

const App: React.FC = () => {
  const [coreReady, setCoreReady] = useState(false);
  const [nodeInstances, setNodeInstances] = useState<NodeInstance[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Загрузка начального состояния
  useEffect(() => {
    if (coreOrchestrator) {
      console.log('[App] CoreOrchestrator доступен, можно монтировать ноды.');
      setCoreReady(true);
      
      // Загружаем существующие экземпляры нод
      const instances = coreOrchestrator.getAllNodeInstances();
      setNodeInstances(instances);
      console.log(`[App] Загружено ${instances.length} экземпляров нод.`);
      
      // Подписываемся на события добавления/удаления нод
      const handleNodeAdded = (data: any) => {
        console.log('[App] Событие NODE_ADDED:', data);
        setNodeInstances(coreOrchestrator.getAllNodeInstances());
      };
      
      const handleNodeRemoved = (data: any) => {
        console.log('[App] Событие NODE_REMOVED:', data);
        setNodeInstances(coreOrchestrator.getAllNodeInstances());
      };
      
      coreOrchestrator.on(CoreEventType.NODE_ADDED, handleNodeAdded);
      coreOrchestrator.on(CoreEventType.NODE_REMOVED, handleNodeRemoved);
      
      // Отписка при размонтировании
      return () => {
        coreOrchestrator.off(CoreEventType.NODE_ADDED, handleNodeAdded);
        coreOrchestrator.off(CoreEventType.NODE_REMOVED, handleNodeRemoved);
      };
    } else {
      console.error('[App] CoreOrchestrator не доступен!');
    }
  }, []);

  // Обработчик добавления ноды из панели
  const handleNodeAdded = (nodeId: string, typeId: string) => {
    console.log(`[App] Нода добавлена: ${typeId} (${nodeId})`);
    // Обновляем список экземпляров
    setNodeInstances(coreOrchestrator.getAllNodeInstances());
  };

  // Функция рендеринга ноды по её экземпляру
  const renderNodeInstance = (instance: NodeInstance) => {
    const nodeType = nodeRegistry.getNodeType(instance.typeId);
    
    if (!nodeType) {
      console.error(`[App] Неизвестный тип ноды: ${instance.typeId}`);
      return (
        <div style={styles.errorNode}>
          <h4>⚠️ Неизвестная нода</h4>
          <p>ID: {instance.id}</p>
          <p>Тип: {instance.typeId}</p>
        </div>
      );
    }
    
    try {
      // Создаем компонент через фабрику
      return (
        <div 
          key={instance.id} 
          style={{
            ...styles.nodeContainer,
            border: selectedNodeId === instance.id ? '2px solid #667eea' : '1px solid #ddd'
          }}
          onClick={() => setSelectedNodeId(instance.id)}
        >
          <div style={styles.nodeHeader}>
            <span style={styles.nodeIcon}>{nodeType.icon}</span>
            <strong style={styles.nodeTitle}>{nodeType.name}</strong>
            <small style={styles.nodeId}>{instance.id.substring(0, 8)}...</small>
          </div>
          <div style={styles.nodeContent}>
            {nodeType.factory(instance.id)}
          </div>
          <div style={styles.nodeFooter}>
            <small>
              Позиция: ({instance.position.x}, {instance.position.y}) | 
              Размер: {nodeType.defaultWidth || 'auto'}×{nodeType.defaultHeight || 'auto'}
            </small>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                coreOrchestrator.removeNodeInstance(instance.id);
              }}
              style={styles.deleteButton}
              title="Удалить ноду"
            >
              🗑️
            </button>
          </div>
        </div>
      );
    } catch (error) {
      console.error(`[App] Ошибка рендеринга ноды ${instance.id}:`, error);
      return (
        <div style={styles.errorNode}>
          <h4>❌ Ошибка ноды</h4>
          <p>{instance.id}</p>
          <pre style={styles.errorText}>{String(error)}</pre>
        </div>
      );
    }
  };

  return (
    <div style={styles.appContainer}>
      <h2>🎵 Творческая студия UCH v0.3 - Фаза 2: Ядро-оркестратор</h2>
      <p>Добро пожаловать в творческую студию Universal Creative Hub! Начата реализация ядра-оркестратора.</p>
      
      {/* Состояние ядра */}
      <div style={styles.statusBar}>
        <strong>Состояние системы:</strong> CoreOrchestrator {coreReady ? '✅ Активен' : '⏳ Загрузка...'} | 
        Нод: {nodeInstances.length} | 
        {selectedNodeId && ` Выбрана: ${selectedNodeId.substring(0, 8)}...`}
      </div>

      {/* Панель управления нодами */}
      <NodeToolbar onNodeAdded={handleNodeAdded} />

      {/* Основная рабочая область: Grid с нодами */}
      <div style={styles.workspace}>
        <h3>🛠️ Рабочая область</h3>
        <p style={styles.workspaceDescription}>
          {nodeInstances.length === 0 
            ? 'Добавьте ноды из панели выше. Каждая нода — это специализированный редактор, синхронизированный с общим транспортом.' 
            : `Отображается ${nodeInstances.length} нод(ы). Кликните по ноде для выделения.`}
        </p>
        
        {nodeInstances.length === 0 ? (
          <div style={styles.emptyWorkspace}>
            <div style={styles.emptyIllustration}>🎵</div>
            <h4>Рабочая область пуста</h4>
            <p>Используйте панель выше, чтобы добавить свою первую ноду.</p>
            <div style={styles.emptyTips}>
              <p><strong>Советы:</strong></p>
              <ul>
                <li>Начните с <strong>Master Clock</strong> для управления транспортом</li>
                <li>Добавьте <strong>Core Test</strong> для тестирования и отладки</li>
                <li>Позже появятся Strudel REPL, Трекер, Пиано-ролл и другие ноды</li>
              </ul>
            </div>
          </div>
        ) : (
          <div style={styles.nodeGrid}>
            {nodeInstances.map(renderNodeInstance)}
          </div>
        )}
      </div>

      {/* Информационная панель */}
      <div style={styles.infoPanel}>
        <div style={styles.infoCard}>
          <h4>📋 Задачи Фазы 2 (месяц 3):</h4>
          <ol>
            <li><strong>✅ CoreOrchestrator.ts</strong> - базовое ядро реализовано</li>
            <li><strong>✅ CoreTest.tsx</strong> - тестовый интерфейс создан</li>
            <li><strong>✅ MasterClockNode</strong> - реализован (День 2)</li>
            <li><strong>✅ NodeRegistry + NodeToolbar</strong> - <span style={{ color: 'green' }}>реализовано (День 3)</span></li>
            <li><strong>⏳ StrudelREPLNode</strong> - следующий шаг</li>
            <li><strong>⏳ TrackerEditorNode</strong> - планируется</li>
          </ol>
          <p style={{ fontSize: '0.9em', marginTop: '10px', color: '#666' }}>
            <strong>Прогресс Дня 3:</strong> Реализована система динамического управления нодами. 
            Теперь можно добавлять и удалять ноды через панель инструментов.
          </p>
        </div>
        
        <div style={styles.infoCard}>
          <h4>🔧 Режим работы:</h4>
          <ul>
            <li>URL: {window.location.href}</li>
            <li>Режим: <strong>{process.env.NODE_ENV === 'development' ? 'Разработка (Vite)' : 'Продакшн (Django)'}</strong></li>
            <li>Vite порт: {window.location.port === '5173' ? '✅ 5173' : '❌ ' + window.location.port}</li>
            <li>CoreOrchestrator: <span style={{ color: 'green' }}>✅ Активен</span></li>
            <li>Зарегистрировано типов нод: {nodeRegistry.getAllNodeTypes().length}</li>
            <li>Экземпляров нод: {nodeInstances.length}</li>
          </ul>
          
          <div style={styles.debugInfo}>
            <strong>Отладка системы нод:</strong>
            <p>1. Используйте панель выше для добавления нод</p>
            <p>2. Кликните по ноде для выделения</p>
            <p>3. Удаляйте ноды кнопкой 🗑️ в углу</p>
            <p>4. Проверяйте консоль для событий CoreOrchestrator</p>
          </div>
        </div>
      </div>
      
      <div style={styles.debugPanel}>
        <h5>⚠️ Отладочная информация:</h5>
        <p>Для разработчиков: откройте консоль браузера (F12) для просмотра:</p>
        <ul>
          <li>Логов CoreOrchestrator (транспорт, ноды, события)</li>
          <li>Событий EventEmitter (transport:start, node:added и т.д.)</li>
          <li>Работы NodeRegistry и NodeToolbar</li>
          <li>Списка всех нод: <code>window.__UCH_DEBUG__.coreOrchestrator.getAllNodeInstances()</code></li>
        </ul>
      </div>
      
      <div style={styles.footer}>
        Universal Creative Hub v0.3 | Фаза 2: День 3 - Node Management System | {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

const styles = {
  appContainer: {
    padding: '20px', 
    background: '#f8f9fa', 
    borderRadius: '8px',
    maxWidth: '1400px',
    margin: '0 auto',
    minHeight: '100vh'
  },
  statusBar: {
    padding: '10px 15px', 
    marginBottom: '20px', 
    background: '#d4edda', 
    borderRadius: '5px',
    border: '1px solid #c3e6cb',
    fontSize: '0.9em'
  },
  workspace: {
    padding: '20px',
    background: 'white',
    borderRadius: '8px',
    border: '1px solid #eaeaea',
    marginTop: '20px',
    marginBottom: '30px'
  },
  workspaceDescription: {
    fontSize: '0.95em',
    color: '#666',
    marginBottom: '20px'
  },
  emptyWorkspace: {
    padding: '50px 20px',
    textAlign: 'center' as const,
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '2px dashed #dee2e6'
  },
  emptyIllustration: {
    fontSize: '4em',
    marginBottom: '20px'
  },
  emptyTips: {
    marginTop: '20px',
    padding: '15px',
    background: '#e8f4fd',
    borderRadius: '6px',
    textAlign: 'left' as const,
    fontSize: '0.9em'
  },
  nodeGrid: {
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
    gap: '25px'
  },
  nodeContainer: {
    background: 'white',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  nodeHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: '10px'
  },
  nodeIcon: {
    fontSize: '1.5em',
    marginRight: '10px'
  },
  nodeTitle: {
    fontSize: '1.1em',
    flexGrow: 1
  },
  nodeId: {
    fontSize: '0.7em',
    color: '#999',
    background: '#f5f5f5',
    padding: '2px 6px',
    borderRadius: '3px',
    fontFamily: 'monospace'
  },
  nodeContent: {
    minHeight: '100px'
  },
  nodeFooter: {
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid #f0f0f0',
    fontSize: '0.8em',
    color: '#888',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  deleteButton: {
    background: '#ff6b6b',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '0.9em'
  },
  errorNode: {
    padding: '20px',
    background: '#fff5f5',
    borderRadius: '8px',
    border: '1px solid #ffc9c9',
    color: '#c92a2a'
  },
  errorText: {
    fontSize: '0.8em',
    whiteSpace: 'pre-wrap',
    overflowX: 'auto' as const
  },
  infoPanel: {
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '20px', 
    marginTop: '30px' 
  },
  infoCard: {
    padding: '15px', 
    background: 'white', 
    borderRadius: '5px',
    border: '1px solid #eaeaea'
  },
  debugInfo: {
    marginTop: '15px', 
    padding: '10px', 
    background: '#e8f4fd', 
    borderRadius: '4px',
    fontSize: '0.9em'
  },
  debugPanel: {
    marginTop: '30px', 
    padding: '15px', 
    background: '#fff3cd', 
    borderRadius: '5px',
    border: '1px solid #ffeaa7',
    fontSize: '0.9em'
  },
  footer: {
    marginTop: '20px', 
    fontSize: '12px', 
    color: '#666',
    textAlign: 'center' as const
  }
};

export default App;
