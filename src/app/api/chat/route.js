import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Define the AI models we want to use
const MODELS = [
  { id: 'openai/gpt-oss-20b:free', name: 'GPT OSS 20B' },
  { id: 'qwen/qwen3-coder:free', name: 'Qwen3 Coder' },
  { id: 'moonshotai/kimi-k2:free', name: 'Kimi K2' },
  { id: 'google/gemma-3n-e2b-it:free', name: 'Gemma 3N E2B' },
];

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create promises for all models to respond in parallel
    const modelPromises = MODELS.map(async (model) => {
      try {
        const result = await streamText({
          model: openrouter(model.id),
          prompt: message,
          maxTokens: 1000,
        });

        // Consume the stream to get the full text
        await result.consumeStream();
        
        return {
          modelId: model.id,
          modelName: model.name,
          response: result.text,
          success: true,
        };
      } catch (error) {
        console.error(`Error with model ${model.name}:`, error);
        return {
          modelId: model.id,
          modelName: model.name,
          response: `Error: ${error.message}`,
          success: false,
        };
      }
    });

    // Wait for all models to respond
    const responses = await Promise.all(modelPromises);

    return new Response(JSON.stringify({ responses }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
