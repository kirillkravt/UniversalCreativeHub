/**
 * Ядро-оркестратор - центральный координатор всех нод
 */
export class CoreOrchestrator {
  private masterClock: MasterClock;
  private nodes: Map<string, AudioNode> = new Map();
  private isPlaying: boolean = false;
  
  constructor() {
    this.masterClock = new MasterClock(120); // BPM
  }
  
  start(): void {
    this.isPlaying = true;
    this.masterClock.start();
  }
  
  stop(): void {
    this.isPlaying = false;
    this.masterClock.stop();
  }
  
  setTempo(bpm: number): void {
    this.masterClock.setTempo(bpm);
  }
  
  addNode(nodeId: string, node: AudioNode): void {
    this.nodes.set(nodeId, node);
  }
  
  removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
  }
}

/**
 * Мастер-часы для синхронизации транспорта
 */
class MasterClock {
  private bpm: number;
  private intervalId: number | null = null;
  
  constructor(bpm: number) {
    this.bpm = bpm;
  }
  
  start(): void {
    if (this.intervalId) return;
    
    const intervalMs = 60000 / this.bpm / 4; // 16th notes
    this.intervalId = window.setInterval(() => {
      // Tick event will be implemented
    }, intervalMs);
  }
  
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  setTempo(bpm: number): void {
    this.bpm = bpm;
    if (this.intervalId) {
      this.stop();
      this.start();
    }
  }
}
