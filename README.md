# AI Fiesta - Multi-Model Chat App

A chat application that allows you to interact with multiple AI models simultaneously and compare their responses. Built with Next.js and the Vercel AI SDK using OpenRouter.

## Features

- 🤖 Chat with multiple AI models in parallel
- ⚡ Real-time streaming responses
- 🎨 Clean, responsive UI with dark mode support
- 📊 Response comparison with word count and reading time
- 🔄 Chat history with collapsible responses

## Supported Models

- **GPT OSS 20B** (OpenAI) - Free tier
- **Qwen3 Coder** (Alibaba) - Free tier, specialized for coding
- **Kimi K2** (Moonshot AI) - Free tier
- **Gemma 3N E2B** (Google) - Free tier

## Setup

1. **Clone and install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up your OpenRouter API key:**
   - Go to [OpenRouter](https://openrouter.ai/) and sign up for an account
   - Get your API key from the dashboard
   - Copy `.env.local.example` to `.env.local`:
     ```bash
     cp .env.local.example .env.local
     ```
   - Add your OpenRouter API key to `.env.local`:
     ```
     OPENROUTER_API_KEY=your_actual_api_key_here
     ```

3. **Run the development server:**
   ```bash
   pnpm dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## How It Works

1. Type your question in the input field
2. Press Enter or click Send
3. Watch as all four AI models respond in parallel
4. Compare their responses, word counts, and response times
5. Expand/collapse individual responses for better readability

## API Routes

- `/api/chat` - Single request endpoint that waits for all models to complete
- `/api/chat-stream` - Streaming endpoint for real-time responses (recommended)

## Tech Stack

- **Framework:** Next.js 15
- **AI SDK:** Vercel AI SDK with OpenRouter provider
- **Styling:** Tailwind CSS
- **Package Manager:** pnpm

## Customization

You can easily modify the models used by editing the `MODELS` array in:
- `src/app/api/chat/route.js`
- `src/app/api/chat-stream/route.js`
- `src/app/components/ChatInterface.js`

## License

MIT
