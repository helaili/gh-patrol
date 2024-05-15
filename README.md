
# Config
## Environment Variables
- `WEBHOOK_SECRET` - The secret used to sign the webhook payload.
- `APP_ID` - The GitHub App ID.
- `PRIVATE_KEY` - The GitHub App private key.

## Local Development
- `AZURE_FUNCTIONS_ENVIRONMENT` - Set to `Development` when running locally to bypass the need for a Webhook Secret.
- `PRIVATE_KEY_FILE` - The path to the private key file for the GitHub App when running locally.

# Test
## Test the local ping service locally
- Run from the debugger or the Azure plugin in VSCode or run `npm start` from the terminal.
- Call the ping service from the terminal with the following command:
```bash
curl http://localhost:7071/api/ping
```

## Test the local ping service remotely
- Run from the debugger or the Azure plugin in VSCode or run `npm start` from the terminal.
- Run ngrok from the terminal with the following command:
```bash
ngrok http 7071 --domain your-domain.ngrok.dev
```
Call the ping service from the terminal with the following command:
```bash
curl https://your-domain.ngrok.dev/api/ping
```

