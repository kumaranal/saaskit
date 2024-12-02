import HttpStatusCode from '~/core/generic/http-status-code.enum';
import {
  successResponse,
  failResponse,
} from '../helperFunction/responseHandler';
import { client } from '../helperFunction/supabaseClient';
import { forgotPassword } from '../util/forgotPassword';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();
    const { error, data, statusCode } = await forgotPassword(client, {
      email: username,
    });
    if (error) {
      return failResponse(error, statusCode);
    }
    return successResponse(data, statusCode);
  } catch (error) {
    return failResponse(error, HttpStatusCode.Forbidden);
  }
}
