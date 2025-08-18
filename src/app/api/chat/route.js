import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

// Define the AI models we want to use (Groq models)
const MODELS = [
  { id: 'openai/gpt-oss-20b', name: 'GPT OSS 20B' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' },
  { id: 'moonshotai/kimi-k2-instruct', name: 'Kimi K2' },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B' },
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

    if (!process.env.GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: 'GROQ_API_KEY is not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create promises for all models to respond in parallel
    const modelPromises = MODELS.map(async (model) => {
      try {
        const result = await streamText({
          model: groq(model.id),
          messages: [{ role: 'user', content: message }],
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
