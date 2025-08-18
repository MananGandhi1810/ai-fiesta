# AI Fiesta - Multi-Model Chat App

A chat application that allows you to interact with multiple AI models simultaneously and compare their responses. Built with Next.js and the Vercel AI SDK using Groq.

## Features

- 🤖 Chat with multiple AI models in parallel
- ⚡ Real-time streaming responses with Groq's lightning-fast inference
- 🎨 Clean, responsive UI with dark mode support
- 📊 Response comparison with word count and reading time
- 🔄 Chat history with collapsible responses

## Supported Models

- **GPT OSS 20B** - OpenAI's open-source model
- **Llama 3.1 8B Instant** - Meta's fast and efficient model  
- **Kimi K2** - Moonshot AI's instruction-tuned model
- **Gemma 2 9B** - Google's efficient instruction-tuned model

## Setup

1. **Clone and install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up your Groq API key:**
   - Go to [Groq Console](https://console.groq.com/keys) and sign up for an account
   - Get your API key from the dashboard
   - Copy `example.env.local` to `.env.local`:
     ```bash
     cp example.env.local .env.local
     ```
   - Add your Groq API key to `.env.local`:
     ```
     GROQ_API_KEY=your_actual_api_key_here
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

- `/api/chat-stream` - Streaming endpoint for real-time responses (recommended)

## Tech Stack

- **Framework:** Next.js 15
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **AI SDK:** Vercel AI SDK with OpenRouter provider
- **Package Manager:** pnpm

## Customization

You can easily modify the models used by editing the `MODELS` array in:
- `src/app/api/chat-stream/route.js`
- `src/app/components/ChatInterface.js`

## License

MIT
