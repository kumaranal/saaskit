import { NextRequest } from 'next/server';
import getLogger from '~/core/logger';
import {
  failResponse,
  successResponse,
} from '../helperFunction/responseHandler';
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
    return successResponse('Success Data');
  } catch (error) {
    return failResponse(
      error instanceof Error ? error.message : 'An unexpected error occurred',
    );
  }
}
