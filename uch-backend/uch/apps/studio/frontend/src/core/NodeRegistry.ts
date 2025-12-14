// uch/apps/studio/frontend/src/core/NodeRegistry.ts
// Реестр типов нод для системы ядра-оркестратора

import React from 'react';

// Интерфейс для описания типа ноды
export interface NodeTypeDescriptor {
  id: string;                      // уникальный идентификатор типа (например, "master-clock")
  name: string;                    // человекочитаемое имя (например, "Master Clock")
  description: string;             // краткое описание назначения
  icon: string;                    // эмодзи или код иконки (например, "⏱")
  factory: (nodeId: string) => React.ReactElement; // фабрика для создания экземпляра ноды
  defaultWidth?: number;           // рекомендуемая ширина в пикселях
  defaultHeight?: number;          // рекомендуемая высота в пикселях
}

// Интерфейс для описания экземпляра ноды на рабочей области
export interface NodeInstance {
  id: string;                      // уникальный ID экземпляра
  typeId: string;                  // ссылка на тип из NodeTypeDescriptor.id
  position: { x: number; y: number }; // позиция на рабочей области (в пикселях)
  state?: Record<string, any>;     // состояние конкретного экземпляра
}

// Главный реестр типов нод (синглтон)
class NodeRegistry {
  private nodeTypes: Map<string, NodeTypeDescriptor> = new Map();

  // Регистрация нового типа ноды
  registerNodeType(descriptor: NodeTypeDescriptor): void {
    if (this.nodeTypes.has(descriptor.id)) {
      console.warn(`[NodeRegistry] Тип ноды '${descriptor.id}' уже зарегистрирован, будет перезаписан.`);
    }
    this.nodeTypes.set(descriptor.id, descriptor);
    console.log(`[NodeRegistry] Зарегистрирован тип ноды: ${descriptor.icon} ${descriptor.name} (${descriptor.id})`);
  }

  // Получение дескриптора типа по ID
  getNodeType(typeId: string): NodeTypeDescriptor | undefined {
    return this.nodeTypes.get(typeId);
  }

  // Получение списка всех зарегистрированных типов
  getAllNodeTypes(): NodeTypeDescriptor[] {
    return Array.from(this.nodeTypes.values());
  }

  // Проверка существования типа
  hasNodeType(typeId: string): boolean {
    return this.nodeTypes.has(typeId);
  }

  // Удаление типа (для динамических плагинов)
  removeNodeType(typeId: string): boolean {
    const result = this.nodeTypes.delete(typeId);
    if (result) {
      console.log(`[NodeRegistry] Тип ноды '${typeId}' удален.`);
    }
    return result;
  }
}

// Экспортируем глобальный экземпляр реестра
export const nodeRegistry = new NodeRegistry();

// Вспомогательная функция для создания уникального ID экземпляра
export function generateNodeId(typeId: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${typeId}-${timestamp}-${random}`;
}

export default nodeRegistry;

// ==================== Регистрация стандартных типов нод ====================

// Импортируем компоненты нод
import MasterClockNode from './MasterClockNode';
import CoreTest from './CoreTest';

// Вспомогательная функция для создания фабрики ноды с заданными пропсами
function createNodeFactory<P extends object>(
  Component: React.ComponentType<P>,
  defaultProps: Partial<P> = {}
) {
  return (nodeId: string): React.ReactElement => {
    // Базовые пропсы, которые получают все ноды
    const baseProps = {
      nodeId,
      core: (window as any).__UCH_DEBUG__?.coreOrchestrator
    };
    
    // Объединяем базовые пропсы, пропсы по умолчанию и добавляем nodeId
    const props = {
      ...defaultProps,
      ...baseProps
    } as P;
    
    return React.createElement(Component, props);
  };
}

// Регистрация типа "master-clock"
nodeRegistry.registerNodeType({
  id: 'master-clock',
  name: 'Master Clock',
  description: 'Центральные часы и управление транспортом студии',
  icon: '⏱',
  factory: createNodeFactory(MasterClockNode),
  defaultWidth: 320,
  defaultHeight: 220
});

// Регистрация типа "core-test"
nodeRegistry.registerNodeType({
  id: 'core-test',
  name: 'Core Test',
  description: 'Тестовый интерфейс для отладки ядра CoreOrchestrator',
  icon: '🧪',
  factory: createNodeFactory(CoreTest),
  defaultWidth: 350,
  defaultHeight: 400
});

console.log('[NodeRegistry] Стандартные типы нод зарегистрированы.');

// Регистрация типа "strudel-repl" (ВРЕМЕННОЕ РЕШЕНИЕ)
import StrudelREPLNode from './StrudelREPLNode';

nodeRegistry.registerNodeType({
  id: 'strudel-repl',
  name: 'Strudel REPL',
  description: 'Временное решение: REPL для Strudel (TidalCycles) с CDN загрузкой',
  icon: '🎹',
  factory: createNodeFactory(StrudelREPLNode),
  defaultWidth: 400,
  defaultHeight: 420
});

console.log('[NodeRegistry] StrudelREPLNode зарегистрирован (временное решение).');
