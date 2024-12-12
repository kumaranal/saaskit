import { NextRequest } from 'next/server';
import { successResponse } from '../helperFunction/responseHandler';
import { asyncHandlerWrapper } from '../helperFunction/asyncHandeler';

/**
 * @swagger
 * /demoApi:
 *   get:
 *     description: Get an example response
 *     responses:
 *       200:
 *         description: Successful response
 */

// Export the GET handler wrapped in the async handler
export const GET = asyncHandlerWrapper(async (req: NextRequest) => {
  const data = 'dst';
  // throw new Error('myError');
  // myFunction();
  return successResponse(data);
});

function myFunction() {
  throw new Error('myErooor2');
}
