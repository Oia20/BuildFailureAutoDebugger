# Automatic AI Build Error Debugging
This project uses Greptile to automatically debug build errors whenever they occur.

## How it works
1. The developer adds a step to their github action workflow that sends the build logs to the server.
```yaml
      if: failure()
        run: |
          curl -X POST https://serverURL.com/debugger \
          -H "Content-Type: application/json" \
          -d '{
            "logUrl": "'"/repos/${{ github.repository }}/actions/runs/${{ github.run_id }}"'",
            "status": "failure",
            "repo": "'"${{ github.repository }}"'",
            "greptileKey": "'"${{ secrets.GREPTILE_KEY }}"'",
            "githubToken": "'"${{ github.token }}"'"
          }'
```

They can copy the entire step and paste it into their workflow file, the only things they would need to change are the server URL and the greptile key.

2. The server retrieves the build logs from the github API which I accomplished by downloading the logs (Github doesn't have an API for just viewing the logs, only downloading.)




## Self hosting the server via docker

step 1. docker build -t username/autodebugger:latest .  
step 2. docker push username/autodebugger:latest 
