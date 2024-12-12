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

// Define the handler logic
const getHandler = async (req: NextRequest) => {
  // Your asynchronous operation here
  const data = 'dst';
  // throw new Error('myError');
  // myFunction();
  return successResponse(data);
};

// Export the GET handler wrapped in the async handler
export const GET = asyncHandlerWrapper(getHandler);

function myFunction() {
  throw new Error('myErooor2');
}
