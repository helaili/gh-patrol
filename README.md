
# Config

## GitHub App

Create a GitHub App with the following settings:

### Webhook
- URL: `https://<function>.azurewebsites.net/api/webhook`
- Secret: generate a secret for this, for instance using `openssl rand -hex 20`. It will be used as the environment variable and Actions secret `WEBHOOK_SECRET`
### Repository permissions
- Single file: `read` and path: 'gh-patrol.yaml'
### Organization permissions
- Personal access token requests: `read & write`
### Events
- Personal access token request
### Where can this GitHub App be installed?
- Choose `Any account` to use this app for multiple organizations.

After creating the app, note the App ID and download the private key. The private key will be used as the environment variable `PRIVATE_KEY`.

## Environment Variables
- `WEBHOOK_SECRET` - The secret used to sign the webhook payload.
- `APP_ID` - The GitHub App ID.
- `PRIVATE_KEY` - The GitHub App private key.

## Local Development
- `AZURE_FUNCTIONS_ENVIRONMENT` - Set to `Development` when running locally to bypass the need for a Webhook Secret.
- `PRIVATE_KEY_FILE` - The path to the private key file for the GitHub App when running locally. Use this instead of `PRIVATE_KEY` when developping locally.

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

