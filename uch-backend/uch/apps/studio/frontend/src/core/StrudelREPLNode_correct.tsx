// uch/apps/studio/frontend/src/core/StrudelREPLNode.tsx
// КОРРЕКТНАЯ версия загрузки Strudel по официальной документации

import React, { useState, useEffect, useRef } from 'react';

interface StrudelREPLNodeProps {
  nodeId: string;
  core?: any;
}

const StrudelREPLNode: React.FC<StrudelREPLNodeProps> = ({ nodeId, core }) => {
  const [code, setCode] = useState<string>('note("c4")');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [output, setOutput] = useState<string>('// Инициализация Strudel...');
  const [status, setStatus] = useState<string>('⏳ Инициализация...');
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [strudelLoaded, setStrudelLoaded] = useState<boolean>(false);
  const patternInstanceRef = useRef<any>(null);

  // CORRECT APPROACH: Используем официальный метод загрузки Strudel
  useEffect(() => {
    console.log('[StrudelREPLNode] Начинаем корректную загрузку Strudel');
    setStatus('⏳ Загрузка Strudel...');
    setOutput('Загрузка библиотеки Strudel с официального CDN...');

    const loadStrudelCorrectly = async () => {
      try {
        // 1. Сначала загружаем мини-версию инициализатора
        console.log('[Strudel] Шаг 1: Загрузка инициализатора...');
        
        // Используем официальный CDN путь для ESM модулей
        // Вместо прямого импорта .min.js, используем подход из документации Strudel
        const initModule = await import('https://cdn.jsdelivr.net/npm/@strudel.cycles/mini@0.10.0/dist/index.js');
        
        console.log('[Strudel] Инициализатор загружен:', initModule);
        setStatus('⏳ Инициализация аудио...');
        setOutput('Strudel загружен. Инициализация аудиоконтекста...');

        // 2. Создаем аудиоконтекст
        if (!audioContext) {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          setAudioContext(ctx);
          
          // Устанавливаем глобальный аудиоконтекст для Strudel
          if (initModule.initAudioContext) {
            initModule.initAudioContext(ctx);
          }
          
          setStatus('✅ Strudel готов!');
          setOutput('// Strudel инициализирован! Введите код и нажмите Eval.\nПримеры: note("c4"), s("bd sd")');
          setStrudelLoaded(true);
        }

      } catch (error: any) {
        console.error('[StrudelREPLNode] Ошибка загрузки:', error);
        
        // ALTERNATIVE: Пробуем загрузить через script tag
        setStatus('⚠️ Пробуем альтернативный метод...');
        setOutput('Проблема с импортом модулей. Пробуем альтернативный метод...');
        
        setTimeout(() => {
          loadStrudelViaScriptTag();
        }, 1000);
      }
    };

    // Альтернативный метод: загрузка через script tag
    const loadStrudelViaScriptTag = () => {
      return new Promise<void>((resolve) => {
        console.log('[Strudel] Альтернативный метод: script tag');
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@strudel.cycles/mini@0.10.0/dist/strudel.js';
        script.type = 'module';
        
        script.onload = () => {
          console.log('[Strudel] Скрипт загружен через script tag');
          setStatus('✅ Strudel загружен (альтернативный метод)');
          setOutput('// Strudel загружен через script tag. Готов к использованию.');
          setStrudelLoaded(true);
          
          // Инициализируем аудиоконтекст
          if (!audioContext) {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            setAudioContext(ctx);
          }
          
          resolve();
        };
        
        script.onerror = (error) => {
          console.error('[Strudel] Ошибка загрузки script:', error);
          setStatus('❌ Ошибка загрузки');
          setOutput('Не удалось загрузить Strudel. Проверьте консоль для деталей.');
          resolve();
        };
        
        document.head.appendChild(script);
      });
    };

    // Начинаем загрузку
    loadStrudelCorrectly();
    
    // Очистка
    return () => {
      if (patternInstanceRef.current) {
        try {
          patternInstanceRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const activateAudio = async () => {
    if (audioContext && audioContext.state === 'suspended') {
      await audioContext.resume();
      setStatus('✅ Аудио активировано');
      setOutput('// Аудио активировано. Можно играть.');
    } else if (!audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
      setStatus('✅ Аудио создано');
      setOutput('// Аудиоконтекст создан. Можно играть.');
    }
  };

  const handleEval = async () => {
    if (!strudelLoaded) {
      setOutput('Strudel не загружен. Подождите...');
      return;
    }

    if (!audioContext || audioContext.state === 'suspended') {
      setOutput('⚠️ Аудио не активировано. Нажмите "Activate Audio" или кликните по странице.');
      return;
    }

    if (!code.trim()) {
      setOutput('Введите код Strudel');
      return;
    }

    setIsPlaying(true);
    setOutput('Выполнение...');

    try {
      // ВРЕМЕННО: mock-результат пока настраиваем интеграцию
      setTimeout(() => {
        setIsPlaying(false);
        
        // Симулируем разные ответы
        const mockResponses = [
          `🎵 Mock: Код выполнен: ${code}`,
          `✅ Strudel обработал паттерн`,
          `⏱ Длительность: 4 такта`,
          `🎹 Ноты: c4, e4, g4`
        ];
        
        setOutput(mockResponses[Math.floor(Math.random() * mockResponses.length)] + 
                 '\n⚠️ Реальная интеграция в процессе настройки');
      }, 800);

    } catch (error: any) {
      console.error('[StrudelREPLNode] Ошибка выполнения:', error);
      setOutput(`❌ Ошибка: ${error.message}`);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (patternInstanceRef.current) {
      try {
        patternInstanceRef.current.stop();
        setOutput('⏹ Воспроизведение остановлено');
      } catch (error) {
        console.error('[StrudelREPLNode] Ошибка остановки:', error);
      }
      patternInstanceRef.current = null;
    }
    setIsPlaying(false);
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
          🎹 Strudel REPL (Отладка интеграции)
        </h3>
        <div style={{ fontSize: '0.8em', color: '#888', marginBottom: '10px' }}>
          Node ID: {nodeId} | {status} | Strudel: {strudelLoaded ? '✅' : '❌'} | Audio: {audioContext ? audioContext.state : 'нет'}
        </div>
      </div>
      
      {(!audioContext || audioContext.state === 'suspended') && (
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '10px',
          border: '1px solid #ff6b6b'
        }}>
          <div style={{ color: '#ff6b6b', marginBottom: '5px' }}>
            ⚠️ Требуется активация аудио
          </div>
          <button
            onClick={activateAudio}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4ecdc4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔈 Activate Audio
          </button>
          <div style={{ fontSize: '0.8em', color: '#888', marginTop: '5px' }}>
            Браузеры требуют жеста пользователя для включения звука
          </div>
        </div>
      )}
      
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
            disabled={isPlaying || !strudelLoaded}
            style={{
              padding: '8px 16px',
              backgroundColor: isPlaying ? '#555' : (strudelLoaded ? '#4ecdc4' : '#777'),
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (isPlaying || !strudelLoaded) ? 'not-allowed' : 'pointer',
              flex: 1
            }}
          >
            {isPlaying ? 'Выполняется...' : (strudelLoaded ? 'Eval ▶' : 'Загрузка...')}
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
            Stop ⏹
          </button>
        </div>
        
        <div style={{ marginBottom: '8px', fontSize: '0.9em' }}>
          Результат:
          <span style={{ float: 'right', fontSize: '0.8em', color: strudelLoaded ? '#4ecdc4' : '#ff6b6b' }}>
            Strudel: {strudelLoaded ? 'Загружен' : 'Загрузка...'}
          </span>
        </div>
        <pre style={{
          backgroundColor: '#2a2a2a',
          padding: '10px',
          borderRadius: '4px',
          border: '1px solid '#444',
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
        borderTop: '1px solid '#333',
        paddingTop: '10px',
        marginTop: 'auto'
      }}>
        🔧 <strong>Режим отладки:</strong> Пробуем официальные методы загрузки Strudel. Проверяем консоль для диагностики.
      </div>
    </div>
  );
};

export default StrudelREPLNode;
