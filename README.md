# Sentop DevSphere for VS Code

  Bring the full power of [Sentop DevSphere](https://sentop.tech) into your local VS Code editor.

  ## Features

  - **AI Code Generation** — Generate production-ready code using Alex, the 15-member AI expert team (Ctrl+Shift+G)
  - **One-Click Deployment** — Deploy your project to a live hosted URL without leaving VS Code
  - **Project Browser** — Open and browse your Sentop DevSphere projects
  - **Credit Balance** — See your credit balance in the VS Code status bar
  - **Secure Authentication** — API keys stored in VS Code built-in secret storage

  ## Getting Started

  ### 1. Generate an API Key

  1. Log in to [Sentop DevSphere](https://sentop.tech)
  2. Open the user menu and click **VS Code Extension**
  3. Click **Generate Key** and give it a name (e.g. "My MacBook")
  4. Copy the key — it is only shown once

  ### 2. Sign In

  Open the Command Palette (Ctrl+Shift+P / Cmd+Shift+P) and run:

  ```
  > Sentop: Sign In
  ```

  Paste your API key when prompted. Your credit balance appears in the status bar.

  ## Commands

  | Command | Shortcut | Description |
  |---------|----------|-------------|
  | Sentop: Sign In | — | Authenticate with your API key |
  | Sentop: Sign Out | — | Remove stored credentials |
  | Sentop: Generate AI Code | Ctrl+Shift+G | AI code generation in current file |
  | Sentop: View Credit Balance | — | Check your remaining credits |
  | Sentop: Open Project | — | Browse and open your Sentop projects |
  | Sentop: Deploy to Hosting | — | Deploy to a live URL |

  ## Configuration

  | Setting | Default | Description |
  |---------|---------|-------------|
  | sentop.apiBaseUrl | https://sentop.tech | Base URL of your Sentop DevSphere instance |

  ## Credit Costs

  - AI Code Generation: **10 credits**
  - Deployment: **5 credits** (v0.2.0)

  ## Powered by Sentop Solution Limited, United Kingdom
  