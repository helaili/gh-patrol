import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
const { createAppAuth } = require('@octokit/auth-app');
const { Octokit } = require('@octokit/rest');
import * as crypto from 'crypto';
import * as fs from 'fs';
import { Logger } from '../utils/logger';
// import { WebhookEvent } from '@octokit/webhooks-types';
import { PersonalAccessTokenRequestCreatedEvent } from "../utils/webhooks-types-extra";

const WEBHOOK_SECRET: string = process.env.WEBHOOK_SECRET;
const APP_ID = process.env.APP_ID; 
const PRIVATE_KEY = getPrivateKey(); 

// Load the private key from the file system in development mode, or from a secret in production mode
function getPrivateKey() : string {
  if (process.env.AZURE_FUNCTIONS_ENVIRONMENT && process.env.AZURE_FUNCTIONS_ENVIRONMENT === 'Development') {
    return fs.readFileSync(process.env.PRIVATE_KEY_FILE, 'utf8');
  } else {
    return process.env.PRIVATE_KEY
  }
}

// Verify the signature of the incoming webhook request. 
// The webhook secret of the GitHub App must match the value stored in the environment variable WEBHOOK_SECRET
async function verify_signature(jsonBody: string, signatureHeader: string) {
  // Bypass signature validation in dev mode
  if (process.env.AZURE_FUNCTIONS_ENVIRONMENT && process.env.AZURE_FUNCTIONS_ENVIRONMENT === 'Development') {
    return true;
  }

  if (!WEBHOOK_SECRET) {
    throw new Error('Webhook secret environment variable WEBHOOK_SECRET is not set');
  }
  if (!signatureHeader) {
    return false;
  }

  const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(jsonBody, 'utf8')
    .digest('hex');
  let trusted = Buffer.from(`sha256=${signature}`, 'ascii');
  let untrusted = Buffer.from(signatureHeader, 'ascii');
  return crypto.timingSafeEqual(trusted, untrusted);
}

async function getInstallationAccessToken(installationId) {
  if (!APP_ID || !PRIVATE_KEY) {
    throw new Error('App ID and private key environment variables are required');
  }
  const auth = createAppAuth({
      appId: APP_ID,
      privateKey: PRIVATE_KEY,
      installationId: installationId,
  });

  const authentication = await auth({ type: 'installation' });
  return authentication.token;
}


export async function webhook(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url '${request.url}'`);

  try {
    const body = await request.json();
    const json = JSON.stringify(body);

    if (!await verify_signature(json, request.headers.get('X-Hub-Signature-256'))) {
      return { status: 401, body: 'Unauthorized' };
    } else {
      return handleWebhookEvent(request, context, body as PersonalAccessTokenRequestCreatedEvent);
    }
  } catch (error) {
    context.log(`Error processing request: ${error}`);
    return { status: 500, body: error.message };
  }
}

export async function handleWebhookEvent(request: HttpRequest, logger: Logger, webhook: PersonalAccessTokenRequestCreatedEvent): Promise<HttpResponseInit> {
  switch (request.headers.get('X-GitHub-Event')) {
    case 'ping':
      return { status: 200, body: 'pong' }
    case 'installation':
      return { status: 200, body: 'ok' }
    case 'personal_access_token_request':
      return handlePATRequestWebhookEvent(request, logger, webhook);
    default:
      logger.log(`Unhandled event: ${request.headers.get('X-GitHub-Event')}`);
      return { status: 501, body: 'Event not supported' };
  }
};


export async function handlePATRequestWebhookEvent(request: HttpRequest, logger: Logger, webhookObject: PersonalAccessTokenRequestCreatedEvent): Promise<HttpResponseInit> {
  logger.log('PAT request received');
  if('action' in webhookObject) {
    switch(webhookObject.action) {
      case 'created':
        logger.log('personal access token request created');
        return await handlePATRequestCreatedWebhookEvent(request, logger, webhookObject);
      default:
        logger.log(`Unhandled personal access token request action: ${webhookObject.action}`);
    }
  }
  return { status: 501, body: 'Missing action in personal access token request event payload' };
}

export async function handlePATRequestCreatedWebhookEvent(request: HttpRequest, logger: Logger, patRequest: PersonalAccessTokenRequestCreatedEvent): Promise<HttpResponseInit> {
  try {
    logger.log(`PAT request created by ${patRequest.sender.login} with id ${patRequest.personal_access_token_request.id}`);
    const token = await getInstallationAccessToken(patRequest.installation.id);
    const octokit = new Octokit({ auth: token });
    const response = await octokit.request("POST /orgs/{org}/personal-access-token-requests/{pat_request_id}", {
      org: patRequest.organization.login,
      pat_request_id: patRequest.personal_access_token_request.id,
      action: "approve",
      reason: "Automatically approved by the GitHub App"
    });
    if (response.status !== 204) {
      logger.log(`Failed to porcess personal access token request: ${response.status}`);
      return { status: 500, body: 'Failed to process PAT request' };
    } else {
      return { status: 200, body: 'Ok' };
    }
  } catch(error) {
    return { status: 500, body: 'Something went wrong' };
  }
}

