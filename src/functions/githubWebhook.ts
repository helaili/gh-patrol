import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as crypto from 'crypto';
import { Logger } from '../utils/logger';
import { WebhookEvent } from '@octokit/webhooks-types';

const WEBHOOK_SECRET: string = process.env.WEBHOOK_SECRET;

async function verify_signature(jsonBody: string, signatureHeader: string) {
    // Bypass signature validation in dev mode
    if (process.env.AZURE_FUNCTIONS_ENVIRONMENT && process.env.AZURE_FUNCTIONS_ENVIRONMENT === 'Development') { 
      return true;
    }
    
    if (!WEBHOOK_SECRET) {
      throw new Error('WEBHOOK_SECRET is not set');
    }
    if (!signatureHeader) {
      return false;
    }
    
    const signature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(jsonBody, 'utf8')
      .digest('hex');
    let trusted = Buffer.from(`sha256=${signature}`, 'ascii');
    let untrusted =  Buffer.from(signatureHeader, 'ascii');
    return crypto.timingSafeEqual(trusted, untrusted);
  }

export async function githubWebhook(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url '${request.url}'`);

    try {
        const body = await request.json();
        const json = JSON.stringify(body);

        if (!await verify_signature(json, request.headers.get('X-Hub-Signature-256'))) {
        return { status: 401, body: 'Unauthorized' };
        } else {
        return handleWebhookEvent(request, context, body as WebhookEvent);
        }
    } catch (error) {
        context.log(`Error processing request: ${error}`);
        return { status: 500, body: error.message };
    }
}

export async function handleWebhookEvent(request: HttpRequest, logger: Logger, webhook: WebhookEvent): Promise<HttpResponseInit> {
    switch(request.headers.get('X-GitHub-Event')) {
        case 'ping':
            return { status: 200, body: 'pong' }
        default:
            logger.log(`Unhandled event: ${request.headers.get('X-GitHub-Event')}`);
            return { status: 501, body: 'Event not supported' };
    }
};
