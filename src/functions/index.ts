import { app } from "@azure/functions";
import { githubWebhook } from "./githubWebhook";
import { pingWebhook } from "./pingWebhook";

app.http('githubWebhook', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: githubWebhook
});

app.http('ping', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: pingWebhook
});
