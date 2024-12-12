interface TaskResult<T> {
  success: boolean;
  result?: T;
  error?: any;
  index: number;
}

interface ProcessInParallelResult<T> {
  successes: T[];
  errors: { error: any; index: number }[];
}

import { Worker, isMainThread, workerData, parentPort } from 'worker_threads';

/**
 * Executes an operation in parallel using worker threads in Node.js.
 * @param operation - The operation to be performed, either in the worker or sequentially.
 * @param array - The array of data items to be processed.
 */
export const processInParallelInCluster = async <T, R>(
  operation: (item: T) => R, // Function to execute on each item
  array: T[], // Input data array
) => {
  if (isMainThread) {
    const arr =
      array.length > 0
        ? array
        : Array.from({ length: 5 }, (_, i) => i as unknown as T);

    // Using worker threads for parallelism
    console.log('Using worker threads...');
    const startTime = Date.now();

    const workers = arr.map((item) => {
      return new Promise<void>((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: { operation: operation.toString(), item },
        });

        worker.on('message', (result) => {
          console.log(`Worker result: ${result}`);
          resolve();
        });

        worker.on('error', (err) => {
          console.error('Worker error:', err);
          reject(err);
        });

        worker.on('exit', (code) => {
          if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });
      });
    });

    await Promise.all(workers);

    const timeTaken = (Date.now() - startTime) / 1000;
    console.log(`Time taken to complete worker threads: ${timeTaken}s`);

    // Sequential execution with a for loop
    console.log('Now using for loop...');
    const startTime2 = Date.now();

    for (const item of arr) {
      const result = operation(item);
      console.log(`Sequential result: ${result}`);
    }

    const timeTaken2 = (Date.now() - startTime2) / 1000;
    console.log(`Time taken to complete for loop: ${timeTaken2}s`);
  } else {
    // This block runs in the worker thread
    const { operation, item } = workerData;
    const opFunc = new Function(`return (${operation})`)(); // Convert string back to function
    const result = opFunc(item);
    parentPort?.postMessage(result);
  }
};
