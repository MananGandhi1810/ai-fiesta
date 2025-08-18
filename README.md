# AI Fiesta - Multi-Model Chat App

A chat application that allows you to interact with multiple AI models simultaneously and compare their responses. Built with Next.js and the Vercel AI SDK using Groq, featuring secure authentication with Better Auth.

## Features

- 🤖 Chat with multiple AI models in parallel
- ⚡ Real-time streaming responses with Groq's lightning-fast inference
- 🔐 Secure authentication with email/password and OTP verification
- 🎨 Clean, responsive UI with dark mode support
- 📊 Response comparison with word count and reading time
- 🔄 Chat history with collapsible responses
- 👤 User profiles and session management

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

2. **Set up your environment variables:**
   - Copy `example.env.local` to `.env.local`:
     ```bash
     cp example.env.local .env.local
     ```
   - Update the following variables in `.env.local`:

   **Required API Keys:**
   ```
   GROQ_API_KEY=your_groq_api_key_here
   RESEND_API_KEY=your_resend_api_key_here
   ```

   **Database (PostgreSQL):**
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/aifiesta
   ```

   **Authentication:**
   ```
   BETTER_AUTH_SECRET=your_secret_key_here
   BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
   FROM_EMAIL=noreply@yourdomain.com
   ```

3. **Set up your services:**
   - **Groq API**: Get your API key from [Groq Console](https://console.groq.com/keys)
   - **Resend**: Get your API key from [Resend](https://resend.com/api-keys)
   - **PostgreSQL**: Set up a PostgreSQL database (local or cloud)

4. **Initialize the database:**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

5. **Run the development server:**
   ```bash
   pnpm dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## How It Works

1. **Authentication**: Create an account or sign in with email/password or OTP
2. **Email Verification**: Verify your email address to access the chat features
3. **Chat Interface**: Type your question in the input field
4. **Multi-Model Response**: Press Enter or click Send to get responses from all AI models
5. **Compare Results**: View and compare responses, word counts, and response times
6. **Chat History**: Expand/collapse individual responses for better readability

## API Routes

- `/api/auth/*` - Authentication endpoints (Better Auth)
- `/api/chat-stream` - Streaming endpoint for real-time responses

## Authentication Features

- **Email/Password Authentication**: Secure login with bcrypt password hashing
- **OTP Verification**: Login with one-time passwords sent via email
- **Email Verification**: Account verification required for new users
- **Password Reset**: Secure password reset via email with OTP
- **Session Management**: Persistent sessions with automatic refresh
- **Protected Routes**: Middleware-based route protection

## Tech Stack

- **Framework:** Next.js 15
- **Authentication:** Better Auth with Drizzle ORM
- **Database:** PostgreSQL with Drizzle ORM
- **Email Service:** Resend
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **AI SDK:** Vercel AI SDK with Groq provider
- **Package Manager:** pnpm

## Customization

You can easily modify the models used by editing the `MODELS` array in:
- `src/app/api/chat-stream/route.js`
- `src/app/components/ChatInterface.js`

## License

MIT
