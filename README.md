# Multi-Stage Automated CI/CD Pipeline & Orchestration Architecture

HTML/CSS/JavaScript -> Node.js + Express -> Docker -> GitHub Actions -> Cloud

## Step 1 - Node.js + Express application
    npm install
    npm start        # http://localhost:3000
    npm test

## Deploy from the dashboard

The Deploy now button runs the existing GitHub Actions workflow against the configured branch. Add these environment variables to the Express server (or the Render web service):

- `GITHUB_TOKEN`: GitHub token with Actions write access to the repository.
- `GITHUB_REPOSITORY`: repository in `owner/name` format.
- `DEPLOY_TRIGGER_TOKEN`: a private random value of at least 32 characters. Enter this value in the prompt when starting a deployment; it is not stored in the browser.
- `GITHUB_DEPLOY_BRANCH`: optional branch name; defaults to `main`.
- `GITHUB_WORKFLOW_FILE`: optional workflow filename; defaults to `ci.yml`.

The workflow also requires its existing GitHub Actions secrets for Docker Hub, Render, and pipeline status updates. The button reports an error if the deployment credentials or workflow configuration are missing.
