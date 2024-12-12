import { failResponse } from './responseHandler';
import getLogger from '~/core/logger';

const logger = getLogger();

export const asyncHandlerWrapper = (handler: any) => {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      logger.error(error, 'error');
      return failResponse(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      );
    }
  };
};
