import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

/**
 * Generalized function to handle work in both worker threads and the main thread.
 * @param workFunction - The function to execute. Receives the workerData as input.
 * @param tasks - Array of tasks to be processed.
 * @returns A promise resolving to the results of the tasks.
 */
export function runWithWorkers<T, U>(
  workFunction: (input: T) => U,
  tasks: T[],
): Promise<U[]> {
  return new Promise(async (resolve, reject) => {
    if (isMainThread) {
      const results: U[] = []; // To store results from workers
      let completedWorkers = 0;

      const startWorkerThreads = async (tasks: T[]) => {
        console.log('Using worker threads...');
        const workers = tasks.map(
          (task, index) =>
            new Promise<void>((resolveWorker, rejectWorker) => {
              const worker = new Worker(__filename, { workerData: task });
              worker.on('message', (result: U) => {
                results[index] = result; // Store result in the correct order
                completedWorkers++;
                resolveWorker();
              });
              worker.on('error', rejectWorker);
              worker.on('exit', (code) => {
                if (code !== 0) {
                  rejectWorker(
                    new Error(`Worker stopped with exit code ${code}`),
                  );
                }
              });
            }),
        );
        await Promise.all(workers);
      };

      const runSequentially = (tasks: T[]) => {
        console.log('Using for loop for sequential execution...');
        return tasks.map(workFunction);
      };

      const main = async () => {
        try {
          await startWorkerThreads(tasks);
          console.log('Worker thread results:', results);
          resolve(results); // Resolve with worker thread results
        } catch (error) {
          reject(error);
        }
      };

      main();
    } else {
      // Worker thread logic
      try {
        const result = workFunction(workerData as T);
        parentPort?.postMessage(result);
      } catch (error: any) {
        parentPort?.postMessage({ error: error.message });
      }
    }
  });
}

// // Custom work function (can be replaced as needed)
// function workerFunction(task: number): number {
//   return task * task; // Example task: square the number
// }

// const tasks = [10, 20, 30, 40, 50, 70, 80];

// // Example usage
// if (isMainThread) {
//   runWithWorkers(workerFunction, tasks)
//     .then((results) => {
//       console.log('Final results:', results);
//     })
//     .catch((error) => {
//       console.error('Error:', error);
//     });
// } else {
//   // Logic for worker threads
//   const result = workerFunction(workerData as number);
//   parentPort?.postMessage(result);
// }
