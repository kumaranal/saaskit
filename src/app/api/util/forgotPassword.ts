import HttpStatusCode from '~/core/generic/http-status-code.enum';

export async function forgotPassword(
  client: any,
  body: Record<string, string | number | string[] | number[] | any>,
) {
  try {
    const { error } = await client.auth.resetPasswordForEmail(body, {
      redirectTo: '',
    });
    if (error) {
      return { error, statusCode: HttpStatusCode.BadRequest };
    }
    return {
      data: 'Please check the mail in your registered email account',
      statusCode: HttpStatusCode.Ok,
    };
  } catch (error) {
    return { error, statusCode: HttpStatusCode.Forbidden };
  }
}
