// uch/apps/studio/frontend/src/temp/workers/strudel-worker.js
// Улучшенный Web Worker для Strudel

console.log('[StrudelWorker] Worker инициализирован');

// Используем импорт скриптов для загрузки Strudel
self.importScripts('https://cdn.jsdelivr.net/npm/@strudel.cycles/core@0.10.0/dist/index.min.js');

console.log('[StrudelWorker] Strudel загружен:', typeof self.strudel);

self.onmessage = async function(e) {
  console.log('[StrudelWorker] Получено сообщение:', e.data.type);
  
  if (e.data.type === 'eval') {
    try {
      // Используем глобально доступный strudel из importScripts
      if (!self.strudel || !self.strudel.eval) {
        throw new Error('Strudel не загружен правильно');
      }
      
      // Простая оценка кода
      const result = self.strudel.eval(e.data.code);
      
      self.postMessage({
        type: 'eval-result',
        success: true,
        result: typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)
      });
    } catch (error) {
      console.error('[StrudelWorker] Ошибка:', error);
      self.postMessage({
        type: 'eval-result',
        success: false,
        error: error.message
      });
    }
  }
};
