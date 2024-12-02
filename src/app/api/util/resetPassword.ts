import HttpStatusCode from '~/core/generic/http-status-code.enum';

export async function resetPassword(
  client: any,
  body: Record<string, string | number | string[] | number[] | any>,
) {
  try {
    const { error } = await client.auth.updateUser(body);
    if (error) {
      return { error, statusCode: HttpStatusCode.BadRequest };
    }
    return {
      data: 'User password reset successfully',
      statusCode: HttpStatusCode.Ok,
    };
  } catch (error) {
    return { error, statusCode: HttpStatusCode.Forbidden };
  }
}
