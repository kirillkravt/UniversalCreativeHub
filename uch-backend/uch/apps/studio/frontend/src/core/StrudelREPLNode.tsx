// uch/apps/studio/frontend/src/core/StrudelREPLNode.tsx
// МОК-версия для демонстрации UI (реальный Strudel - задача на неделю 2)

import React, { useState, useEffect, useRef } from 'react';

interface StrudelREPLNodeProps {
  nodeId: string;
  core?: any;
}

const StrudelREPLNode: React.FC<StrudelREPLNodeProps> = ({ nodeId, core }) => {
  const [code, setCode] = useState<string>('note("c4")');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [output, setOutput] = useState<string>('// Нажмите Eval для тестирования UI');
  const [status, setStatus] = useState<string>('✅ Готов к работе (mock-режим)');

  const handleEval = () => {
    if (!code.trim()) {
      setOutput('Введите код Strudel');
      return;
    }
    
    setIsPlaying(true);
    setOutput('Выполнение (mock)...');
    
    // Имитация работы Strudel
    setTimeout(() => {
      setIsPlaying(false);
      
      // Простые mock-ответы для разных кодов
      if (code.includes('note(')) {
        setOutput('🎵 Mock: Воспроизводится нота/аккорд\n' +
                 '├─ pattern: Note("c4")\n' +
                 '└─ status: playing');
      } else if (code.includes('s(')) {
        setOutput('🥁 Mock: Воспроизводится барабанный паттерн\n' +
                 '├─ pattern: Sound("bd sd")\n' +
                 '└─ status: playing');
      } else if (code.includes('error')) {
        setOutput('❌ Mock ошибка: Неверный синтаксис Strudel');
      } else {
        setOutput(`✅ Mock выполнен: "${code}"\n` +
                 '⚠️  Реальный Strudel будет подключен на неделе 2');
      }
    }, 1000);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setOutput('⏹ Остановлено (mock)');
  };

  const handleExample = (exampleCode: string) => {
    setCode(exampleCode);
  };

  return (
    <div style={{
      padding: '15px',
      backgroundColor: '#1a1a1a',
      borderRadius: '8px',
      border: '1px solid #333',
      color: '#f0f0f0',
      fontFamily: 'monospace',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ marginBottom: '10px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#4ecdc4' }}>
          🎹 Strudel REPL (MOCK для Дня 4)
        </h3>
        <div style={{ fontSize: '0.8em', color: '#888', marginBottom: '10px' }}>
          Node ID: {nodeId} | {status}
        </div>
      </div>
      
      <div style={{ marginBottom: '15px', flex: 1 }}>
        <div style={{ marginBottom: '8px', fontSize: '0.9em' }}>
          Код Strudel:
          <span style={{ float: 'right', fontSize: '0.8em', color: '#888' }}>
            Примеры: 
            <button onClick={() => handleExample('note("c4")')} style={{ marginLeft: '5px', padding: '2px 6px', fontSize: '0.7em' }}>note</button>
            <button onClick={() => handleExample('s("bd sd")')} style={{ marginLeft: '5px', padding: '2px 6px', fontSize: '0.7em' }}>drums</button>
          </span>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{
            width: '100%',
            height: '120px',
            backgroundColor: '#2a2a2a',
            color: '#f0f0f0',
            border: '1px solid #444',
            borderRadius: '4px',
            padding: '8px',
            fontFamily: 'monospace',
            fontSize: '14px',
            resize: 'vertical',
            marginBottom: '10px'
          }}
          placeholder='note("c4")'
        />
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button
            onClick={handleEval}
            disabled={isPlaying}
            style={{
              padding: '8px 16px',
              backgroundColor: isPlaying ? '#555' : '#4ecdc4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isPlaying ? 'not-allowed' : 'pointer',
              flex: 1
            }}
          >
            {isPlaying ? 'Выполняется...' : 'Eval (mock) ▶'}
          </button>
          
          <button
            onClick={handleStop}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            Stop (mock) ⏹
          </button>
        </div>
        
        <div style={{ marginBottom: '8px', fontSize: '0.9em' }}>Результат:</div>
        <pre style={{
          backgroundColor: '#2a2a2a',
          padding: '10px',
          borderRadius: '4px',
          border: '1px solid #444',
          minHeight: '60px',
          maxHeight: '120px',
          overflow: 'auto',
          fontSize: '12px',
          color: '#a0e7a0'
        }}>
          {output}
        </pre>
      </div>
      
      <div style={{
        fontSize: '0.75em',
        color: '#666',
        borderTop: '1px solid #333',
        paddingTop: '10px',
        marginTop: 'auto'
      }}>
        📝 <strong>День 4:</strong> Mock UI работает. <strong>Неделя 2:</strong> Реальный Strudel с WebAudio.
      </div>
    </div>
  );
};

export default StrudelREPLNode;
