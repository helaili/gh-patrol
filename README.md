

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

