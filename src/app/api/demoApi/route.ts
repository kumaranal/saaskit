import { NextRequest } from 'next/server';
import getLogger from '~/core/logger';
import {
  failResponse,
  successResponse,
} from '../helperFunction/responseHandler';
import { processWithThreadPool } from '../helperFunction/customThreadPool';
import { processInParallel } from '../helperFunction/concurrentOperation';
import { processInParallelWithCluster } from '../helperFunction/customCluster';
const cluster = require('cluster');
const os = require('os');
const logger = getLogger();

/**
 * @swagger
 * /demoApi:
 *   get:
 *     description: Get an example response
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function GET(req: NextRequest) {
  try {
    console.time('myProcess');

    // throw new Error('Specific Error Message: ');
    // let operation;
    // for (let i = 0; i < 5; i++) {
    //   operation = await getHHIData();
    // }
    // console.log(operation)
    // let taskArray = [1, 2, 3, 4, 5];
    // const exampleArray = [
    //   { id: 1, name: 'Alice', age: 25, occupation: 'Engineer' },
    //   { id: 2, name: 'Bob', age: 30, occupation: 'Designer' },
    //   { id: 3, name: 'Charlie', age: 35, occupation: 'Teacher' },
    //   { id: 4, name: 'Diana', age: 28, occupation: 'Developer' },
    //   { id: 5, name: 'Eve', age: 22, occupation: 'Artist' },
    // ];

    // let operation = getHHIData;
    const data = await clusterWorking();
    console.log('data', data);
    console.timeEnd('myProcess');
    console.log('done');
    return successResponse('Success Data');
  } catch (error) {
    return failResponse(
      error instanceof Error ? error.message : 'An unexpected error occurred',
    );
  }
}

async function clusterWorking(): Promise<any[]> {
  const numWorkers = os.cpus().length; // Number of worker processes
  console.log(`Master process is running with PID ${process.pid}`);

  if (cluster.isPrimary) {
    const results: any[] = [];
    let completedWorkers = 0;

    // Fork workers
    for (let i = 0; i < numWorkers; i++) {
      const worker = cluster.fork();

      // Listen for messages from workers
      worker.on('message', (message: any) => {
        console.log(`Master received message: ${JSON.stringify(message)}`);
        results.push(message);

        // Check if all workers are done
        if (++completedWorkers === numWorkers) {
          console.log('All workers completed their tasks');
          cluster.disconnect(); // Disconnect all workers
        }
      });

      // Handle worker exits
      worker.on('exit', (code: any, signal: any) => {
        console.log(
          `Worker ${worker.process.pid} exited with code ${code}, signal ${signal}`,
        );
      });
    }

    // Wait for workers to complete their tasks
    await new Promise((resolve) => cluster.on('disconnect', resolve));

    return results;
  } else {
    // Worker process logic
    const workerResults: any[] = [];
    console.log(`Worker ${process.pid} started`);

    // Perform tasks in this worker
    for (let i = 0; i < 5; i++) {
      if (i % os.cpus().length === cluster.worker.id - 1) {
        const result = await getHHIData();
        workerResults.push({ workerId: process.pid, operation: i, result });
      }
    }

    // Send results back to the master
    if (process.send) {
      process.send(workerResults); // Only call if send is defined
    }

    // Exit the worker process
    process.exit();
  }

  return []; // Return an empty array in case of unexpected flow
}

const getHHIData = async () => {
  const url = 'https://noahpropertymanagement.entrata.com/api/v1/reports';
  const username = 'worthwhile_3320@noahpropertymanagement';
  const password = 'Xuy}W$3~7N'; // Replace with actual password
  const encodedAuth = btoa(`${username}:${password}`); // Basic Auth Encoding
  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    Authorization: `Basic ${encodedAuth}`,
  };
  const body = JSON.stringify({
    auth: {
      type: 'basic',
    },
    requestId: 15,
    method: {
      name: 'getReportData',
      version: 'r2',
      params: {
        reportName: 'resident_data',
        reportVersion: '2.8',
        filters: {
          property_group_ids: [
            1226978, 1226980, 1226981, 1226982, 1226983, 1226985, 1226987,
            1226989, 1226990, 1226991, 1226992, 1226993, 1226994, 1226995,
            1226996, 1226997, 1226998, 1226999, 1227000, 1227001,
          ],
          occupant_types: ['1'],
          status_group: '5',
          status: ['4', '5'],
          ignore_inactive_status_prior_to: '2024-10-14',
          consolidate_by: 'consolidate_all_properties',
          lease_occupancy_types: '100',
          lease_terms_academic_year: '',
          drilldown: '',
          drilldown_status_id: '',
          lease_interval_type: '',
        },
      },
    },
  });
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.response.result; // Adjust this according to the actual API response structure
  } catch (error) {
    logger.error('Unexpected server error', error);
    // Adjust error handling as necessary
    return null;
  }
};
