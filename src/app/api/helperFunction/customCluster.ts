import cluster, { Worker } from 'cluster';
import os from 'os';

interface ProcessResult {
  success: boolean;
  result?: any;
  error?: any;
  index?: number;
}

interface ParallelResult {
  successes: any[];
  errors: { error: any; index: number }[];
}

const processInParallelWithCluster = async (
  operation: () => Promise<any>,
  array: any[],
): Promise<ParallelResult> => {
  const numCPUs = os.cpus().length;
  const numWorkers = Math.min(numCPUs, array.length);
  const chunkSize = Math.ceil(array.length / numWorkers);

  return new Promise((resolve, reject) => {
    if (cluster.isWorker) {
      process.on('message', async (message: { chunk: any[] }) => {
        try {
          const results: ProcessResult[] = await Promise.all(
            message.chunk.map(async (item, index) => {
              try {
                const result = await operation();
                return { success: true, result, index };
              } catch (error) {
                return { success: false, error, index };
              }
            }),
          );

          const successes = results
            .filter((r) => r.success)
            .map((r) => r.result);
          const errors = results
            .filter((r) => !r.success)
            .map((r) => ({ error: r.error, index: r.index }));

          process.send?.({ success: true, results: successes, errors });
          process.exit(0);
        } catch (error) {
          process.send?.({
            success: false,
            errors: [{ error: 'Unknown error', index: -1 }],
          });
          process.exit(1);
        }
      });
    } else {
      let completedWorkers = 0;
      let successes: any[] = [];
      let errors: { error: any; index: number }[] = [];

      // Split the array into chunks
      for (let i = 0; i < numWorkers; i++) {
        const chunk = array.slice(i * chunkSize, (i + 1) * chunkSize);
        const worker: Worker = cluster.fork();

        worker.on('message', (message: any) => {
          if (message.success) {
            successes = [...successes, ...message.results];
          } else {
            errors = [...errors, ...(message.errors || [])];
          }
          completedWorkers++;

          if (completedWorkers === numWorkers) {
            resolve({ successes, errors });
          }
        });

        worker.on('exit', (code: number) => {
          if (code !== 0) {
            errors.push({
              error: `Worker exited with code ${code}`,
              index: -1,
            });
          }
        });

        worker.send({ chunk });
      }
    }
  });
};

export { processInParallelWithCluster };
