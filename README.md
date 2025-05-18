
# Mindframe OS MVP - Chrome Extension

This is the Mindframe OS MVP, a "Cognitive Evolution Companion" Chrome Extension designed to be proactive, engaging, and genuinely helpful in developing cognitive skills. It's built with React, Vite, TypeScript, and Tailwind CSS for the extension, and a Cloudflare Worker as a proxy for LLM interactions.

## Project Structure

The project is organized into two main parts:

*   `extension/`: Contains the Chrome Extension code.
    *   `src/`: Source files for the extension.
        *   `assets/`: Static assets like data files, icons, and global styles.
        *   `core_logic/`: Core business logic (MindframeStore, gamification, onboarding).
        *   `content_scripts/`: Scripts injected into web pages.
        *   `popup_src/`: The React/Vite application for the extension's popup.
            *   `components/`: Reusable UI components for the popup.
            *   `views/`: Page-level components for the popup (Onboarding, Profile, Gym, etc.).
        *   `service_worker/`: The extension's background service worker.
        *   `ui_components/`: Shared React components like the InsightCard.
        *   `lib/`: Utility functions.
    *   `public/`: Static assets copied to the build output (e.g., `manifest.json`, `icons/`).
    *   `dist/`: The build output directory for the packed extension.
*   `proxy_worker/`: Contains the Cloudflare Worker code for the LLM proxy.

## Deployment Guide

This guide covers deploying the Cloudflare Worker (LLM Proxy) and the Chrome Extension.

### Prerequisites

1.  **Node.js and npm (or yarn):** Ensure Node.js (which includes npm) is installed from [nodejs.org](https://nodejs.org/).
2.  **Cloudflare Account:** A free Cloudflare account is needed. Sign up at [cloudflare.com](https://www.cloudflare.com/).
3.  **Wrangler CLI:** The Cloudflare command-line tool. Install it globally:
    ```bash
    npm install -g wrangler
    ```
4.  **OpenRouter API Key:** Get an API key from [OpenRouter.ai](https://openrouter.ai/). This is needed for the LLM functionality.

### Part 1: Deploying the Cloudflare Worker (LLM Proxy)

The worker securely handles requests from the extension to the OpenRouter LLM API.

1.  **Navigate to Worker Directory:**
    ```bash
    cd proxy_worker
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Login to Cloudflare:**
    If this is your first time using Wrangler, you'll need to log in:
    ```bash
    npx wrangler login
    ```
    This will open a browser window to authenticate with Cloudflare.

4.  **Set OpenRouter API Key Secret:**
    Your OpenRouter API key needs to be stored as a secret in Cloudflare, accessible by your worker. Replace `YOUR_OPENROUTER_API_KEY_HERE` with your actual key.
    ```bash
    npx wrangler secret put OPENROUTER_API_KEY
    ```
    Wrangler will prompt you to paste your API key.

5.  **Deploy the Worker:**
    ```bash
    npx wrangler deploy
    ```
    After successful deployment, Wrangler will output the URL of your worker (e.g., `https://mindframe-llm-proxy.<your-username>.workers.dev`). **Copy this URL carefully.** You'll need it for the extension configuration.

#### Local Development for the Worker (Optional)

For faster iteration on the worker code without deploying each time:
1.  Create a file named `.dev.vars` in the `proxy_worker/` directory (this file should NOT be committed to version control if it contains real secrets).
2.  Add your OpenRouter API key to `proxy_worker/.dev.vars`:
    ```
    OPENROUTER_API_KEY="sk-or-v1-your-actual-openrouter-key"
    ```
3.  Run the local development server:
    ```bash
    npx wrangler dev
    ```
    This will typically start the worker locally at `http://localhost:8787`. You can then use this local URL (e.g., `http://localhost:8787/api/analyze`) in your extension's `.env` file for local testing.

### Part 2: Building and Loading the Chrome Extension

#### A. Development Setup (Loading as an Unpacked Extension)

1.  **Navigate to Extension Directory:**
    ```bash
    cd extension
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    *   Create a new file named `.env` in the `extension/` directory by copying `extension/.env.example`.
    *   Open `extension/.env` and set the `VITE_CLOUDFLARE_WORKER_URL` variable to the URL of your deployed Cloudflare worker (from Part 1, Step 5), including the `/api/analyze` path.
        Example:
        ```
        VITE_CLOUDFLARE_WORKER_URL=https://mindframe-llm-proxy.<your-username>.workers.dev/api/analyze
        ```
        If you are testing with `wrangler dev` locally, you would use your local worker URL:
        ```
        VITE_CLOUDFLARE_WORKER_URL=http://localhost:8787/api/analyze
        ```

4.  **Build the Extension:**
    This command compiles the extension and places the output in the `extension/dist/` directory.
    ```bash
    npm run build
    ```
    For continuous development, you can use watch mode, which will automatically rebuild when you save file changes:
    ```bash
    npm run build -- --watch
    ```

5.  **Load into Chrome:**
    *   Open Chrome and navigate to `chrome://extensions`.
    *   Enable "Developer mode" using the toggle in the top-right corner.
    *   Click the "Load unpacked" button (usually top-left).
    *   In the file dialog, navigate to your project folder and select the `extension/dist` directory.
    *   Click "Select Folder".

The Mindframe OS extension should now appear in your list of extensions and be active.

#### B. Streamlining Local Development Reloads

*   If using `npm run build -- --watch`, Vite will rebuild on changes. However, you still need to manually reload the extension in Chrome.
*   To automate this, consider using a Chrome extension like "Extensions Reloader," which can detect changes in your unpacked extension's directory and reload it automatically.

#### C. Production Build (Packaging for Chrome Web Store)

1.  **Final Configuration:**
    *   Ensure the `VITE_CLOUDFLARE_WORKER_URL` in your `extension/.env` file points to your **live, deployed Cloudflare Worker URL**.
    *   Update the `version` in `extension/manifest.json` if necessary.

2.  **Production Build:**
    Run the build command:
    ```bash
    npm run build
    ```

3.  **Package the Extension:**
    *   Navigate to the `extension/dist/` directory.
    *   Select all files and folders within `dist/` and create a `.zip` file. (e.g., `mindframe_os_v1.0.0.zip`). **Important:** Zip the *contents* of the `dist` folder, not the `dist` folder itself.

4.  **Upload to Chrome Web Store:**
    *   Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
    *   Click "Add new item" (or select your existing item).
    *   Upload your `.zip` file.
    *   Fill in all required store listing information (description, icons, screenshots, privacy policy, etc.).
    *   Submit for review.

### Troubleshooting

*   **Worker Errors:** If the LLM proxy isn't working, check your Cloudflare Worker logs. You can view these in the Cloudflare dashboard or stream them live using `npx wrangler tail` (in the `proxy_worker` directory). Common issues are incorrect API keys or errors in the worker code.
*   **Extension Errors:**
    *   **Popup:** Right-click the Mindframe OS icon in your Chrome toolbar and select "Inspect popup".
    *   **Service Worker:** On `chrome://extensions`, find Mindframe OS and click "Service worker" (or "Inspect views: service worker").
    *   **Content Script:** Open Developer Tools (F12 or Ctrl+Shift+I) on any webpage where the extension is active and check the "Console" tab.
*   **Build Failures:** Check the terminal output from `npm run build` for specific error messages.

This guide should help you get Mindframe OS deployed and running!
