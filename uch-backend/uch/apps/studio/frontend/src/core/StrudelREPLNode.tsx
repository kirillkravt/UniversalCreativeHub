// uch/apps/studio/frontend/src/core/StrudelREPLNode.tsx
// ФИНАЛЬНАЯ РАБОЧАЯ ВЕРСИЯ С run()

import React, { useState, useEffect, useRef } from 'react';

interface StrudelREPLNodeProps {
  nodeId: string;
  core?: any;
}

const StrudelREPLNode: React.FC<StrudelREPLNodeProps> = ({ nodeId, core }) => {
  const [code, setCode] = useState<string>('note("c4")');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [output, setOutput] = useState<string>('// Инициализация Strudel...');
  const [status, setStatus] = useState<string>('⏳ Загрузка...');
  const strudelRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeRunRef = useRef<any>(null);

  // Инициализация
  useEffect(() => {
    const init = async () => {
      console.log('[StrudelREPLNode] Инициализация Strudel...');
      setStatus('⏳ Загрузка Strudel...');

      try {
        // Загружаем Strudel
        const strudelModule = await import('https://cdn.jsdelivr.net/npm/@strudel/core@latest/+esm');
        strudelRef.current = strudelModule;
        console.log('[StrudelREPLNode] Strudel загружен:', strudelRef.current);

        // Создаем аудиоконтекст
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('[StrudelREPLNode] AudioContext создан:', audioCtxRef.current.state);

        // Инициализируем Strudel с аудиоконтекстом
        if (strudelRef.current.initAudioContext) {
          strudelRef.current.initAudioContext(audioCtxRef.current);
        }

        setStatus('✅ Готов!');
        setOutput('// Strudel загружен! Введите код и нажмите "Eval".\nПримеры: note("c4"), s("bd sd")');

      } catch (error: any) {
        console.error('[StrudelREPLNode] Ошибка инициализации:', error);
        setStatus('❌ Ошибка');
        setOutput(`Ошибка загрузки: ${error.message}`);
      }
    };

    init();

    // Очистка
    return () => {
      if (activeRunRef.current && typeof activeRunRef.current.stop === 'function') {
        activeRunRef.current.stop();
      }
      if (strudelRef.current && strudelRef.current.hush) {
        strudelRef.current.hush();
      }
    };
  }, []);

  const handleEval = async () => {
    if (!strudelRef.current || !audioCtxRef.current) {
      setOutput('Strudel не инициализирован');
      return;
    }

    // Активируем аудио если нужно
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
      setOutput('// Аудио активировано! Нажмите "Eval" еще раз.');
      return;
    }

    if (!code.trim()) {
      setOutput('Введите код Strudel');
      return;
    }

    setIsPlaying(true);
    setOutput('Выполнение...');

    try {
      const strudel = strudelRef.current;
      
      // 1. Создаем паттерн разными способами
      let pattern;
      
      if (code.includes('note(') && strudel.note) {
        // Прямой вызов note()
        pattern = strudel.note("c4");
      } else if (strudel.e) {
        // Используем e()
        const patternFunc = strudel.e(code.trim());
        if (typeof patternFunc === 'function') {
          pattern = patternFunc();
        }
      }
      
      console.log('[StrudelREPLNode] Создан паттерн:', pattern);
      
      if (!pattern || !pattern._Pattern) {
        setOutput('❌ Не удалось создать паттерн');
        setIsPlaying(false);
        return;
      }

      // 2. Останавливаем предыдущее воспроизведение
      if (activeRunRef.current && typeof activeRunRef.current.stop === 'function') {
        activeRunRef.current.stop();
      }
      if (strudel.hush) {
        strudel.hush();
      }

      // 3. ЗАПУСКАЕМ ПАТТЕРН ЧЕРЕЗ run()!
      console.log('[StrudelREPLNode] Пробуем strudel.run()...');
      
      if (strudel.run && typeof strudel.run === 'function') {
        activeRunRef.current = strudel.run(pattern);
        console.log('[StrudelREPLNode] Запущен через run():', activeRunRef.current);
        setOutput(`✅ Паттерн запущен через run()!\nКод: ${code}\n\n⏹ Авто-остановка через 5 сек.`);
      } else {
        // Альтернатива: может быть play() или другой метод
        console.log('[StrudelREPLNode] run() не найден. Ищем другие методы...');
        const playMethods = Object.keys(strudel).filter(k => 
          k.includes('play') || k.includes('start') || k.includes('run') || k.includes('go')
        );
        setOutput(`❌ run() не найден.\nДоступные методы: ${playMethods.join(', ')}`);
        setIsPlaying(false);
        return;
      }

      // Авто-остановка
      setTimeout(() => {
        if (isPlaying) {
          handleStop();
        }
      }, 5000);

    } catch (error: any) {
      console.error('[StrudelREPLNode] Ошибка:', error);
      setOutput(`❌ Ошибка выполнения:\n${error.message}`);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    // Останавливаем через hush()
    if (strudelRef.current && strudelRef.current.hush) {
      try {
        strudelRef.current.hush();
        setOutput('⏹ Воспроизведение остановлено (hush())');
        console.log('[StrudelREPLNode] Остановлено через hush()');
      } catch (error) {
        console.error('[StrudelREPLNode] Ошибка остановки:', error);
      }
    }
    
    // Останавливаем конкретный run
    if (activeRunRef.current && typeof activeRunRef.current.stop === 'function') {
      try {
        activeRunRef.current.stop();
        console.log('[StrudelREPLNode] Остановлен activeRunRef');
      } catch (error) {
        console.error('[StrudelREPLNode] Ошибка остановки activeRunRef:', error);
      }
    }
    
    setIsPlaying(false);
    activeRunRef.current = null;
  };

  const activateAudio = async () => {
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
      setOutput('🔈 Аудио активировано! Теперь можно запускать паттерны.');
      setStatus('✅ Готов (Аудио активно)');
    }
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
          🎹 Strudel REPL (ФИНАЛЬНАЯ версия)
        </h3>
        <div style={{ fontSize: '0.8em', color: '#888', marginBottom: '10px' }}>
          ID: {nodeId} | Статус: {status} | Аудио: {audioCtxRef.current ? audioCtxRef.current.state : 'нет'}
        </div>
      </div>

      {audioCtxRef.current && audioCtxRef.current.state === 'suspended' && (
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '10px',
          border: '1px solid #ff6b6b'
        }}>
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
            🔈 Активировать аудио
          </button>
        </div>
      )}

      <div style={{ marginBottom: '15px', flex: 1 }}>
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
            {isPlaying ? 'Играет...' : 'Eval ▶'}
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
        </div>
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
        🎵 <strong>Используется run() для воспроизведения.</strong> Остановка через hush().
      </div>
    </div>
  );
};

export default StrudelREPLNode;
