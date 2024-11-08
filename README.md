# Build Error Auto-Debugger 🔍

Automatically debug CI/CD build failures using AI-powered analysis through the Greptile API. Get instant, context-aware solutions delivered directly to your webhook endpoint.

## Features ✨

- 🤖 Automatic error analysis using Greptile AI
- 📊 Full build context consideration for accurate debugging
- 🔄 Seamless GitHub Actions integration
- 🎯 Real-time notifications via webhooks
- 🐳 Easy deployment with Docker

## Quick Start 🚀

### 1. Configure GitHub Secrets

Add the following secrets to your repository:
- Go to Repository Settings → Secrets and Variables → Actions → Manage Environment Secrets
- Add these required secrets:
  - `GREPTILE_KEY`: Your Greptile API key
  - `WEBHOOK_URL`: Your webhook endpoint for receiving debug responses
  - Note: `GITHUB_TOKEN` is automatically provided by GitHub Actions

### 2. Add to Your Workflow

Add this step to your GitHub Actions workflow file:

```yaml
- name: Debug Build Failure
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

## Self-Hosting Guide 🏠

### Prerequisites
- Docker installed on your machine
- Access to a container hosting platform

### Deployment Steps

1. Clone the repository:
```bash
git clone https://github.com/Oia20/BuildFailureAutoDebugger.git
```

2. Build the Docker image:
```bash
docker build -t username/autodebugger:latest .
```

3. Push to Docker Hub:
```bash
docker push username/autodebugger:latest
```

4. Deploy the container on your preferred hosting platform

## How It Works 🛠

1. **Trigger**: When a build fails, the GitHub Action automatically triggers the debugger
2. **Log Collection**: The server fetches complete build logs via GitHub's API
3. **Analysis**: Logs are processed through Greptile's AI for intelligent error analysis
4. **Notification**: Debug solutions are sent to your specified webhook endpoint

## Roadmap 🗺️

Future improvements planned for the project:

1. **GitHub App Integration** 
   - Eliminate the need for workflow file modifications
   - Streamlined setup process

2. **Enhanced UI/UX**
   - Dedicated dashboard for error analysis
   - Interactive debugging interface

3. **Extended Notifications**
   - Multi-channel support:
     - Slack
     - Email
     - Discord
     - Ticketing systems

4. **Technical Improvements**
   - TypeScript implementation for better type safety
   - Automatic repository indexing
   - Support for additional CI/CD platforms

## Contributing 🤝

Contributions are welcome! Feel free to open issues or submit pull requests to continue this project!

---

⭐ If you find this project helpful, please consider giving it a star!

For questions or support, please [open an issue](https://github.com/Oia20/BuildFailureAutoDebugger/issues).
