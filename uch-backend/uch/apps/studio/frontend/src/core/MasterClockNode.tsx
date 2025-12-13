import React, { useState, useEffect, useCallback } from 'react';
import { CoreEventType } from './CoreOrchestrator';

// Интерфейс пропсов компонента
interface MasterClockNodeProps {
  nodeId: string;
  core: any; // Будет типизирован позже через import типа CoreOrchestrator
}

const MasterClockNode: React.FC<MasterClockNodeProps> = ({ nodeId, core }) => {
  // Локальное состояние для отображения
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:0:0');
  const [tempo, setTempo] = useState(120);
  const [timeSignature, setTimeSignature] = useState<[number, number]>([4, 4]);

  // Функция для обновления UI из состояния CoreOrchestrator
  const updateTransportState = useCallback(() => {
    if (!core) return;
    const state = core.getTransportState();
    setIsPlaying(state.isPlaying);
    setTempo(state.tempo);
    setTimeSignature(state.timeSignature);
    // Форматируем время в bar:beat:sixteenth
    const timeStr = `${state.currentBar}:${state.currentBeat}:${state.currentSixteenth}`;
    setCurrentTime(timeStr);
  }, [core]);

  // Эффект для подписки на события CoreOrchestrator
  useEffect(() => {
    if (!core) return;

    // Первоначальное обновление состояния
    updateTransportState();

    // Обработчики событий, которые должны обновлять UI
    const handleTransportChange = () => updateTransportState();
    const handleTempoChange = () => updateTransportState();
    const handleClockTick = () => updateTransportState();

    // Подписка на события
    core.on(CoreEventType.TRANSPORT_START, handleTransportChange);
    core.on(CoreEventType.TRANSPORT_STOP, handleTransportChange);
    core.on(CoreEventType.TRANSPORT_PAUSE, handleTransportChange);
    core.on(CoreEventType.TEMPO_CHANGE, handleTempoChange);
    core.on(CoreEventType.CLOCK_TICK, handleClockTick);

    // Отписка при размонтировании компонента
    return () => {
      core.off(CoreEventType.TRANSPORT_START, handleTransportChange);
      core.off(CoreEventType.TRANSPORT_STOP, handleTransportChange);
      core.off(CoreEventType.TRANSPORT_PAUSE, handleTransportChange);
      core.off(CoreEventType.TEMPO_CHANGE, handleTempoChange);
      core.off(CoreEventType.CLOCK_TICK, handleClockTick);
    };
  }, [core, updateTransportState]);

  // Обработчики UI
  const handlePlay = () => core?.startTransport();
  const handleStop = () => core?.stopTransport();
  const handlePause = () => core?.pauseTransport();
  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTempo = parseInt(e.target.value, 10);
    if (!isNaN(newTempo)) {
      setTempo(newTempo); // Локальное обновление для отзывчивости UI
    }
  };
  const handleSetTempo = () => {
    if (core && tempo >= 20 && tempo <= 300) {
      core.setTempo(tempo);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>⏱ Master Clock</h3>
      
      <div style={styles.timeDisplay}>
        <span style={styles.timeText}>{currentTime}</span>
        <div style={styles.timeSignature}>
          {timeSignature[0]}/{timeSignature[1]}
        </div>
      </div>

      <div style={styles.transportControls}>
        <button 
          onClick={handlePlay} 
          style={{...styles.button, ...(isPlaying ? styles.buttonActive : {})}}
          disabled={isPlaying}
        >
          ▶️ Play
        </button>
        <button 
          onClick={handleStop} 
          style={styles.button}
          disabled={!isPlaying}
        >
          ⏹️ Stop
        </button>
        <button 
          onClick={handlePause} 
          style={styles.button}
          disabled={!isPlaying}
        >
          ⏸️ Pause
        </button>
      </div>

      <div style={styles.tempoSection}>
        <label style={styles.label}>Tempo: {tempo} BPM</label>
        <div style={styles.tempoControls}>
          <input
            type="range"
            min="20"
            max="300"
            value={tempo}
            onChange={handleTempoChange}
            style={styles.slider}
          />
          <button onClick={handleSetTempo} style={styles.setButton}>
            Set
          </button>
        </div>
      </div>

      <div style={styles.status}>
        Status: <span style={isPlaying ? styles.statusPlaying : styles.statusStopped}>
          {isPlaying ? 'Playing' : 'Stopped'}
        </span>
      </div>
    </div>
  );
};

// Inline стили для компонента
const styles = {
  container: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    padding: '20px',
    color: 'white',
    fontFamily: 'monospace',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    minWidth: '280px',
  },
  title: {
    marginTop: 0,
    marginBottom: '20px',
    textAlign: 'center' as const,
    fontSize: '1.5em',
  },
  timeDisplay: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    background: 'rgba(0,0,0,0.2)',
    padding: '15px',
    borderRadius: '8px',
  },
  timeText: {
    fontSize: '2.5em',
    fontWeight: 'bold',
    fontVariantNumeric: 'tabular-nums' as const,
  },
  timeSignature: {
    fontSize: '1.2em',
    opacity: 0.8,
  },
  transportControls: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  button: {
    flex: 1,
    padding: '10px',
    border: 'none',
    borderRadius: '6px',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonActive: {
    background: 'rgba(255,255,255,0.3)',
  },
  tempoSection: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '0.9em',
    opacity: 0.9,
  },
  tempoControls: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: '6px',
    borderRadius: '3px',
    background: 'rgba(255,255,255,0.2)',
    outline: 'none',
  },
  setButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    cursor: 'pointer',
  },
  status: {
    fontSize: '0.9em',
    textAlign: 'center' as const,
    paddingTop: '15px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  statusPlaying: {
    color: '#4ade80',
    fontWeight: 'bold',
  },
  statusStopped: {
    color: '#f87171',
    fontWeight: 'bold',
  },
};

export default MasterClockNode;
