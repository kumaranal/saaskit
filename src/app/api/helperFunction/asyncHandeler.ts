import { failResponse } from './responseHandler';
export const asyncHandlerWrapper = (handler: any) => {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      return failResponse(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      );
    }
  };
};
