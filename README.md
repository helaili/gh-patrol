Automate the approval of fine grained Personal Access Tokens in GitHub. You can now define a maximum duration for fine grained PAT and automatically approve or reject them. 

> [!NOTE]
> Organization admins can still create long lived PATs.

# Usage

- Install the application from [my staging environment](https://github.com/apps/gh-patol-staging) onto your organization and authorize it to access the `.github-private` repository. The application is only authorized to access the `gh-patrol.yaml` file, nothing else.
- Restrict the Personal access token settings of your organization so that only fine grained tokens are allowed and require administrator authorization. 
- Create a `gh-patrol.yaml` file in the `.github-private` repository of your organization with a content similar to the following:
```yaml
- name: trusted users
  users:
    - user1
    - user2
  max_duration: 2
- name: super trusted users
  users:
    - user3
    - user4
  max_duration: 5
- name: other users
  users:
    - all
  max_duration: 1
```

Users now need to create a fine grained PAT with a short enough duration. When a user requests a personal access token, the application will check the `gh-patrol.yaml` file to determine the maximum duration of the token. If the user is not listed in the file, the token will be granted for a maximum of 1 day. If the user is listed in the file, the token will be granted for the maximum duration specified in the file. When their token expires, users need to log back to the GitHub website and regenerate the token. It will go through the same approval process and its value will change. 

Cloning repos using `git clone https://github_pat_xxxxxx@github.com/<your organization>/<your repo>`.

> [!WARNING] 
> Users still can use SSH keys to clone repos without the need for a PAT. If you want to enforce the use of PATs, you need to force the use of HTTPS URLs in your organization. Currently, the only way to do this is:
> - use a VPN and block the SSH port
> - configure IP allow lists in your organization to force the use of the VPN

# Deploy your own instance of GitHub Patrol

Create a clone of this repository and follow the instructions below to deploy your own instance of GitHub Patrol.

## Azure Function App
Create an Azure Function App. You will need to downlaod the publish profile from the Azure Portal.

## Configure the OIDC authentication
The deployment workflow needs to authenticate with Azure to deploy the Azure Function App. This is done using OIDC. Follw the instructions [here](https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure?tabs=azure-portal%2Clinux) to configure the OIDC authentication and note the following values: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`.

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
- `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` - The publish profile downloaded from the Azure Function App within the Azure Portal.

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

