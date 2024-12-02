import HttpStatusCode from '~/core/generic/http-status-code.enum';

export async function signIn(
  client: any,
  body: Record<string, string | number | string[] | number[] | any>,
) {
  try {
    const { error } = await client.auth.signInWithPassword(body);
    if (error) {
      return { error, statusCode: HttpStatusCode.BadRequest };
    }
    return { data: 'user is signed up', statusCode: HttpStatusCode.Ok };
  } catch (error) {
    return { error, statusCode: HttpStatusCode.Forbidden };
  }
}
