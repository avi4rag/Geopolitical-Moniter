/**
 * JavaScript Runtime & Concurrency Model: Event Loop Demonstration
 * 
 * Concept Overview:
 * JavaScript is single-threaded with a non-blocking, event-driven runtime architecture.
 * The Event Loop orchestrates code execution between:
 * 1. Call Stack: Synchronous execution context (LIFO - Last In, First Out)
 * 2. Microtask Queue: Highest priority queue drained after the current stack empties.
 *    - Processed completely before the event loop yields to rendering or macrotasks.
 *    - Sources: Promise.resolve().then(), queueMicrotask(), MutationObserver.
 * 3. Macrotask Queue (Task Queue): Standard task queue drained one task per event loop tick.
 *    - Sources: setTimeout(), setInterval(), setImmediate() (Node), I/O callbacks, DOM events.
 * 4. Animation / Render Steps: requestAnimationFrame() runs before next paint.
 */

/**
 * Runs an educational trace demonstrating the exact execution order of:
 * - Synchronous operations
 * - Microtasks (queueMicrotask, Promise.then)
 * - Macrotasks (setTimeout 0ms)
 * - Animation frames (requestAnimationFrame)
 * 
 * @returns {Promise<Array<{ step: number, type: string, message: string, timestamp: number }>>}
 */
export async function runEventLoopSimulation() {
  const executionLog = [];
  let step = 1;

  const record = (type, message) => {
    executionLog.push({
      step: step++,
      type,
      message,
      timestamp: performance.now(),
    });
  };

  // 1. Synchronous Code execution on Call Stack
  record('CALL_STACK (Sync)', 'Start of synchronous execution block (main thread)');

  // 2. Schedule Macrotask A
  setTimeout(() => {
    record('MACROTASK (Task Queue)', 'Macrotask A (setTimeout 0ms) executed after microtasks drain');
  }, 0);

  // 3. Schedule Microtask A
  queueMicrotask(() => {
    record('MICROTASK (Microtask Queue)', 'Microtask A (queueMicrotask) executed immediately after call stack');
  });

  // 4. Schedule Promise Microtask B
  Promise.resolve('Microtask B Payload').then((data) => {
    record('MICROTASK (Promise.then)', `Microtask B received: "${data}" - ran before any macrotask`);
    
    // Nested microtask to prove microtask queue drains fully before macrotask
    queueMicrotask(() => {
      record('MICROTASK (Nested Microtask)', 'Nested Microtask inside Promise.then executed before Macrotask');
    });
  });

  // 5. Schedule Macrotask B
  setTimeout(() => {
    record('MACROTASK (Task Queue)', 'Macrotask B (setTimeout 0ms) executed in subsequent event loop tick');
  }, 0);

  // 6. Schedule requestAnimationFrame if in browser
  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(() => {
      record('RENDER_FRAME (rAF)', 'requestAnimationFrame executed prior to browser re-paint phase');
    });
  }

  // 7. End of Synchronous block
  record('CALL_STACK (Sync)', 'End of synchronous execution block');

  // Await one macro tick to allow all scheduled tasks in this cycle to complete
  await new Promise((resolve) => setTimeout(resolve, 50));

  return executionLog;
}

/**
 * Helper to defer heavy computation without blocking the UI main thread
 * Splits large array processing into chunks scheduled across event loop macrotasks.
 * 
 * @template T, R
 * @param {T[]} items - Array of items to process
 * @param {(item: T, index: number) => R} fn - Processing function
 * @param {number} [chunkSize=10] - Number of items per event loop tick
 * @returns {Promise<R[]>}
 */
export async function processInBatchesNonBlocking(items, fn, chunkSize = 10) {
  const results = [];
  let currentIndex = 0;

  return new Promise((resolve, reject) => {
    function processNextChunk() {
      try {
        const chunkEnd = Math.min(currentIndex + chunkSize, items.length);
        for (; currentIndex < chunkEnd; currentIndex++) {
          results.push(fn(items[currentIndex], currentIndex));
        }

        if (currentIndex < items.length) {
          // Yield to event loop to keep UI responsive and prevent frame drops
          setTimeout(processNextChunk, 0);
        } else {
          resolve(results);
        }
      } catch (err) {
        reject(err);
      }
    }

    processNextChunk();
  });
}
