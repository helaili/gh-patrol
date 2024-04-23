import { app } from "@azure/functions";
import { webhook } from "./webhook";
import { ping } from "./ping";

app.http('webhook', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: webhook
});

app.http('ping', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: ping
});
