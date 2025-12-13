import React, { useState, useEffect } from 'react'
import { coreOrchestrator, TransportState, NodeDescriptor } from './CoreOrchestrator'

const CoreTest: React.FC = () => {
  const [transport, setTransport] = useState<TransportState>(coreOrchestrator.getTransportState())
  const [tempo, setTempo] = useState(transport.tempo)
  const [nodes, setNodes] = useState<NodeDescriptor[]>(coreOrchestrator.getAllNodes())
  
  // Подписываемся на события ядра
  useEffect(() => {
    const updateTransport = () => {
      const newTransportState = coreOrchestrator.getTransportState();
      setTransport(newTransportState);
      // КРИТИЧНО: Обновляем локальное состояние темпа для слайдера
      setTempo(newTransportState.tempo);
    };
    
    const updateNodes = () => {
      setNodes(coreOrchestrator.getAllNodes());
    };
    
    // Подписка на события
    coreOrchestrator.on('transport:start', updateTransport)
    coreOrchestrator.on('transport:stop', updateTransport)
    coreOrchestrator.on('transport:pause', updateTransport)
    coreOrchestrator.on('tempo:change', updateTransport)
    coreOrchestrator.on('clock:tick', updateTransport)
    coreOrchestrator.on('node:added', updateNodes)
    coreOrchestrator.on('node:removed', updateNodes)
    
    return () => {
      coreOrchestrator.removeAllListeners()
    }
  }, [])
  
  const handleStart = () => {
    coreOrchestrator.startTransport()
  }
  
  const handleStop = () => {
    coreOrchestrator.stopTransport()
  }
  
  const handlePause = () => {
    coreOrchestrator.pauseTransport()
  }
  
  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTempo = parseInt(e.target.value)
    setTempo(newTempo)
  }
  
  const handleTempoSubmit = () => {
    coreOrchestrator.setTempo(tempo)
  }
  
  const handleAddTestNode = () => {
    const nodeId = 'test-node-' + Date.now()
    coreOrchestrator.addNode({
      id: nodeId,
      type: 'TestNode',
      name: 'Тестовая нода',
      position: { x: Math.random() * 500, y: Math.random() * 300 },
      state: { test: 'data', random: Math.random() },
      inputs: [],
      outputs: []
    })
  }
  
  const handleRemoveNode = (nodeId: string) => {
    coreOrchestrator.removeNode(nodeId)
  }
  
  const formatTime = (time: number): string => {
    const bars = Math.floor(time / transport.timeSignature[0]) + 1
    const beats = Math.floor(time % transport.timeSignature[0]) + 1
    const sixteenths = Math.floor((time % 1) * 4) + 1
    return `${bars}:${beats}:${sixteenths}`
  }
  
  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px' }}>🎛️ Core Orchestrator Test</h3>
      
      {/* Транспорт */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Транспорт</h4>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button onClick={handleStart} disabled={transport.isPlaying}
            style={{ padding: '8px 16px', background: transport.isPlaying ? '#4a5568' : '#48bb78', color: 'white', border: 'none', borderRadius: '6px', cursor: transport.isPlaying ? 'not-allowed' : 'pointer' }}>
            ▶️ Start
          </button>
          <button onClick={handleStop}
            style={{ padding: '8px 16px', background: '#f56565', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            ⏹️ Stop
          </button>
          <button onClick={handlePause} disabled={!transport.isPlaying}
            style={{ padding: '8px 16px', background: !transport.isPlaying ? '#4a5568' : '#ed8936', color: 'white', border: 'none', borderRadius: '6px', cursor: !transport.isPlaying ? 'not-allowed' : 'pointer' }}>
            ⏸️ Pause
          </button>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <div>Tempo: {transport.tempo} BPM</div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input type="range" min="40" max="240" value={tempo} onChange={handleTempoChange} style={{ flex: 1 }} />
            <button onClick={handleTempoSubmit} style={{ padding: '5px 15px', background: '#4299e1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Set
            </button>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <strong>Текущее время:</strong><br />
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatTime(transport.currentTime)}</span>
          </div>
          <div>
            <strong>Размер такта:</strong><br />
            {transport.timeSignature[0]}/{transport.timeSignature[1]}
          </div>
        </div>
      </div>
      
      {/* Ноды */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Ноды ({nodes.length})</h4>
        <button onClick={handleAddTestNode} style={{ padding: '8px 16px', background: '#9f7aea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '10px' }}>
          ➕ Добавить тестовую ноду
        </button>
        
        {nodes.length === 0 ? (
          <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '6px' }}>
            Ноды отсутствуют
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {nodes.map(node => (
              <div key={node.id} style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '6px', minWidth: '150px' }}>
                <div><strong>{node.name}</strong></div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>{node.type}</div>
                <div style={{ fontSize: '11px', marginTop: '5px' }}>ID: {node.id.slice(0, 8)}...</div>
                <button onClick={() => handleRemoveNode(node.id)} style={{ marginTop: '5px', padding: '3px 8px', background: '#f56565', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Информация */}
      <div style={{ fontSize: '12px', opacity: 0.8, fontFamily: 'monospace', borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '10px' }}>
        CoreOrchestrator v0.2 | React {React.version} | {new Date().toLocaleTimeString()}
      </div>
    </div>
  )
}

export default CoreTest
