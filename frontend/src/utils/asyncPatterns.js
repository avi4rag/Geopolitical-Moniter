/**
 * JavaScript Asynchronous Programming: Promises vs Callbacks
 * 
 * Concept Overview:
 * 1. Callbacks: Functions passed as arguments to other functions to be invoked once an
 *    asynchronous task finishes.
 *    - Challenges: Callback hell (Pyramid of Doom), difficult error propagation (error-first callback convention),
 *      inversion of control (uncontrolled execution frequency or missing calls).
 * 
 * 2. Promises: Objects representing the eventual completion (or failure) of an asynchronous
 *    operation and its resulting value.
 *    - States: Pending -> Fulfilled OR Rejected (immutable once settled).
 *    - Advantages: Linear chaining (.then/.catch/.finally), native composability (Promise.all,
 *      Promise.allSettled, Promise.race, Promise.any), uniform error handling, async/await syntax.
 */

/**
 * Traditional Node.js Error-First Callback Pattern
 * @param {string} resourceId 
 * @param {(err: Error | null, result?: { id: string, status: string, timestamp: number }) => void} callback 
 */
export function fetchResourceWithCallback(resourceId, callback) {
  if (!resourceId) {
    // Immediate callback invocation on invalid input
    return callback(new Error('Resource ID is required'));
  }

  // Simulating async I/O
  setTimeout(() => {
    if (resourceId === 'error-trigger') {
      callback(new Error(`Failed to retrieve resource: ${resourceId}`));
    } else {
      callback(null, {
        id: resourceId,
        status: 'FETCHED_VIA_CALLBACK',
        timestamp: Date.now(),
      });
    }
  }, 10);
}

/**
 * Promisification Utility: Converts any standard error-first callback function into a Promise
 * @template T
 * @param {(...args: any[]) => void} fn 
 * @returns {(...args: any[]) => Promise<T>}
 */
export function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };
}

/**
 * Promise-based Fetch implementation (modern standard)
 * @param {string} resourceId 
 * @returns {Promise<{ id: string, status: string, timestamp: number }>}
 */
export function fetchResourcePromise(resourceId) {
  return new Promise((resolve, reject) => {
    fetchResourceWithCallback(resourceId, (err, data) => {
      if (err) reject(err);
      else resolve({ ...data, status: 'FETCHED_VIA_PROMISE' });
    });
  });
}

/**
 * Comparison Demonstration:
 * Fetches multiple resources using both:
 * 1. Callback waterfall (nested callbacks)
 * 2. Modern Promise.allSettled with async/await
 */
export async function compareAsyncParadigms(resourceIds) {
  // --- PARADIGM 1: Traditional Callback Waterfall ---
  const callbackWaterfallPromise = new Promise((resolve) => {
    const callbackResults = [];
    const startTime = performance.now();

    function processIndex(i) {
      if (i >= resourceIds.length) {
        return resolve({
          paradigm: 'Callbacks',
          durationMs: performance.now() - startTime,
          results: callbackResults,
        });
      }

      fetchResourceWithCallback(resourceIds[i], (err, res) => {
        if (err) {
          callbackResults.push({ id: resourceIds[i], error: err.message });
        } else {
          callbackResults.push(res);
        }
        processIndex(i + 1); // Nested recursive callback chaining
      });
    }

    processIndex(0);
  });

  // --- PARADIGM 2: Modern Promises with Promise.allSettled & async/await ---
  const promiseStartTime = performance.now();
  const promiseSettledResults = await Promise.allSettled(
    resourceIds.map((id) => fetchResourcePromise(id))
  );

  const promiseResults = promiseSettledResults.map((outcome, idx) => {
    if (outcome.status === 'fulfilled') {
      return outcome.value;
    }
    return { id: resourceIds[idx], error: outcome.reason?.message || 'Rejected' };
  });

  const promiseSummary = {
    paradigm: 'Promises (Concurrent async/await)',
    durationMs: performance.now() - promiseStartTime,
    results: promiseResults,
  };

  const callbackSummary = await callbackWaterfallPromise;

  return {
    callbackApproach: callbackSummary,
    promiseApproach: promiseSummary,
    comparison: {
      readability: 'Promises avoid callback pyramids and provide standardized error handling.',
      concurrency: 'Promise.all/allSettled allows parallel non-blocking execution unlike sequential callback waterfalls.',
      stateSafety: 'Promises cannot be resolved or rejected multiple times, guaranteeing determinism.',
    },
  };
}
