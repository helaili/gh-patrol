import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

export async function ping(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  return { status: 200, body: 'pong' };  
}
