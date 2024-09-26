# Automatic Build Error Debugging with AI (greptile) assistance.
This project uses Greptile to automatically debug build errors whenever they occur.

## Use case
Codebase context can be very important for solving build errors, so I thought this was the perfect place to implement the Greptile API.

## How it works
1. The developer adds this step to their github action workflow, this step sends a post request with their credentials and repo to the server.
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
            "githubToken": "'"${{ github.token }}"'",
            "webhookUrl": "'"${{ secrets.WEBHOOK_URL }}"'"
          }'
```

They can copy the entire step and paste it into their workflow file. 
The only things they would need to change are the server URL, greptile key, github token, and webhook URL.
They need to add these to their github repo secrets. You can find this in the repo settings > secrets and variables > actions > manage env secrets.

2. The server retrieves the build logs from the github API which I accomplished by downloading the logs (Github doesn't have an API for just viewing the logs, only downloading.)

3. The server sends the Build logs with the error to the greptile API. 

4. We send greptiles response of how to fix the error to the webhook URL.


## Self hosting the server via docker

After you have the app on your local machine, and have configured your env variables, you can self host the server via docker using the dockerfile in the repo.

clone the repo: ```git clone https://github.com/Oia20/BuildFailureAutoDebugger.git```

build image: ```docker build -t username/autodebugger:latest .```

push image to dockerhub: ```docker push username/autodebugger:latest```

Then you can host the image whereever you like to host your containers :)


## Future improvements I would make with more time.


This was a quick(ish) project, so if I were to put more time into it I would make some of the following improvements:
1. I would release an official github app, this could eliminate the need for the user to add anything to their workflow file.

2. I would integrate the response into an independent UI instead of sending the responses to discord. 

3. Possibly add many options for where you want to recieve the response, slack, email, discord, etc, ticketing system, etc.

4. Type safety for better maintainability.

5. Automatically index the repo for every build.

6. Support for other CI/CD tools.
