import HttpStatusCode from '~/core/generic/http-status-code.enum';
import {
  successResponse,
  failResponse,
} from '../helperFunction/responseHandler';
import { client } from '../helperFunction/supabaseClient';
import { signUp } from '../util/signUp';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const { error, data, statusCode } = await signUp(client, {
      email: username,
      password,
    });
    if (error) {
      return failResponse(error, statusCode);
    }
    return successResponse(data, statusCode);
  } catch (error) {
    return failResponse(error, HttpStatusCode.Forbidden);
  }
}
