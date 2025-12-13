/**
 * CoreOrchestrator - центральное ядро управления студией
 * Версия 0.2 - Фаза 2 (месяц 3), обновлено 13.12.2025
 * Исправлено: TypeScript ошибки итерации Map
 */


import { nodeRegistry, NodeInstance, generateNodeId } from "./NodeRegistry"

import { EventEmitter } from './EventEmitter'

// === ТИПЫ ===
export interface TransportState {
  isPlaying: boolean
  isRecording: boolean
  currentTime: number    // в beats
  tempo: number         // BPM
  timeSignature: [number, number] // [beats per bar, beat unit]
  currentBar: number
  currentBeat: number
  currentSixteenth: number
}

export interface NodeDescriptor {
  id: string
  type: string
  name: string
  position: { x: number; y: number }
  state: Record<string, any>
  inputs: string[]
  outputs: string[]
}

export enum CoreEventType {
  TRANSPORT_START = 'transport:start',
  TRANSPORT_STOP = 'transport:stop',
  TRANSPORT_PAUSE = 'transport:pause',
  TEMPO_CHANGE = 'tempo:change',
  TIME_SIGNATURE_CHANGE = 'timesignature:change',
  NODE_ADDED = 'node:added',
  NODE_REMOVED = 'node:removed',
  NODE_CONNECTED = 'node:connected',
  NODE_DISCONNECTED = 'node:disconnected',
  CLOCK_TICK = 'clock:tick'
}

// === ОСНОВНОЙ КЛАСС ЯДРА ===
export class CoreOrchestrator extends EventEmitter {
  private transport: TransportState
  private nodes: Map<string, NodeDescriptor>
  private connections: Map<string, string[]> // sourceId -> targetId[]
  private clockInterval: number | null
  
  constructor() {
    super()
    
    this.transport = {
      isPlaying: false,
      isRecording: false,
      currentTime: 0,
      tempo: 120,
      timeSignature: [4, 4],
      currentBar: 1,
      currentBeat: 1,
      currentSixteenth: 1
    }
    
    this.nodes = new Map()
    this.connections = new Map()
    this.clockInterval = null
    
    console.log('🎛️ CoreOrchestrator v0.2 initialized')
  }
  
  // === ТРАНСПОРТ И СИНХРОНИЗАЦИЯ ===
  startTransport(): void {
    if (this.transport.isPlaying) {
      console.log('⚠️ Transport already playing')
      return
    }
    
    this.transport.isPlaying = true
    this.transport.currentTime = 0
    this.transport.currentBar = 1
    this.transport.currentBeat = 1
    this.transport.currentSixteenth = 1
    
    // Запускаем внутренние часы
    this.startInternalClock()
    
    this.emit(CoreEventType.TRANSPORT_START, { ...this.transport })
    console.log('▶️ Transport started at', this.transport.tempo, 'BPM')
  }
  
  stopTransport(): void {
    this.transport.isPlaying = false
    this.stopInternalClock()
    
    this.emit(CoreEventType.TRANSPORT_STOP, { ...this.transport })
    console.log('⏹️ Transport stopped')
  }
  
  pauseTransport(): void {
    this.transport.isPlaying = false
    this.stopInternalClock()
    
    this.emit(CoreEventType.TRANSPORT_PAUSE, { ...this.transport })
    console.log('⏸️ Transport paused at', this.transport.currentTime.toFixed(2), 'beats')
  }
  
  setTempo(tempo: number): void {
    const clampedTempo = Math.max(20, Math.min(300, tempo))
    this.transport.tempo = clampedTempo
    
    // Перезапускаем часы, если они работают
    if (this.transport.isPlaying) {
      this.stopInternalClock()
      this.startInternalClock()
    }
    
    this.emit(CoreEventType.TEMPO_CHANGE, { tempo: this.transport.tempo })
    console.log('🎵 Tempo set to', this.transport.tempo, 'BPM')
  }
  
  setTimeSignature(numerator: number, denominator: number): void {
    this.transport.timeSignature = [numerator, denominator]
    this.emit(CoreEventType.TIME_SIGNATURE_CHANGE, { timeSignature: this.transport.timeSignature })
    console.log('🎼 Time signature set to', numerator + '/' + denominator)
  }
  
  // === УПРАВЛЕНИЕ НОДАМИ ===
  addNode(node: NodeDescriptor): string {
    if (this.nodes.has(node.id)) {
      console.warn('⚠️ Node with id', node.id, 'already exists')
      return node.id
    }
    
    this.nodes.set(node.id, node)
    this.emit(CoreEventType.NODE_ADDED, { node })
    console.log('➕ Node added:', node.type, '(', node.id, ')')
    
    return node.id
  }
  
  removeNode(nodeId: string): boolean {
    if (!this.nodes.has(nodeId)) {
      console.warn('⚠️ Node not found:', nodeId)
      return false
    }
    
    const node = this.nodes.get(nodeId)!
    this.nodes.delete(nodeId)
    
    // Удаляем все соединения с этой нодой
    this.connections.delete(nodeId)
    const connectionEntries = Array.from(this.connections.entries()); for (const [sourceId, targets] of connectionEntries) {
      const newTargets = targets.filter((targetId: string) => targetId !== nodeId)
      if (newTargets.length === 0) {
        this.connections.delete(sourceId)
      } else {
        this.connections.set(sourceId, newTargets)
      }
    }
    
    this.emit(CoreEventType.NODE_REMOVED, { nodeId })
    console.log('➖ Node removed:', nodeId)
    
    return true
  }
  
  getNode(nodeId: string): NodeDescriptor | undefined {
    return this.nodes.get(nodeId)
  }
  
  getAllNodes(): NodeDescriptor[] {
    return Array.from(this.nodes.values())
  }
  
  // === СОЕДИНЕНИЯ МЕЖДУ НОДАМИ ===
  connectNodes(sourceId: string, targetId: string): boolean {
    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) {
      console.warn('⚠️ Cannot connect: one or both nodes not found')
      return false
    }
    
    const existingConnections = this.connections.get(sourceId) || []
    if (existingConnections.includes(targetId)) {
      console.warn('⚠️ Connection already exists')
      return false
    }
    
    this.connections.set(sourceId, [...existingConnections, targetId])
    this.emit(CoreEventType.NODE_CONNECTED, { sourceId, targetId })
    console.log('🔗 Nodes connected:', sourceId, '->', targetId)
    
    return true
  }
  
  disconnectNodes(sourceId: string, targetId: string): boolean {
    const connections = this.connections.get(sourceId)
    if (!connections || !connections.includes(targetId)) {
      console.warn('⚠️ Connection not found')
      return false
    }
    
    const newConnections = connections.filter(id => id !== targetId)
    if (newConnections.length === 0) {
      this.connections.delete(sourceId)
    } else {
      this.connections.set(sourceId, newConnections)
    }
    
    this.emit(CoreEventType.NODE_DISCONNECTED, { sourceId, targetId })
    console.log('🔌 Nodes disconnected:', sourceId, '-/->', targetId)
    
    return true
  }
  
  // === ВНУТРЕННИЕ ЧАСЫ ===
  private startInternalClock(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval)
    }
    
    // Интервал тика: 1/16 ноты
    const beatsPerSecond = this.transport.tempo / 60
    const sixteenthsPerSecond = beatsPerSecond * 4
    const tickInterval = 1000 / sixteenthsPerSecond
    
    this.clockInterval = setInterval(() => {
      this.clockTick()
    }, tickInterval)
    
    console.log('⏱️ Internal clock started, tick interval:', tickInterval.toFixed(2), 'ms')
  }
  
  private stopInternalClock(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval)
      this.clockInterval = null
      console.log('⏱️ Internal clock stopped')
    }
  }
  
  private clockTick(): void {
    // Обновляем время (1 тик = 1/16 ноты)
    const deltaBeats = 0.25 // 1/16 ноты
    this.transport.currentTime += deltaBeats
    
    // Обновляем позицию в такте
    const beatsPerBar = this.transport.timeSignature[0]
    const totalBeats = this.transport.currentTime
    
    this.transport.currentBar = Math.floor(totalBeats / beatsPerBar) + 1
    const beatsInCurrentBar = totalBeats % beatsPerBar
    this.transport.currentBeat = Math.floor(beatsInCurrentBar) + 1
    this.transport.currentSixteenth = Math.floor((beatsInCurrentBar % 1) * 4) + 1
    
    this.emit(CoreEventType.CLOCK_TICK, { ...this.transport })
  }
  
  // === УТИЛИТЫ ===
  getTransportState(): TransportState {
    return { ...this.transport }
  }
  
  getConnections(): Map<string, string[]> {
    return new Map(this.connections)
  }
  
  reset(): void {
    this.stopTransport()
    this.nodes.clear()
    this.connections.clear()
    this.transport.currentTime = 0
    this.transport.currentBar = 1
    this.transport.currentBeat = 1
    this.transport.currentSixteenth = 1
    console.log('🔄 CoreOrchestrator reset')
  }
  
  exportProject(): any {
    return {
      transport: this.transport,
      nodes: Array.from(this.nodes.values()),
      connections: Array.from(this.connections.entries()),
      version: '0.2',
      timestamp: new Date().toISOString()
    }
  }
  
  importProject(projectData: any): boolean {
    try {
      this.reset()
      
      if (projectData.transport) {
        this.transport = { ...projectData.transport }
      }
      
      if (projectData.nodes && Array.isArray(projectData.nodes)) {
        projectData.nodes.forEach((node: NodeDescriptor) => {
          this.nodes.set(node.id, node)
        })
      }
      
      if (projectData.connections && Array.isArray(projectData.connections)) {
        projectData.connections.forEach(([sourceId, targets]: [string, string[]]) => {
          this.connections.set(sourceId, targets)
        })
      }
      
      console.log('📥 Project imported:', projectData.nodes?.length || 0, 'nodes')
      return true
    } catch (error) {
      console.error('❌ Error importing project:', error)
      return false
    }
  }

  // ==================== Управление экземплярами нод ====================

  private nodeInstances: Map<string, NodeInstance> = new Map();

  /**
   * Добавить новый экземпляр ноды на рабочую область
   * @param typeId Идентификатор типа ноды (должен быть зарегистрирован в NodeRegistry)
   * @param position Позиция на рабочей области {x, y}
   * @returns Идентификатор созданного экземпляра или null при ошибке
   */
  addNodeInstance(typeId: string, position: { x: number; y: number }): string | null {
    // Проверяем существование типа
    if (!nodeRegistry.hasNodeType(typeId)) {
      console.error(`[CoreOrchestrator] Тип ноды '${typeId}' не зарегистрирован.`);
      return null;
    }
    
    // Генерируем уникальный ID
    const nodeId = generateNodeId(typeId);
    
    const instance: NodeInstance = {
      id: nodeId,
      typeId,
      position,
      state: {}
    };
    
    this.nodeInstances.set(nodeId, instance);
    console.log(`[CoreOrchestrator] Создан экземпляр ноды: ${nodeId} на позиции (${position.x}, ${position.y})`);
    
    // Отправляем событие о добавлении ноды
    this.emit(CoreEventType.NODE_ADDED, { nodeId, typeId, position });
    
    return nodeId;
  }

  /**
   * Удалить экземпляр ноды с рабочей области
   * @param nodeId Идентификатор экземпляра ноды
   * @returns true если удаление успешно, false если нода не найдена
   */
  removeNodeInstance(nodeId: string): boolean {
    if (!this.nodeInstances.has(nodeId)) {
      console.warn(`[CoreOrchestrator] Попытка удалить несуществующую ноду: ${nodeId}`);
      return false;
    }
    
    this.nodeInstances.delete(nodeId);
    console.log(`[CoreOrchestrator] Удален экземпляр ноды: ${nodeId}`);
    
    // Отправляем событие об удалении ноды
    this.emit(CoreEventType.NODE_REMOVED, { nodeId });
    
    return true;
  }

  /**
   * Получить список всех экземпляров нод
   * @returns Массив экземпляров нод
   */
  getAllNodeInstances(): NodeInstance[] {
    return Array.from(this.nodeInstances.values());
  }

  /**
   * Получить конкретный экземпляр ноды
   * @param nodeId Идентификатор экземпляра
   * @returns Экземпляр ноды или undefined если не найден
   */
  getNodeInstance(nodeId: string): NodeInstance | undefined {
    return this.nodeInstances.get(nodeId);
  }

  /**
   * Обновить позицию ноды на рабочей области
   * @param nodeId Идентификатор экземпляра
   * @param newPosition Новая позиция {x, y}
   * @returns true если обновление успешно
   */
  updateNodePosition(nodeId: string, newPosition: { x: number; y: number }): boolean {
    const instance = this.nodeInstances.get(nodeId);
    if (!instance) {
      console.warn(`[CoreOrchestrator] Попытка обновить позицию несуществующей ноды: ${nodeId}`);
      return false;
    }
    
    instance.position = newPosition;
    this.nodeInstances.set(nodeId, instance);
    
    // Можно добавить событие об обновлении позиции, если нужно
    // this.emit(CoreEventType.NODE_UPDATED, { nodeId, position: newPosition });
    
    return true;
  }
}

// Создаем и экспортируем глобальный экземпляр CoreOrchestrator
export const coreOrchestrator = new CoreOrchestrator();

// Для отладки в браузере добавляем в глобальную область видимости
if (typeof window !== 'undefined') {
  (window as any).__UCH_DEBUG__ = {
    coreOrchestrator,
    // Другие отладочные объекты могут быть добавлены здесь
  };
  console.log('[CoreOrchestrator] Глобальный экземпляр создан и доступен как window.__UCH_DEBUG__.coreOrchestrator');
}
