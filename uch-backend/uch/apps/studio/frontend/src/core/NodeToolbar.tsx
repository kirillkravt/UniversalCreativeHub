import React, { useState } from 'react';
import { nodeRegistry } from './NodeRegistry';
import { coreOrchestrator } from './CoreOrchestrator';

interface NodeToolbarProps {
  onNodeAdded?: (nodeId: string, typeId: string) => void;
}

const NodeToolbar: React.FC<NodeToolbarProps> = ({ onNodeAdded }) => {
  const [collapsed, setCollapsed] = useState(false);
  
  // Получаем все зарегистрированные типы нод
  const nodeTypes = nodeRegistry.getAllNodeTypes();
  
  // Обработчик добавления ноды
  const handleAddNode = (typeId: string) => {
    // Генерируем позицию (пока просто в столбик)
    const x = 100 + Math.random() * 100; // случайное смещение
    const y = 100 + (nodeTypes.findIndex(nt => nt.id === typeId) * 120);
    
    const nodeId = coreOrchestrator.addNodeInstance(typeId, { x, y });
    
    if (nodeId && onNodeAdded) {
      onNodeAdded(nodeId, typeId);
    }
    
    if (nodeId) {
      console.log(`[NodeToolbar] Добавлена нода: ${typeId} с ID: ${nodeId}`);
    } else {
      console.error(`[NodeToolbar] Не удалось добавить ноду типа: ${typeId}`);
    }
  };
  
  if (collapsed) {
    return (
      <div style={styles.collapsedContainer}>
        <button 
          onClick={() => setCollapsed(false)}
          style={styles.expandButton}
          title="Развернуть панель нод"
        >
          📦
        </button>
        <span style={{ fontSize: '0.8em', marginLeft: '5px' }}>{nodeTypes.length} нод</span>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h4 style={styles.title}>📦 Панель нод</h4>
        <button 
          onClick={() => setCollapsed(true)}
          style={styles.collapseButton}
          title="Свернуть"
        >
          ➖
        </button>
      </div>
      
      <p style={styles.description}>
        Выберите тип ноды для добавления на рабочую область:
      </p>
      
      <div style={styles.nodeList}>
        {nodeTypes.map((nodeType) => (
          <div key={nodeType.id} style={styles.nodeTypeCard}>
            <div style={styles.nodeTypeHeader}>
              <span style={styles.nodeIcon}>{nodeType.icon}</span>
              <strong style={styles.nodeName}>{nodeType.name}</strong>
            </div>
            <p style={styles.nodeDescription}>{nodeType.description}</p>
            <div style={styles.nodeMeta}>
              <span style={styles.nodeSize}>
                {nodeType.defaultWidth}×{nodeType.defaultHeight}
              </span>
              <button
                onClick={() => handleAddNode(nodeType.id)}
                style={styles.addButton}
                title={`Добавить ноду "${nodeType.name}"`}
              >
                ➕ Добавить
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {nodeTypes.length === 0 && (
        <div style={styles.emptyState}>
          <p>⏳ Типы нод загружаются...</p>
          <p style={{ fontSize: '0.9em' }}>Убедитесь, что NodeRegistry инициализирован.</p>
        </div>
      )}
      
      <div style={styles.footer}>
        <small>
          Доступно нод: {nodeTypes.length} | 
          Экземпляров: {coreOrchestrator.getAllNodeInstances().length}
        </small>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '15px',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    border: '1px solid #eaeaea'
  },
  collapsedContainer: {
    padding: '10px',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    border: '1px solid #eaeaea',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  title: {
    margin: 0,
    color: '#333'
  },
  collapseButton: {
    background: 'none',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '2px 8px',
    cursor: 'pointer',
    fontSize: '1em'
  },
  expandButton: {
    background: 'none',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '5px 10px',
    cursor: 'pointer',
    fontSize: '1.2em'
  },
  description: {
    fontSize: '0.9em',
    color: '#666',
    margin: '0 0 15px 0'
  },
  nodeList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '15px',
    marginBottom: '15px'
  },
  nodeTypeCard: {
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #e9ecef',
    transition: 'all 0.2s ease'
  },
  nodeTypeHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px'
  },
  nodeIcon: {
    fontSize: '1.5em',
    marginRight: '10px'
  },
  nodeName: {
    fontSize: '1.1em',
    color: '#333'
  },
  nodeDescription: {
    fontSize: '0.85em',
    color: '#666',
    margin: '0 0 10px 0',
    minHeight: '40px'
  },
  nodeMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  nodeSize: {
    fontSize: '0.8em',
    color: '#999',
    background: '#fff',
    padding: '2px 6px',
    borderRadius: '3px',
    border: '1px solid #eee'
  },
  addButton: {
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '0.85em',
    fontWeight: 'bold' as const,
    transition: 'background 0.2s ease'
  },
  emptyState: {
    padding: '30px 20px',
    textAlign: 'center' as const,
    color: '#999',
    background: '#f8f9fa',
    borderRadius: '6px',
    border: '1px dashed #dee2e6'
  },
  footer: {
    marginTop: '15px',
    paddingTop: '10px',
    borderTop: '1px solid #eee',
    fontSize: '0.8em',
    color: '#888',
    textAlign: 'center' as const
  }
};

export default NodeToolbar;
