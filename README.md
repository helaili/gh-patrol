
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

After creating the app, note the App ID and download the private key. 

## Environment Variables for local development
- `WEBHOOK_SECRET` - The secret used to sign the webhook payload.
- `APP_ID` - The GitHub App ID.
- `AZURE_FUNCTIONS_ENVIRONMENT` - Set to `Development` when running locally to bypass the need for a Webhook Secret.
- `PRIVATE_KEY_FILE` - The path to the private key file for the GitHub App when running locally. Use this instead of `PRIVATE_KEY` when developping locally.

## GitHub Actions Variables and Secrets for deployment
### Environment secrets (for `production` and `staging` environment)
- `WEBHOOK_SECRET` - The secret used to sign the webhook payload.
- `PRIVATE_KEY` - The base64 enconding of the private key file for the GitHub App. Use the output of the following command as the value.
```bash
base64 -i <your app>.private-key.pem 
```
### Envionment variables (for `production` and `staging` environment)
- `APP_ID` - The GitHub App ID.
### Repository secret
- `AZURE_CLIENT_ID` - The client ID of the Azure Service Principal.
- `AZURE_TENANT_ID` - The tenant ID of the Azure Service Principal.
- `AZURE_SUBSCRIPTION_ID` - The subscription ID of the Azure Service Principal.
### Repository variables
- `AZURE_RESOURCE_GROUP` - The resource group of the Azure Function App.
- `AZURE_FUNCTION_APP_NAME` - The name of the Azure Function App.



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

