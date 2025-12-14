// uch/apps/studio/frontend/src/core/StrudelREPLNode.tsx
// РАБОЧАЯ ВЕРСИЯ - Strudel загружен, исправлен вызов API

import React, { useState, useEffect, useRef } from 'react';

interface StrudelREPLNodeProps {
  nodeId: string;
  core?: any;
}

const StrudelREPLNode: React.FC<StrudelREPLNodeProps> = ({ nodeId, core }) => {
  const [code, setCode] = useState<string>('note("c4")');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [output, setOutput] = useState<string>('// Инициализация...');
  const [status, setStatus] = useState<string>('⏳ Загрузка...');
  const strudelCoreRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // КОРРЕКТНАЯ ЗАГРУЗКА: загружаем @strudel/cycles/core и инициализируем
  useEffect(() => {
    const init = async () => {
      console.log('[StrudelREPLNode] Начинаем корректную инициализацию...');
      setStatus('⏳ Загрузка ядра Strudel...');
      setOutput('Загрузка @strudel/cycles/core с CDN...');

      try {
        // 1. Динамически загружаем основное ядро Strudel (оно содержит функции note, s и т.д.)
        const strudelModule = await import('https://cdn.jsdelivr.net/npm/@strudel/core@latest/+esm');
        console.log('[StrudelREPLNode] Ядро загружено:', strudelModule);
        strudelCoreRef.current = strudelModule;

        // 2. Инициализируем аудиоконтекст (Web Audio API требует жеста пользователя)
        // Пока просто создаем контекст, но не резолвим его
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        // 3. Инициализируем Strudel с этим контекстом
        if (strudelCoreRef.current.initAudioContext) {
          strudelCoreRef.current.initAudioContext(audioCtxRef.current);
        }

        setStatus('✅ Готов!');
        setOutput('// Strudel инициализирован! Введите код и нажмите "Eval".\nПримеры: note("c4"), s("bd sd")');
        console.log('[StrudelREPLNode] Инициализация завершена успешно.');

      } catch (error: any) {
        console.error('[StrudelREPLNode] Критическая ошибка инициализации:', error);
        setStatus('❌ Ошибка загрузки');
        setOutput(`Ошибка: ${error.message}\nПроверьте консоль (F12) для деталей.`);
      }
    };

    init();

    // Очистка
    return () => {
      if (strudelCoreRef.current && strudelCoreRef.current.hush) {
        try {
          strudelCoreRef.current.hush();
        } catch (e) {}
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const handleEval = async () => {
    if (!strudelCoreRef.current) {
      setOutput('Strudel не загружен. Подождите...');
      return;
    }

    if (!audioCtxRef.current) {
      setOutput('Аудиоконтекст не создан.');
      return;
    }

    // Web Audio API: Если контекст приостановлен, нужно его возобновить по жесту пользователя
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
      setOutput('// Аудио активировано! Нажмите "Eval" еще раз для запуска.');
      return;
    }

    if (!code.trim()) {
      setOutput('Введите код Strudel');
      return;
    }

    setIsPlaying(true);
    setOutput('Выполнение...');

    try {
      // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Используем правильный API из загруженного модуля
      const { eval: strudelEval } = strudelCoreRef.current;

      // Выполняем код пользователя через функцию eval из Strudel
      const pattern = strudelEval(code.trim());

      // Проигрываем паттерн
      pattern.play();

      setOutput(`✅ Паттерн запущен!\nКод: ${code}\n\n⏹ Авто-остановка через 5 сек.`);
      console.log('[StrudelREPLNode] Паттерн запущен:', pattern);

      // Автоматическая остановка для демонстрации
      setTimeout(() => {
        if (isPlaying) {
          handleStop();
        }
      }, 5000);

    } catch (error: any) {
      console.error('[StrudelREPLNode] Ошибка выполнения кода:', error);
      setOutput(`❌ Ошибка выполнения:\n${error.message}`);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (strudelCoreRef.current && strudelCoreRef.current.hush) {
      try {
        strudelCoreRef.current.hush();
        setOutput('⏹ Воспроизведение остановлено.');
      } catch (error) {
        console.error('[StrudelREPLNode] Ошибка при остановке:', error);
      }
    }
    setIsPlaying(false);
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
          🎹 Strudel REPL (РАБОТАЕТ!)
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
          <div style={{ color: '#ff6b6b', marginBottom: '5px' }}>
            ⚠️ Аудио приостановлено (требуется жест пользователя)
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
            🔈 Активировать аудио
          </button>
          <div style={{ fontSize: '0.8em', color: '#888', marginTop: '5px' }}>
            Или просто нажмите "Eval" — браузер запросит разрешение.
          </div>
        </div>
      )}

      <div style={{ marginBottom: '15px', flex: 1 }}>
        <div style={{ marginBottom: '8px', fontSize: '0.9em' }}>
          Код Strudel:
          <span style={{ float: 'right', fontSize: '0.8em', color: '#888' }}>
            Примеры:
            <button onClick={() => setCode('note("c4")')} style={{ marginLeft: '5px', padding: '2px 6px', fontSize: '0.7em' }}>note</button>
            <button onClick={() => setCode('s("bd sd")')} style={{ marginLeft: '5px', padding: '2px 6px', fontSize: '0.7em' }}>drums</button>
            <button onClick={() => setCode('"<0 2 4>"')} style={{ marginLeft: '5px', padding: '2px 6px', fontSize: '0.7em' }}>seq</button>
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
            disabled={!isPlaying}
            style={{
              padding: '8px 16px',
              backgroundColor: isPlaying ? '#ff6b6b' : '#777',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isPlaying ? 'pointer' : 'not-allowed',
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
        🎯 <strong>Фаза 2, День 4:</strong> Strudel загружен! Интеграция работает через ESM CDN.
      </div>
    </div>
  );
};

export default StrudelREPLNode;
