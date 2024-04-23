import { describe, expect, test, beforeEach, afterAll, afterEach } from '@jest/globals';
import { HttpRequest, InvocationContext,  } from '@azure/functions';
import { buildContext, buildHttpRequest } from "./testHelper";
import * as webhooks from '../functions/webhook';
import { personal_access_token_request_created } from "./payload/personal_access_token_request.created";

describe('workflowRunWebhook', () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(async () => {
    context = buildContext();
    request = buildHttpRequest();
    request.headers.set('X-GitHub-Event', 'personal_access_token_request');
  });

  test('it should accept a personal access token request creation', async () => {
    const result = await webhooks.handleWebhookEvent(request, context, personal_access_token_request_created);
    expect(result.body).toBe('Ok');
  });
});
